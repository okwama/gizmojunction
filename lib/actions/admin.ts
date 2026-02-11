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
        return { error: `Failed to update settings: ${error.message}` };
    }

    revalidatePath('/admin/settings');
    return { success: true };
}
