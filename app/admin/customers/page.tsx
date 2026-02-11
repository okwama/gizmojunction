import { getAdminCustomers } from '@/lib/actions/admin';
import { Users, Mail, ShoppingBag, DollarSign, Calendar, Search, Filter, ArrowRight, UserPlus, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

export default async function AdminCustomersPage() {
    const customers = await getAdminCustomers();

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white">Customer Base</h1>
                    <p className="text-neutral-500 font-medium mt-1">Nurture relationships and analyze user engagement.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                        <UserPlus className="w-4 h-4" />
                        Invite Customer
                    </button>
                    <button className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 transition-all shadow-sm">
                        <MoreHorizontal className="w-5 h-5 text-neutral-500" />
                    </button>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Total Users</p>
                            <h3 className="text-2xl font-black mt-1">{customers.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Active Buyers</p>
                            <h3 className="text-2xl font-black mt-1">{customers.filter(c => c.orderCount > 0).length}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-violet-500/10 text-violet-600 rounded-2xl">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Avg. Basket</p>
                            <h3 className="text-2xl font-black mt-1">$423.50</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                        placeholder="Search by name, email or phone..."
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 self-end">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-neutral-50 transition-all">
                        <Filter className="w-4 h-4" />
                        Segment
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-neutral-50 transition-all text-neutral-400">
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Customer Profile</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Joined</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Orders</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Total Spend</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                            {customers.map((customer) => (
                                <tr key={customer.id} className="group hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-all">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                                {customer.full_name?.substring(0, 2).toUpperCase() || 'GU'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-neutral-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                    {customer.full_name || 'Anonymous User'}
                                                </span>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Mail className="w-3 h-3 text-neutral-400" />
                                                    <span className="text-xs text-neutral-400 font-medium">customer_id: {customer.id.split('-')[0]}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-sm font-bold text-neutral-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{new Date(customer.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="inline-flex items-center px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-black">
                                            {customer.orderCount} Orders
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="font-black text-sm text-emerald-600">${Number(customer.totalSpend).toFixed(2)}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <Link
                                            href={`/admin/customers/${customer.id}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-blue-600 transition-all"
                                        >
                                            View Profile
                                            <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
