import { getAdminOrders } from '@/lib/actions/admin';
import { ShoppingCart, Package, Truck, CheckCircle2, XCircle, Clock, Filter, Search, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { updateOrderStatus } from '@/lib/actions/admin';

export default async function AdminOrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>;
}) {
    const params = await searchParams;
    const status = params.status || 'all';
    const orders = await getAdminOrders(status);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'delivered':
            case 'completed':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'processing':
            case 'shipped':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'cancelled':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            default:
                return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        }
    };

    const StatusIcon = ({ status }: { status: string }) => {
        switch (status) {
            case 'delivered': return <CheckCircle2 className="w-3 h-3" />;
            case 'shipped': return <Truck className="w-3 h-3" />;
            case 'processing': return <Clock className="w-3 h-3" />;
            case 'cancelled': return <XCircle className="w-3 h-3" />;
            default: return <Clock className="w-3 h-3" />;
        }
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white">Order Vault</h1>
                    <p className="text-neutral-500 font-medium mt-1">Manage and fulfill customer requests with precision.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            placeholder="Search orders..."
                            className="pl-11 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 outline-none w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap items-center gap-2">
                {[
                    { label: 'All Orders', value: 'all', icon: ShoppingCart },
                    { label: 'Pending', value: 'pending', icon: Clock },
                    { label: 'Processing', value: 'processing', icon: Package },
                    { label: 'Shipped', value: 'shipped', icon: Truck },
                    { label: 'Delivered', value: 'delivered', icon: CheckCircle2 },
                    { label: 'Cancelled', value: 'cancelled', icon: XCircle },
                ].map((item) => (
                    <Link
                        key={item.value}
                        href={`/admin/orders?status=${item.value}`}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${status === item.value
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                                : 'bg-white dark:bg-neutral-900 text-neutral-500 border-neutral-200 dark:border-neutral-800 hover:border-blue-600 hover:text-blue-600'
                            }`}
                    >
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                    </Link>
                ))}
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Order ID</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Customer</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Total</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                                                <ShoppingCart className="w-8 h-8 text-neutral-300" />
                                            </div>
                                            <h3 className="text-lg font-bold">No orders found</h3>
                                            <p className="text-neutral-500 text-sm">Tailor your search or filter to find specific records.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="group hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-sm text-neutral-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                    #{order.order_number}
                                                </span>
                                                <span className="text-[10px] text-neutral-400 font-bold uppercase mt-0.5 tracking-tight">ID: {order.id.split('-')[0]}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-sm font-bold text-neutral-600 dark:text-neutral-400">
                                                <span>{new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center text-[10px] font-black text-blue-600">
                                                    {order.shipping_name?.substring(0, 2).toUpperCase() || 'GS'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold">{order.shipping_name || 'Guest User'}</span>
                                                    <span className="text-xs text-neutral-500 truncate max-w-[150px]">{order.shipping_email || 'No email'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-black text-sm text-blue-600">${Number(order.total).toFixed(2)}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyles(order.status)}`}>
                                                <StatusIcon status={order.status} />
                                                {order.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 hover:bg-white dark:hover:bg-neutral-800 rounded-lg border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 transition-all text-neutral-400 hover:text-blue-600">
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-sm"
                                                >
                                                    Manage
                                                    <ArrowRight className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="px-8 py-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
                    <p className="text-xs font-bold text-neutral-500">Showing {orders.length} results</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-black disabled:opacity-50" disabled>Previous</button>
                        <button className="px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-black disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
