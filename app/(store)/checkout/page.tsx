import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import CheckoutForm from '@/components/store/CheckoutForm';
import { getStoreConfig } from '@/lib/actions/storeConfig';

export default async function CheckoutPage() {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const cartId = cookieStore.get('cartId')?.value;

    if (!cartId) {
        redirect('/cart');
    }

    const { data: { user } } = await supabase.auth.getUser();
    let initialData = { name: '', email: '', phone: '' };

    if (user) {
        initialData.email = user.email || '';
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, phone')
            .eq('id', user.id)
            .single();

        if (profile) {
            initialData.name = profile.full_name || '';
            initialData.phone = profile.phone || '';
        }
    }

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
        redirect('/cart');
    }

    const cartItems = cart.cart_items;
    const subtotal = cartItems.reduce((sum, item: any) => {
        const price = Number(item.product_variants.products.base_price) + Number(item.product_variants.price_adjustment);
        return sum + (price * item.quantity);
    }, 0);

    const storeConfig = await getStoreConfig();

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-16">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-12">Checkout</h1>
                <CheckoutForm cartItems={cartItems} subtotal={subtotal} initialData={initialData} storeConfig={storeConfig} />
            </div>
        </div>
    );
}
