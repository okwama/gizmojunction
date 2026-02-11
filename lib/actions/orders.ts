'use server';

import { cookies } from 'next/headers';

export type ShippingAddress = {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postal_code: string;
};

export async function createOrder(shippingInfo: ShippingAddress, notes?: string) {
    try {
        const supabase = await createClient();
        const cookieStore = await cookies();
        const cartId = cookieStore.get('cartId')?.value;

        if (!cartId) {
            return { error: 'Your cart session has expired. Please try again.' };
        }

        // 1. Get current user (optional)
        const { data: { user } } = await supabase.auth.getUser();

        // 2. Get cart items using cartId
        const { data: cart } = await supabase
            .from('carts')
            .select(`
            id,
            cart_items (
                id,
                quantity,
                variant_id,
                product_variants (
                    id,
                    name,
                    price_adjustment,
                    products (
                        id,
                        name,
                        base_price
                    )
                )
            )
        `)
            .eq('id', cartId)
            .single();

        if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
            return { error: 'Your cart is empty.' };
        }

        // 3. Calculate totals
        const subtotal = cart.cart_items.reduce((sum, item: any) => {
            const price = Number(item.product_variants.products.base_price) + Number(item.product_variants.price_adjustment);
            return sum + (price * item.quantity);
        }, 0);

        const tax = subtotal * 0.1; // Assume 10% tax for now
        const shipping_cost = subtotal > 500 ? 0 : 50; // Free shipping over $500
        const total = subtotal + tax + shipping_cost;

        // 4. Create order
        const orderNumber = `ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                order_number: orderNumber,
                user_id: user?.id || null, // Ensure database allows null here
                status: 'pending',
                subtotal,
                tax,
                shipping_cost,
                total,
                shipping_name: shippingInfo.name,
                shipping_email: shippingInfo.email,
                shipping_phone: shippingInfo.phone,
                shipping_address: shippingInfo.address,
                shipping_city: shippingInfo.city,
                shipping_postal_code: shippingInfo.postal_code,
                notes
            })
            .select()
            .single();

        if (orderError) {
            console.error('Order creation error:', orderError);
            return { error: 'Failed to create order. Please try again.' };
        }

        // 5. Create order items
        const orderItems = cart.cart_items.map((item: any) => ({
            order_id: order.id,
            variant_id: item.variant_id,
            product_name: item.product_variants.products.name,
            variant_name: item.product_variants.name,
            quantity: item.quantity,
            unit_price: Number(item.product_variants.products.base_price) + Number(item.product_variants.price_adjustment),
            total_price: (Number(item.product_variants.products.base_price) + Number(item.product_variants.price_adjustment)) * item.quantity
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Order items creation error:', itemsError);
            // Attempt cleanup
            await supabase.from('orders').delete().eq('id', order.id);
            return { error: 'Failed to create order items. Please try again.' };
        }

        // 6. Clear cart and remove cookie
        await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cart.id);

        cookieStore.delete('cartId');

        // 7. Success! Redirect to success page
        revalidatePath('/orders');
        revalidatePath('/cart');
        revalidatePath('/profile');
        revalidatePath('/', 'layout');

        redirect(`/checkout/success?order=${order.order_number}`);
    } catch (error) {
        console.error('Unexpected error during checkout:', error);
        return { error: 'An unexpected error occurred. Please try again later.' };
    }
}
