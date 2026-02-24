import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatPrice } from '@/lib/formatPrice';
import { User, Mail, Phone, Calendar, Package, MapPin, ArrowRight, LogOut, Box } from 'lucide-react';
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

                        {/* Right Content */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Overview Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="bg-blue-600 rounded-[32px] p-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Total Lifetime Spend</p>
                                    <h3 className="text-3xl font-black mb-4">
                                        {formatPrice(orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0)}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[10px] font-bold bg-white/20 w-fit px-3 py-1 rounded-full">
                                        <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                        Across {orders?.length || 0} Orders
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[32px] p-8 shadow-sm group">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-1">Loyalty Status</p>
                                    <h3 className="text-3xl font-black text-neutral-900 dark:text-white mb-4">Silver Member</h3>
                                    <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                        <div className="w-2/3 h-full bg-blue-600 rounded-full" />
                                    </div>
                                    <p className="text-[10px] font-bold text-neutral-500 mt-3 uppercase tracking-widest">
                                        Spend {formatPrice(5000)} more for Gold
                                    </p>
                                </div>
                            </div>

                            {/* Recent Orders */}
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[32px] shadow-sm overflow-hidden">
                                <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                                    <h2 className="text-xl font-black flex items-center uppercase tracking-tight">
                                        <Package className="w-5 h-5 mr-3 text-blue-600" />
                                        Latest Purchases
                                    </h2>
                                    <Link href="/orders" className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">
                                        See All History
                                    </Link>
                                </div>

                                {(!orders || orders.length === 0) ? (
                                    <div className="p-16 text-center">
                                        <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Package className="w-8 h-8 text-neutral-200" />
                                        </div>
                                        <p className="text-neutral-500 font-bold mb-6">You haven&apos;t placed any orders yet.</p>
                                        <Link href="/products" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition">
                                            Find your first Gizmo
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {orders.map((order) => (
                                            <div key={order.id} className="p-8 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition group/item">
                                                <div className="flex flex-wrap items-center justify-between gap-6">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center group-hover/item:bg-white dark:group-hover/item:bg-neutral-700 transition shadow-sm">
                                                            <Box className="w-6 h-6 text-neutral-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">#{order.order_number}</p>
                                                            <p className="text-sm font-bold text-neutral-900 dark:text-white">
                                                                {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="hidden md:block">
                                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Status</p>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Paid</p>
                                                        <p className="font-black text-neutral-900 dark:text-white">{formatPrice(Number(order.total))}</p>
                                                    </div>
                                                    <Link
                                                        href={`/orders/${order.id}`}
                                                        className="px-6 py-2 border border-neutral-200 dark:border-neutral-700 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white dark:hover:bg-neutral-800 transition flex items-center gap-2"
                                                    >
                                                        Track <ArrowRight className="w-3 h-3" />
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
