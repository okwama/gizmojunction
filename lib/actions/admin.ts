'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function createStaffMember(email: string, roleId: string, password?: string) {
    const supabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    let userId: string;

    if (password) {
        // Direct Create Mode
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: email.split('@')[0] } // Default name
        });

        if (error) throw error;
        userId = data.user.id;
    } else {
        // Invite Mode
        const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);

        if (error) throw error;
        userId = data.user.id;
    }

    // Assign Role
    const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role_id: roleId });

    if (roleError) {
        console.error('Failed to assign role:', roleError);
        throw new Error('User created but failed to assign role');
    }

    revalidatePath('/admin/team');
    return { success: true };
}

/**
 * ORDERS
 */

export async function getAdminOrders(status?: string) {
    const supabase = await createClient();

    let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function getAdminOrderById(orderId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                *,
                variant:product_variants (
                    *,
                    product:products (*)
                )
            )
        `)
        .eq('id', orderId)
        .single();

    if (error) throw error;
    return data;
}

export async function updateOrderStatus(orderId: string, status: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

    if (error) throw error;

    revalidatePath('/admin/orders');
    revalidatePath('/admin/dashboard');
    return { success: true };
}

/**
 * CUSTOMERS
 */

export async function getAdminCustomers() {
    const supabase = await createClient();

    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (profileError) throw profileError;

    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('user_id, total');

    if (ordersError) throw ordersError;

    const customers = profiles.map(profile => {
        const userOrders = orders.filter(o => o.user_id === profile.id);
        const totalSpend = userOrders.reduce((sum, o) => sum + Number(o.total), 0);
        return {
            ...profile,
            orderCount: userOrders.length,
            totalSpend
        };
    });

    return customers;
}

export async function getAdminCustomerById(customerId: string) {
    const supabase = await createClient();

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', customerId)
        .single();

    if (profileError) throw profileError;

    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', customerId)
        .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    return {
        ...profile,
        orders
    };
}

/**
 * REVIEWS
 */

export async function getAdminReviews() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('reviews')
        .select(`
            *,
            products (name),
            profiles (full_name)
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function updateReviewStatus(reviewId: string, isApproved: boolean) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('reviews')
        .update({ is_approved: isApproved, updated_at: new Date().toISOString() })
        .eq('id', reviewId);

    if (error) throw error;

    revalidatePath('/admin/reviews');
    return { success: true };
}

/**
 * AUDIT LOGS
 */

export async function getAuditLogs() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) throw error;
    return data;
}

/**
 * STAFF & ROLES
 */

export async function getStaffProfiles() {
    const supabase = await createClient();

    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
            user_id,
            roles (
                id,
                name
            )
        `);

    if (rolesError) throw rolesError;

    const staff = profiles.map(profile => {
        const userRole = userRoles.find(ur => ur.user_id === profile.id);
        return {
            ...profile,
            user_roles: userRole ? [userRole] : []
        };
    });

    return staff;
}

export async function getRoles() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

    if (error) throw error;
    return data;
}

export async function updateStaffRole(userId: string, roleId: string) {
    const supabase = await createClient();

    const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

    if (deleteError) throw deleteError;

    const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role_id: roleId });

    if (insertError) throw insertError;

    revalidatePath('/admin/team');
    return { success: true };
}

/**
 * SETTINGS
 */

export async function getStoreSettings() {
    const supabase = await createClient();

    // We want to return an object { key: value } or array
    const { data: settings, error } = await supabase
        .from('store_settings')
        .select('*');

    if (error) {
        console.error('Error fetching store settings:', error);
        return [];
    }

    return settings;
}

export async function updateStoreSettings(key: string, value: any) {
    const supabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    const { error } = await supabase
        .from('store_settings')
        .upsert({
            key,
            value,
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.error('Error updating store setting:', key, error);
        return { error: `Failed to update settings: ${error.message}` };
    }

    revalidatePath('/admin/settings');
    return { success: true };
}

export async function updateBatchStoreSettings(settings: Record<string, any>) {
    const supabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    const entries = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
        .from('store_settings')
        .upsert(entries);

    if (error) {
        console.error('Error batch updating store settings:', error);
        return { error: `Failed to update settings: ${error.message}` };
    }

    revalidatePath('/admin/settings');
    revalidatePath('/', 'layout');
    return { success: true };
}

export async function uploadAsset(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) {
        return { error: 'No file provided' };
    }

    const supabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `hero/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return { error: `Upload failed: ${uploadError.message}` };
    }

    const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

    return { url: publicUrl };
}

/**
 * MARKETING & ANALYTICS
 */

export async function getAbandonedCarts() {
    const supabase = await createClient();

    // A cart is considered abandoned if it's older than 2 hours and not completed
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from('carts')
        .select(`
            id,
            email,
            created_at,
            updated_at,
            user_id,
            profiles (full_name),
            cart_items (
                id,
                quantity,
                variant:product_variants (
                    name,
                    price_adjustment,
                    product:products (
                        name,
                        base_price
                    )
                )
            )
        `)
        .lt('updated_at', twoHoursAgo);

    if (error) {
        console.error('Error fetching abandoned carts:', error);
        throw error;
    }

    return (data || []).filter(cart => cart.cart_items && cart.cart_items.length > 0);
}

export async function getDashboardAnalytics() {
    const supabase = await createClient();

    // Get last 30 days of orders for trends
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: orders, error } = await supabase
        .from('orders')
        .select('created_at, total, status')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

    if (error) throw error;

    // Process data for charts
    const dailyStats: Record<string, { date: string, revenue: number, orders: number }> = {};

    // Initialize last 30 days
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dailyStats[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
    }

    orders.forEach(order => {
        const dateStr = new Date(order.created_at).toISOString().split('T')[0];
        if (dailyStats[dateStr]) {
            dailyStats[dateStr].orders += 1;
            if (['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)) {
                dailyStats[dateStr].revenue += Number(order.total);
            }
        }
    });

    return Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date));
}

export async function getTopProducts() {
    const supabase = await createClient();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: orderItems, error } = await supabase
        .from('order_items')
        .select(`
            product_name,
            quantity,
            total_price,
            order:orders!inner(created_at, status)
        `)
        .gte('order.created_at', thirtyDaysAgo.toISOString())
        .in('order.status', ['confirmed', 'processing', 'shipped', 'delivered']);

    if (error) throw error;

    // Aggregate by product name
    const productStats: Record<string, { name: string; revenue: number; units: number }> = {};

    (orderItems || []).forEach((item: any) => {
        const name = item.product_name;
        if (!productStats[name]) {
            productStats[name] = { name, revenue: 0, units: 0 };
        }
        productStats[name].revenue += Number(item.total_price);
        productStats[name].units += Number(item.quantity);
    });

    return Object.values(productStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
}
