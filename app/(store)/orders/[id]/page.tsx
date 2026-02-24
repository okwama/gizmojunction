import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatPrice } from '@/lib/formatPrice';
import { Package, MapPin, CreditCard, ChevronLeft, CheckCircle2, Clock, Truck, Box, XCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const STATUS_STEPS = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'processing', label: 'Processing', icon: Box },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Package },
];

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/login?returnUrl=/orders/${id}`);
    }

    const { data: order, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                *,
                variant:product_variants (
                    *,
                    product:products (
                        *,
                        images:product_images (url)
                    )
                )
            ),
            payments (*)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (error || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
                    <p className="text-neutral-500 mb-6">We couldn&apos;t find the order you&apos;re looking for.</p>
                    <Link href="/orders" className="text-blue-600 font-bold hover:underline">
                        Back to My Orders
                    </Link>
                </div>
            </div>
        );
    }

    const currentStatusIndex = STATUS_STEPS.findIndex(step => step.key === order.status);
    const isCancelled = order.status === 'cancelled';

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <Link href="/orders" className="inline-flex items-center text-sm font-bold text-neutral-500 hover:text-blue-600 mb-8 transition gap-1">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Orders
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">Order #{order.order_number}</h1>
                            <p className="text-neutral-500 font-bold text-sm">
                                Placed on {new Date(order.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                {order.status}
                            </span>
                        </div>
                    </div>

                    {/* Status Stepper */}
                    {!isCancelled && (
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-8 mb-8 shadow-sm">
                            <div className="relative">
                                {/* Connector Line */}
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-neutral-100 dark:bg-neutral-800 -translate-y-1/2 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 transition-all duration-1000"
                                        style={{ width: `${(currentStatusIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                                    />
                                </div>

                                <div className="relative flex justify-between items-center">
                                    {STATUS_STEPS.map((step, index) => {
                                        const StepIcon = step.icon;
                                        const isCompleted = index <= currentStatusIndex;
                                        const isActive = index === currentStatusIndex;

                                        return (
                                            <div key={step.key} className="flex flex-col items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10 border-4 ${isCompleted
                                                    ? 'bg-blue-600 border-blue-50 text-white dark:border-neutral-900 shadow-lg shadow-blue-600/20'
                                                    : 'bg-white border-white text-neutral-300 dark:bg-neutral-800 dark:border-neutral-900'
                                                    }`}>
                                                    <StepIcon className="w-5 h-5" />
                                                </div>
                                                <div className="absolute top-12 flex flex-col items-center min-w-[120px]">
                                                    <p className={`text-[10px] font-black uppercase tracking-widest text-center ${isCompleted ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'
                                                        }`}>
                                                        {step.label}
                                                    </p>
                                                    {isActive && (
                                                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1 animate-ping" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="mt-20 text-center">
                                <p className="text-sm font-bold text-neutral-600 dark:text-neutral-400">
                                    {isActiveStatusMessage(order.status)}
                                </p>
                            </div>
                        </div>
                    )}

                    {isCancelled && (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl p-8 mb-8 text-center">
                            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Order Cancelled</h2>
                            <p className="text-red-600/80 text-sm font-bold">This order has been cancelled and will not be processed further.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Order Items */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl shadow-sm overflow-hidden text-sm">
                                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
                                    <h2 className="font-black uppercase tracking-widest text-neutral-400">Items ({order.order_items?.length})</h2>
                                </div>
                                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {order.order_items?.map((item: any) => (
                                        <div key={item.id} className="p-6 flex gap-6">
                                            <div className="relative w-20 h-20 bg-neutral-50 dark:bg-neutral-800 rounded-2xl overflow-hidden shrink-0 border border-neutral-100 dark:border-neutral-800">
                                                {item.variant?.product?.images?.[0]?.url ? (
                                                    <Image
                                                        src={item.variant.product.images[0].url}
                                                        alt={item.product_name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-8 h-8 text-neutral-200" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-md mb-1">{item.product_name}</h3>
                                                <p className="text-neutral-500 text-xs mb-2">Variant: {item.variant_name}</p>
                                                <div className="flex justify-between items-center text-sm font-bold">
                                                    <div className="text-neutral-400 tracking-tighter uppercase text-[10px]">
                                                        {item.quantity} x {formatPrice(item.unit_price)}
                                                    </div>
                                                    <div className="text-blue-600">{formatPrice(item.total_price)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-3">
                                    <div className="flex justify-between text-neutral-500 font-bold">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-500 font-bold">
                                        <span>Shipping</span>
                                        <span>{formatPrice(order.shipping_cost)}</span>
                                    </div>
                                    {Number(order.tax) > 0 && (
                                        <div className="flex justify-between text-neutral-500 font-bold">
                                            <span>Tax</span>
                                            <span>{formatPrice(order.tax)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between pt-3 border-t border-neutral-200 dark:border-neutral-700">
                                        <span className="font-black uppercase tracking-widest text-neutral-900 dark:text-white">Total</span>
                                        <span className="font-black text-xl text-blue-600">{formatPrice(order.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Sidebar */}
                        <div className="space-y-6">
                            {/* Shipping info */}
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
                                <h3 className="font-black uppercase tracking-widest text-neutral-400 mb-6 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                    Delivery Info
                                </h3>
                                <div className="space-y-4 text-sm font-bold">
                                    <div>
                                        <p className="text-neutral-900 dark:text-white">{order.shipping_name}</p>
                                        <p className="text-neutral-500 normal-case">{order.shipping_phone}</p>
                                    </div>
                                    <div className="text-neutral-500 normal-case leading-relaxed">
                                        {order.shipping_address}<br />
                                        {order.shipping_city}, {order.shipping_postal_code}
                                    </div>
                                </div>
                            </div>

                            {/* Payment info */}
                            {order.payments?.[0] && (
                                <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
                                    <h3 className="font-black uppercase tracking-widest text-neutral-400 mb-6 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-blue-600" />
                                        Payment
                                    </h3>
                                    <div className="space-y-4 text-sm font-bold">
                                        <div className="flex justify-between items-center">
                                            <span className="text-neutral-500">Method</span>
                                            <span className="uppercase">{order.payments[0].payment_method?.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-neutral-500">Status</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest ${order.payments[0].status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {order.payments[0].status}
                                            </span>
                                        </div>
                                        {order.payments[0].transaction_id && (
                                            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                                <p className="text-[10px] text-neutral-400 uppercase mb-1">Transaction ID</p>
                                                <p className="text-[10px] font-mono break-all">{order.payments[0].transaction_id}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Order assistance */}
                            <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                                <h3 className="font-black text-sm uppercase mb-2">Need help?</h3>
                                <p className="text-xs text-neutral-500 mb-4 font-bold">If you have any questions about your order, please contact our support team.</p>
                                <Link
                                    href="/support/contact"
                                    className="block text-center py-3 bg-white dark:bg-neutral-800 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition"
                                >
                                    Contact Support
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function isActiveStatusMessage(status: string) {
    switch (status) {
        case 'pending': return 'Your order has been placed and is awaiting confirmation.';
        case 'confirmed': return 'The seller has confirmed your order and is preparing it for fulfillment.';
        case 'processing': return 'Your items are being picked, packed, and prepared for dispatch.';
        case 'shipped': return 'Your order is on the way! It has been handed over to our delivery partner.';
        case 'delivered': return 'Package delivered! We hope you enjoy your new gizmos.';
        default: return 'No detailed status information available.';
    }
}
