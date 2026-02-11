'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function getOrCreateCartId() {
    const cookieStore = await cookies();
    const cartId = cookieStore.get('cartId')?.value;

    if (cartId) return cartId;

    // Create new cart
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: cart, error } = await supabase
        .from('carts')
        .insert({
            user_id: user?.id || null,
            session_id: crypto.randomUUID(), // For guest tracking if needed, though UUID ID is enough
        })
        .select('id')
        .single();

    if (error || !cart) {
        console.error('Error creating cart:', error);
        throw new Error('Failed to create cart');
    }

    // Set cookie
    cookieStore.set('cartId', cart.id, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return cart.id;
}

export async function addToCart(productId: string, variantId?: string) {
    const cartId = await getOrCreateCartId();
    const supabase = await createClient();

    // If no variant, try to find default or single variant
    let targetVariantId = variantId;
    if (!targetVariantId) {
        const { data: variants } = await supabase
            .from('product_variants')
            .select('id')
            .eq('product_id', productId)
            .limit(1);

        if (variants && variants.length > 0) {
            targetVariantId = variants[0].id;
        } else {
            // Handle products without variants if schema allows or create implicit variant
            // For now, assume variants exist or we need one
            throw new Error("Product variant required");
        }
    }

    // Check if item exists
    const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cartId)
        .eq('variant_id', targetVariantId)
        .single();

    if (existingItem) {
        await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + 1 })
            .eq('id', existingItem.id);
    } else {
        await supabase
            .from('cart_items')
            .insert({
                cart_id: cartId,
                variant_id: targetVariantId,
                quantity: 1,
            });
    }

    revalidatePath('/', 'layout');
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
    const supabase = await createClient();

    if (quantity <= 0) {
        await supabase.from('cart_items').delete().eq('id', itemId);
    } else {
        await supabase
            .from('cart_items')
            .update({ quantity })
            .eq('id', itemId);
    }

    revalidatePath('/', 'layout');
}

export async function removeFromCart(itemId: string) {
    const supabase = await createClient();
    await supabase.from('cart_items').delete().eq('id', itemId);
    revalidatePath('/', 'layout');
}

export async function getCart() {
    const cookieStore = await cookies();
    const cartId = cookieStore.get('cartId')?.value;

    if (!cartId) return null;

    const supabase = await createClient();
    const { data: cart } = await supabase
        .from('carts')
        .select(`
      id,
      cart_items (
        id,
        quantity,
        variant:product_variants (
          id,
          name,
          price_adjustment,
          product:products (
            id,
            name,
            slug,
            base_price,
            product_images (url)
          )
        )
      )
    `)
        .eq('id', cartId)
        .single();

    return cart;
}
