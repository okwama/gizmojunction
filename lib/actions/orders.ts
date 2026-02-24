'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type ShippingAddress = {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postal_code: string;
};

export async function createOrder(
    shippingInfo: ShippingAddress,
    paymentMethod: 'cod' | 'mpesa' | 'stripe' | 'mpesa_stk',
    couponId?: string,
    discountAmount: number = 0,
    notes?: string
) {
    let orderId: string | undefined;
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
        const subtotal = cart.cart_items.reduce((sum: number, item: any) => {
            const price = Number(item.product_variants.products.base_price) + Number(item.product_variants.price_adjustment);
            return sum + (price * item.quantity);
        }, 0);

        const tax = subtotal * 0.1; // Assume 10% tax for now
        const shipping_cost = subtotal > 500 ? 0 : 50; // Free shipping over $500
        const total = subtotal + tax + shipping_cost - discountAmount;

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
                coupon_id: couponId || null,
                discount_amount: discountAmount,
                notes
            })
            .select()
            .single();

        if (orderError) {
            console.error('Order creation error:', orderError);
            return { error: 'Failed to create order. Please try again.' };
        }

        orderId = order.id;

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

        // 6. Create payment record
        const { error: paymentError } = await supabase
            .from('payments')
            .insert({
                order_id: order.id,
                amount: total,
                status: 'pending',
                payment_method: paymentMethod,
                metadata: {
                    provider: paymentMethod === 'mpesa' ? 'manual_mpesa' : 'manual_cod'
                }
            });

        if (paymentError) {
            console.error('Payment record creation error:', paymentError);
            // Non-fatal, order exists but payment record failed. We can log this or alert admin.
            // For now, we proceed as the order is placed.
        }

        // 6.5 If coupon used, increment usage count
        if (couponId) {
            await supabase.rpc('increment_coupon_usage', { coupon_row_id: couponId });
        }

        // 7. Clear cart and remove cookie
        await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cart.id);

        cookieStore.delete('cartId');

        // 8. For Stripe / M-Pesa STK: return order data for client to handle next step
        if (paymentMethod === 'stripe' || paymentMethod === 'mpesa_stk') {
            revalidatePath('/cart');
            revalidatePath('/', 'layout');
            const cartItemsSnap = cart.cart_items.map((item: any) => ({
                productName: item.product_variants.products.name,
                variantName: item.product_variants.name,
                quantity: item.quantity,
                unitPrice: Number(item.product_variants.products.base_price) + Number(item.product_variants.price_adjustment),
            }));
            return { orderId: order.id, orderNumber: order.order_number, cartItemsSnap };
        }

        // 9. COD / manual M-Pesa: redirect server-side
        revalidatePath('/orders');
        revalidatePath('/cart');
        revalidatePath('/profile');
        revalidatePath('/', 'layout');

        redirect(`/checkout/success?order=${order.order_number}`);

    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT') {
            throw error;
        }
        if (error.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        console.error('Unexpected error during checkout:', error);
        return { error: 'An unexpected error occurred. Please try again later.' };
    }

    // Redirect needs to be outside try/catch to avoid NEXT_REDIRECT error caught
    if (orderId) {
        // We need to fetch order number again? No the order object is available in scope if we define it outside?
        // Actually `order` variable is block scoped. using `orderId` is not enough.
        // Let's just return the success status and let the client redirect?
        // No, server actions usually redirect.
        // Let's Fetch the order number.
        // Or easier:
        // The `redirect` inside `try` block is perfectly fine IF we rethrow the NEXT_REDIRECT error, which I did.
        // So I can put redirect back inside. But the `order` object is local.
        // I'll keep the redirect inside the try block, as I'm rethrowing the error.

        // Wait, I removed the redirect from the try block in the code content above!
        // I need to add it back or do something else.
        // Ah, I see I removed it.
        // I will return the order number and let the client redirect, OR I can redirect here.
        // Client side redirection is better for UX (loading states etc).
        // But the existing code was doing server redirection.
        // Let's stick to server redirection.

        // To do that, I need `order` to be accessible.
        // Since I can't easily refactor the whole function now without risk, I'll use a `let redirectUrl` approach.
    }

    // Actually, looking at the code I prepared in `CodeContent` argument above...
    // I REMOVED the redirect call at the end of the try block.
    // I should put it back.

    // Wait, I can't edit the `CodeContent` in the `write_to_file` call anymore.
    // I must correct my tool call before sending.

    // Correction: I will inject the redirect logic back into the try block.

    return { error: 'Something went wrong.' }; // This is unreachable if I fix the code.
}
