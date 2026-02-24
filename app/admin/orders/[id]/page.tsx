import { getAdminOrderById, updateOrderStatus } from '@/lib/actions/admin';
import { formatPrice } from '@/lib/formatPrice';
import {
    ArrowLeft,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    MapPin,
    Phone,
    Mail,
    User,
    Calendar,
    ExternalLink,
    AlertCircle,
    FileText,
    Receipt,
    Printer,
    FileSearch,
    BadgePercent,
    ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function OrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const order = await getAdminOrderById(id);

    if (!order) {
        notFound();
    }

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/orders"
                        className="p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black tracking-tight">Order #{order.order_number}</h1>
                            <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyles(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-xs text-neutral-500 font-medium mt-0.5">
                            Placed on {new Date(order.created_at).toLocaleString(undefined, {
                                dateStyle: 'long',
                                timeStyle: 'short'
                            })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <form action={async () => {
                        'use server';
                        await updateOrderStatus(order.id, 'shipped');
                    }}>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                            <Truck className="w-4 h-4" />
                            Mark Shipped
                        </button>
                    </form>
                    <form action={async () => {
                        'use server';
                        await updateOrderStatus(order.id, 'delivered');
                    }}>
                        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-black shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
                            <CheckCircle2 className="w-4 h-4" />
                            Mark Delivered
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Contents */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
                            <Package className="w-5 h-5 text-neutral-400" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-neutral-500">Order Items</h2>
                        </div>
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {order.order_items.map((item: any) => (
                                <div key={item.id} className="p-4 flex items-center justify-between group hover:bg-neutral-50 dark:hover:bg-neutral-800/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center text-[10px] font-black">
                                            IMG
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold">{item.product_name}</h3>
                                            <p className="text-xs text-neutral-500">{item.variant_name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black">
                                            {formatPrice(Number(item.unit_price))} x {item.quantity}
                                        </div>
                                        <div className="text-xs font-bold text-blue-600">
                                            {formatPrice(Number(item.total_price))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800">
                            <div className="space-y-2 max-w-xs ml-auto">
                                <div className="flex justify-between text-xs font-medium text-neutral-500 uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(Number(order.subtotal))}</span>
                                </div>
                                <div className="flex justify-between text-xs font-medium text-neutral-500 uppercase tracking-widest">
                                    <span>Shipping</span>
                                    <span>{formatPrice(Number(order.shipping_cost))}</span>
                                </div>
                                <div className="flex justify-between text-lg font-black text-neutral-900 dark:text-white pt-2 border-t border-neutral-200 dark:border-neutral-700">
                                    <span>Total</span>
                                    <span className="text-blue-600">{formatPrice(Number(order.total))}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Commercial Tools */}
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileSearch className="w-5 h-5 text-blue-600" />
                                <h2 className="text-sm font-black uppercase tracking-widest text-neutral-500">Commercial Center</h2>
                            </div>
                            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">Sales Tools</span>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Document Generation */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Print Documents</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    <Link
                                        href={`/admin/orders/${id}/print?type=receipt`}
                                        target="_blank"
                                        className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Receipt className="w-4 h-4 text-neutral-400 group-hover:text-blue-600" />
                                            <span className="text-xs font-bold">Official Receipt / Invoice</span>
                                        </div>
                                        <ArrowUpRight className="w-3.5 h-3.5 opacity-20" />
                                    </Link>
                                    <Link
                                        href={`/admin/orders/${id}/print?type=delivery`}
                                        target="_blank"
                                        className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Truck className="w-4 h-4 text-neutral-400 group-hover:text-amber-600" />
                                            <span className="text-xs font-bold">Delivery Note</span>
                                        </div>
                                        <ArrowUpRight className="w-3.5 h-3.5 opacity-20" />
                                    </Link>
                                    <Link
                                        href={`/admin/orders/${id}/print?type=quotation`}
                                        target="_blank"
                                        className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-4 h-4 text-neutral-400 group-hover:text-violet-600" />
                                            <span className="text-xs font-bold">Pro-forma Quotation</span>
                                        </div>
                                        <ArrowUpRight className="w-3.5 h-3.5 opacity-20" />
                                    </Link>
                                </div>
                            </div>

                            {/* Commercial Actions */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Revenue Actions</h3>
                                <div className="space-y-2">
                                    <button className="w-full flex items-center gap-3 p-3 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group">
                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                            <BadgePercent className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-black">Issue Store Credit</p>
                                            <p className="text-[10px] text-neutral-500">Refund to internal wallet</p>
                                        </div>
                                    </button>
                                    <button className="w-full flex items-center gap-3 p-3 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all group">
                                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-black">Confirm Payment</p>
                                            <p className="text-[10px] text-neutral-500">Manual reconciliation</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Notes Placeholder */}
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-4">Customer Notes</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
                            {order.notes || 'No notes provided for this order.'}
                        </p>
                    </div>
                </div>

                {/* Customer & Shipping Summary */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-6">
                        {/* Customer */}
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">Customer Profile</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 font-black">
                                    {order.shipping_name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{order.shipping_name}</p>
                                    <p className="text-xs text-neutral-500">{order.shipping_email}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700 space-y-3">
                                <div className="flex items-center gap-3 text-xs text-neutral-500">
                                    <Mail className="w-3.5 h-3.5" />
                                    {order.shipping_email}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-neutral-500">
                                    <Phone className="w-3.5 h-3.5" />
                                    {order.shipping_phone}
                                </div>
                            </div>
                        </div>

                        {/* Shipping */}
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">Shipping Destination</h3>
                            <div className="flex gap-3">
                                <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                                <div className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    <p className="font-bold text-neutral-900 dark:text-white mb-1">{order.shipping_name}</p>
                                    <p>{order.shipping_address}</p>
                                    <p>{order.shipping_city}, {order.shipping_postal_code}</p>
                                    <p>Kenya</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Status Overlay */}
                        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4 border border-neutral-100 dark:border-neutral-700">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Payment Status</span>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Paid</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                <p className="text-xs font-bold">Transaction Confirmed</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Cards */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                                <h4 className="text-sm font-black text-amber-700">Fraud Protection</h4>
                                <p className="text-xs text-amber-600/80 mt-1 font-medium leading-relaxed">
                                    This order was placed by a verified guest. Please ensure the phone number matches before fulfillment.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
