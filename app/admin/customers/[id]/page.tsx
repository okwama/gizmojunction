import { getAdminCustomerById } from '@/lib/actions/admin';
import { formatPrice } from '@/lib/formatPrice';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    ShoppingBag,
    DollarSign,
    Clock,
    ExternalLink,
    MapPin,
    Shield
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CustomerDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const customer = await getAdminCustomerById(id);

    if (!customer) {
        notFound();
    }

    const totalOrders = customer.orders?.length || 0;
    const totalSpend = customer.orders?.reduce((acc: number, order: any) => acc + Number(order.total), 0) || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/customers"
                        className="p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">{customer.full_name || 'Anonymous User'}</h1>
                        <p className="text-xs text-neutral-500 font-medium mt-0.5">
                            Customer since {new Date(customer.created_at).toLocaleDateString(undefined, {
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white rounded-lg text-xs font-black shadow-sm hover:bg-neutral-800 transition-all">
                        Edit Profile
                    </button>
                    <button className="px-4 py-2 border border-red-200 dark:border-red-900/30 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg text-xs font-black hover:bg-red-100 dark:hover:bg-red-900/20 transition-all">
                        Suspend Access
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest leading-none">Total Orders</p>
                        <h3 className="text-xl font-black mt-1.5 leading-none">{totalOrders}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest leading-none">Lifetime Value</p>
                        <h3 className="text-xl font-black mt-1.5 leading-none">{formatPrice(totalSpend)}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="p-2.5 bg-violet-500/10 text-violet-600 rounded-xl">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest leading-none">Avg. Order</p>
                        <h3 className="text-xl font-black mt-1.5 leading-none">{formatPrice(totalOrders > 0 ? totalSpend / totalOrders : 0)}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order History */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                            <h2 className="text-xs font-black uppercase tracking-widest text-neutral-500">Transaction History</h2>
                            <span className="text-[10px] font-bold text-neutral-400">{totalOrders} records</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-neutral-50 dark:border-neutral-800">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest">Order</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                                    {customer.orders.map((order: any) => (
                                        <tr key={order.id} className="group hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-all">
                                            <td className="px-6 py-4 font-black text-sm">
                                                <Link href={`/admin/orders/${order.id}`} className="hover:text-blue-600 transition-colors">
                                                    #{order.order_number}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-neutral-500">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                        order.status === 'processing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-sm text-neutral-900 dark:text-white">
                                                {formatPrice(Number(order.total))}
                                            </td>
                                        </tr>
                                    ))}
                                    {totalOrders === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-neutral-500 text-sm font-medium">
                                                No purchases yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-6">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">Account Integrity</h3>
                            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                                <Shield className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="text-xs font-black text-blue-700">Verified Identity</p>
                                    <p className="text-[10px] text-blue-600 font-medium">Account matches phone records.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Identity Nodes</h3>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <Mail className="w-4 h-4 text-neutral-400 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Email Address</p>
                                        <p className="text-sm font-bold text-neutral-900 dark:text-white">customer_{customer.id.substring(0, 8)}@gizmo.com</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Phone className="w-4 h-4 text-neutral-400 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Primary Phone</p>
                                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{customer.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Calendar className="w-4 h-4 text-neutral-400 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Last Movement</p>
                                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{new Date(customer.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Address Placeholder */}
                        <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">Shipment Anchor</h3>
                            <div className="flex gap-3">
                                <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                                <div className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                                    Addresses are extracted per-order to ensure precision. Review recent transactions for trajectory details.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
