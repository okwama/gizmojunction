import { createClient } from '@/lib/supabase/server';
import {
    Package,
    ShoppingCart,
    DollarSign,
    Users,
    TrendingUp,
    ArrowUpRight,
    Search,
    Filter,
    Box
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch dashboard stats
    const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

    const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

    const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, order_number, status, total, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    const stats = [
        {
            name: 'Total Products',
            value: productsCount || 0,
            icon: Package,
            color: 'bg-blue-500',
            trend: '+4.5%',
            desc: 'Items in catalog'
        },
        {
            name: 'Total Orders',
            value: ordersCount || 0,
            icon: ShoppingCart,
            color: 'bg-emerald-500',
            trend: '+12.1%',
            desc: 'Lifetime orders'
        },
        {
            name: 'Total Revenue',
            value: '$12,450.00',
            icon: DollarSign,
            color: 'bg-violet-500',
            trend: '+8.2%',
            desc: 'Gross income'
        },
        {
            name: 'New Customers',
            value: '142',
            icon: Users,
            color: 'bg-orange-500',
            trend: '+2.4%',
            desc: 'Registered users'
        },
    ];

    return (
        <div className="space-y-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white">Dashboard Overview</h1>
                    <p className="text-neutral-500 font-medium mt-1">Real-time performance metrics for Gizmo Junction.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-bold shadow-sm hover:bg-neutral-50 transition-all">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                        <TrendingUp className="w-4 h-4" />
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Stats Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="group bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-xl transition-all relative overflow-hidden">
                        <div className="flex justify-between items-start relative z-10">
                            <div className={`p-4 ${stat.color} rounded-2xl text-white shadow-lg`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1 text-emerald-500 font-black text-xs bg-emerald-500/10 px-2 py-1 rounded-full">
                                <ArrowUpRight className="w-3 h-3" />
                                {stat.trend}
                            </div>
                        </div>
                        <div className="mt-6 relative z-10">
                            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">{stat.name}</p>
                            <h3 className="text-3xl font-black text-neutral-900 dark:text-white mt-1">{stat.value}</h3>
                            <p className="text-xs text-neutral-400 font-medium mt-1">{stat.desc}</p>
                        </div>
                        {/* Subtle Background Pattern */}
                        <div className="absolute -bottom-4 -right-4 text-neutral-50 opacity-5 group-hover:scale-110 transition-transform">
                            <stat.icon size={120} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Insights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders Table */}
                <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black">Recent Orders</h3>
                            <p className="text-sm text-neutral-500 font-medium leading-none mt-1">Monitor your latest transaction flow.</p>
                        </div>
                        <Link href="/admin/orders" className="text-xs font-black text-blue-600 hover:underline uppercase tracking-widest">View All Orders</Link>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-neutral-50 dark:border-neutral-800">
                                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-neutral-400">Order ID</th>
                                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-neutral-400">Customer</th>
                                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-neutral-400">Amount</th>
                                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-neutral-400">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                                {recentOrders?.map((order) => (
                                    <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                                        <td className="px-8 py-5 font-bold text-sm">#{order.order_number}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-[10px] font-black text-blue-600 uppercase">
                                                    JD
                                                </div>
                                                <span className="text-sm font-bold">Anonymous Guest</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 font-black text-sm">${order.total.toFixed(2)}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'completed'
                                                ? 'bg-emerald-500/10 text-emerald-500'
                                                : order.status === 'processing'
                                                    ? 'bg-blue-500/10 text-blue-500'
                                                    : 'bg-amber-500/10 text-amber-500'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: Activity or Analytics Mini-card */}
                <div className="space-y-8">
                    <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/20">
                        <h3 className="text-2xl font-black leading-tight relative z-10">Stock Alerts!</h3>
                        <p className="text-blue-100 text-sm font-medium mt-2 relative z-10">5 products are currently running low on stock. Take action now to avoid delays.</p>
                        <Link href="/admin/inventory" className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white text-blue-600 rounded-xl text-sm font-black shadow-lg relative z-10 hover:bg-neutral-50 transition-all">
                            Manage Inventory
                            <Package className="w-4 h-4" />
                        </Link>
                        <Package className="absolute -bottom-8 -right-8 opacity-20 rotate-12" size={180} />
                    </div>

                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm">
                        <h3 className="text-xl font-black">Top Selling</h3>
                        <div className="mt-6 space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-xs font-black">IMG</div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold truncate">Premium Smart Watch X</div>
                                        <div className="text-xs text-neutral-500">234 sales this month</div>
                                    </div>
                                    <div className="font-black text-emerald-500 text-sm">+$4.2k</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
