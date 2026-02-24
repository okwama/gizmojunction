import { getCart } from '@/lib/actions/cart';
import CartItem from '@/components/store/CartItem';
import { formatPrice } from '@/lib/formatPrice';
import Link from 'next/link';

export default async function CartPage() {
    const cart = await getCart();

    const items = cart?.cart_items || [];
    const subtotal = items.reduce((sum: number, item: any) => {
        const price = item.variant.product.base_price + (item.variant.price_adjustment || 0);
        return sum + (price * item.quantity);
    }, 0);

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                        <div className="text-6xl mb-4">🛒</div>
                        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
                        <p className="text-gray-600 mb-6">
                            Start shopping to add items to your cart
                        </p>
                        <Link
                            href="/products"
                            className="inline-block px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-black text-slate-900 mb-8">Shopping Cart</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="flex-1 bg-white rounded-xl shadow-sm p-6 max-h-fit">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b">
                            <h2 className="font-semibold text-lg text-slate-800">{items.length} Items</h2>
                        </div>

                        <div className="space-y-2">
                            {items.map((item: any) => (
                                <CartItem key={item.id} item={item} />
                            ))}
                        </div>
                    </div>

                    {/* Cart Summary */}
                    <div className="lg:w-96">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <h2 className="font-semibold text-lg mb-6 text-slate-800">Order Summary</h2>

                            <div className="space-y-3 text-slate-600 mb-6 font-medium">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="text-slate-900">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax</span>
                                    <span>Calculated at checkout</span>
                                </div>
                            </div>

                            <div className="border-t pt-4 mb-6">
                                <div className="flex justify-between font-bold text-xl text-slate-900">
                                    <span>Total</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="block w-full bg-primary-600 text-white py-4 rounded-lg font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-600/20 text-center"
                            >
                                Proceed to Checkout
                            </Link>

                            <div className="mt-4 text-center">
                                <Link href="/products" className="text-primary-600 hover:underline text-sm font-medium">
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
