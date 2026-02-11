import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function OrdersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md">
                    <h1 className="text-2xl font-bold mb-4">Sign in to view orders</h1>
                    <p className="text-gray-600 mb-6">
                        You need to be logged in to view your order history.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">My Orders</h1>

                {(!orders || orders.length === 0) ? (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <div className="text-4xl mb-4">📦</div>
                        <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                        <p className="text-gray-600 mb-6">
                            You haven&apos;t placed any orders yet.
                        </p>
                        <Link
                            href="/products"
                            className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Order listing implementation */}
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border">
                                <div className="flex justify-between mb-4">
                                    <div>
                                        <div className="font-semibold">Order #{order.order_number}</div>
                                        <div className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div className="font-bold">${order.total.toFixed(2)}</div>
                                </div>
                                <div className="text-sm">
                                    Status: <span className="font-medium capitalize">{order.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
