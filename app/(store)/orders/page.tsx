import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/formatPrice';
import { Package, ChevronLeft, Box, ArrowRight, Clock, CheckCircle2, Truck, XCircle, ShoppingBag } from 'lucide-react';

const STATUS_CONFIG: Record<string, { color: string, icon: any }> = {
    'pending': { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    'confirmed': { color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
    'processing': { color: 'bg-blue-100 text-blue-700', icon: Box },
    'shipped': { color: 'bg-indigo-100 text-indigo-700', icon: Truck },
    'delivered': { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    'cancelled': { color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default async function OrdersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-neutral-900 p-12 rounded-[32px] shadow-2xl text-center max-w-md border border-neutral-100 dark:border-neutral-800">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-black mb-4 uppercase tracking-tight">Sign in to track orders</h1>
                    <p className="text-neutral-500 font-bold mb-8 text-sm leading-relaxed">
                        You need to be logged in to view your complete order history and real-time tracking updates.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                    >
                        Sign In Now
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
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-16">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Order History</h1>
                            <p className="text-neutral-500 font-bold text-sm">Managing your recent and past gizmo purchases</p>
                        </div>
                        <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-md transition">
                            Continue Shopping
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {(!orders || orders.length === 0) ? (
                        <div className="bg-white dark:bg-neutral-900 rounded-[40px] p-20 text-center border border-neutral-100 dark:border-neutral-800 shadow-sm">
                            <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-8">
                                <Package className="w-10 h-10 text-neutral-200" />
                            </div>
                            <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">No orders found</h2>
                            <p className="text-neutral-500 font-bold mb-10 text-sm">
                                It looks like you haven&apos;t placed any orders with us yet.
                            </p>
                            <Link
                                href="/products"
                                className="inline-block px-10 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-600/20"
                            >
                                Browse Catalogue
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => {
                                const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                                const StatusIcon = status.icon;

                                return (
                                    <div key={order.id} className="bg-white dark:bg-neutral-900 p-8 rounded-[32px] shadow-sm border border-neutral-100 dark:border-neutral-800 hover:shadow-md transition group">
                                        <div className="flex flex-wrap items-center justify-between gap-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-neutral-50 dark:bg-neutral-800 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition">
                                                    <StatusIcon className={`w-7 h-7 ${status.color.split(' ')[1]}`} />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">Order Number</div>
                                                    <div className="font-black text-lg">#{order.order_number}</div>
                                                </div>
                                            </div>

                                            <div className="hidden lg:block">
                                                <div className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">Order Date</div>
                                                <div className="text-sm font-bold text-neutral-600 dark:text-neutral-400">
                                                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">Total Value</div>
                                                <div className="font-black text-blue-600 text-lg">{formatPrice(order.total)}</div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                                                    {order.status}
                                                </div>
                                                <Link
                                                    href={`/orders/${order.id}`}
                                                    className="px-8 py-3 bg-neutral-900 dark:bg-neutral-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition shadow-lg shadow-neutral-900/10"
                                                >
                                                    Track Order
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
