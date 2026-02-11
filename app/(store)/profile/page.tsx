import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { User, Mail, Phone, Calendar, Package, MapPin, ArrowRight, LogOut } from 'lucide-react';
import Link from 'next/link';

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?returnUrl=/profile');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-16">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold mb-12">My Account</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Profile Info */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-8 shadow-sm">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 border-2 border-white dark:border-neutral-800 shadow-xl">
                                        <User className="w-10 h-10 text-blue-600" />
                                    </div>
                                    <h2 className="text-xl font-bold dark:text-white">{profile?.full_name || 'Gizmo User'}</h2>
                                    <p className="text-neutral-500 text-sm mb-6">{user.email}</p>

                                    <div className="grid grid-cols-1 gap-3 w-full">
                                        <button className="w-full py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
                                            Edit Profile
                                        </button>
                                        <form action="/auth/sign-out" method="POST" className="w-full">
                                            <button
                                                type="submit"
                                                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/10 dark:hover:bg-red-900/20 rounded-lg text-sm font-bold border border-red-100 dark:border-red-900/30 transition flex items-center justify-center gap-2"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                                    <div className="flex items-center text-sm">
                                        <Mail className="w-4 h-4 text-neutral-400 mr-3" />
                                        <span className="text-neutral-600 dark:text-neutral-400">{user.email}</span>
                                    </div>
                                    {profile?.phone && (
                                        <div className="flex items-center text-sm">
                                            <Phone className="w-4 h-4 text-neutral-400 mr-3" />
                                            <span className="text-neutral-600 dark:text-neutral-400">{profile.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center text-sm">
                                        <Calendar className="w-4 h-4 text-neutral-400 mr-3" />
                                        <span className="text-neutral-600 dark:text-neutral-400">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-8 shadow-sm">
                                <h3 className="font-bold mb-6 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                                    Default Shipping
                                </h3>
                                <p className="text-sm text-neutral-500 leading-relaxed italic">
                                    No default address saved. You can save one during your next checkout.
                                </p>
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden">
                                <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                                    <h2 className="text-xl font-bold flex items-center">
                                        <Package className="w-5 h-5 mr-2 text-blue-600" />
                                        Recent Orders
                                    </h2>
                                    <Link href="/orders" className="text-sm font-bold text-blue-600 hover:underline">
                                        View All
                                    </Link>
                                </div>

                                {(!orders || orders.length === 0) ? (
                                    <div className="p-12 text-center">
                                        <Package className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                                        <p className="text-neutral-500">You haven't placed any orders yet.</p>
                                        <Link href="/products" className="inline-block mt-4 text-blue-600 font-bold hover:underline">
                                            Start Shopping
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {orders.map((order) => (
                                            <div key={order.id} className="p-8 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition">
                                                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                                    <div>
                                                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Order Number</p>
                                                        <p className="font-bold">#{order.order_number}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Date</p>
                                                        <p className="text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Total</p>
                                                        <p className="font-bold text-blue-600">${Number(order.total).toFixed(2)}</p>
                                                    </div>
                                                    <div>
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <Link
                                                        href={`/orders/${order.id}`}
                                                        className="p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-white dark:hover:bg-neutral-800 transition"
                                                    >
                                                        <ArrowRight className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
