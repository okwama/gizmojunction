'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getInventory() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('inventory_levels')
        .select(`
            id,
            quantity,
            updated_at,
            warehouse_id,
            warehouses (
                name,
                code
            ),
            variant_id,
            product_variants (
                sku,
                name,
                product_id,
                products (
                    name
                )
            )
        `)
        .order('id');

    if (error) {
        console.error('Error fetching inventory:', error);
        return [];
    }

    return data;
}

export async function getWarehouses() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .order('name');

    if (error) return [];
    return data;
}

export async function adjustInventory(
    variantId: string,
    warehouseId: string,
    amount: number,
    type: 'purchase' | 'sale' | 'adjustment' | 'return',
    notes?: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // 1. Record movement
    const { error: movementError } = await supabase
        .from('inventory_movements')
        .insert({
            variant_id: variantId,
            warehouse_id: warehouseId,
            quantity_change: amount,
            movement_type: type,
            notes,
            created_by: user.id
        });

    if (movementError) throw new Error(`Movement error: ${movementError.message}`);

    // 2. Update or Insert level
    const { data: existingLevel } = await supabase
        .from('inventory_levels')
        .select('quantity')
        .eq('variant_id', variantId)
        .eq('warehouse_id', warehouseId)
        .single();

    if (existingLevel) {
        const { error: updateError } = await supabase
            .from('inventory_levels')
            .update({ quantity: existingLevel.quantity + amount })
            .eq('variant_id', variantId)
            .eq('warehouse_id', warehouseId);

        if (updateError) throw new Error(`Update error: ${updateError.message}`);
    } else {
        const { error: insertError } = await supabase
            .from('inventory_levels')
            .insert({
                variant_id: variantId,
                warehouse_id: warehouseId,
                quantity: amount
            });

        if (insertError) throw new Error(`Insert error: ${insertError.message}`);
    }

    revalidatePath('/admin/inventory');
    revalidatePath('/admin/dashboard');
}

export async function getInventoryMovements(variantId?: string) {
    const supabase = await createClient();

    let query = supabase
        .from('inventory_movements')
        .select(`
            *,
            warehouses (name),
            product_variants (sku, name)
        `)
        .order('created_at', { ascending: false });

    if (variantId) {
        query = query.eq('variant_id', variantId);
    }

    const { data, error } = await query.limit(50);

    if (error) return [];
    return data;
}

export async function getVariants() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('product_variants')
        .select(`
            id,
            sku,
            name,
            products (
                name
            )
        `)
        .order('sku');

    if (error) return [];
    return data;
}
