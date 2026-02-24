'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleWishlist(productId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    // Check if item exists
    const { data: existing } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

    if (existing) {
        // Remove
        await supabase
            .from('wishlists')
            .delete()
            .eq('id', existing.id);

        revalidatePath('/wishlist');
        revalidatePath(`/products/${productId}`);
        return { added: false };
    } else {
        // Add
        await supabase
            .from('wishlists')
            .insert({
                user_id: user.id,
                product_id: productId
            });

        revalidatePath('/wishlist');
        revalidatePath(`/products/${productId}`);
        return { added: true };
    }
}

export async function isInWishlist(productId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

    return !!data;
}

export async function getWishlist() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data } = await supabase
        .from('wishlists')
        .select(`
            id,
            created_at,
            product:products (
                id,
                name,
                slug,
                base_price,
                description,
                featured,
                product_images (url, alt_text)
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return data || [];
}
