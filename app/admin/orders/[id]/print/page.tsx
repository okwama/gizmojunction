import { getAdminOrderById } from '@/lib/actions/admin';
import { formatPrice } from '@/lib/formatPrice';
import { notFound } from 'next/navigation';
import { FileText } from 'lucide-react';
import PrintControl from '@/components/admin/PrintControl';

export default async function OrderPrintPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ type?: 'delivery' | 'quotation' | 'receipt' }>;
}) {
    const { id } = await params;
    const { type = 'receipt' } = await searchParams;
    const order = await getAdminOrderById(id);

    if (!order) {
        notFound();
    }

    const isPaid = order.status === 'delivered' || order.status === 'completed'; // Simple heuristic for now

    const getTitle = () => {
        switch (type) {
            case 'delivery': return 'DELIVERY NOTE';
            case 'quotation': return 'PRO-FORMA QUOTATION';
            case 'receipt': return isPaid ? 'OFFICIAL RECEIPT' : 'RETAIL INVOICE';
            default: return 'DOCUMENT';
        }
    };

    return (
        <div className="min-h-screen bg-white text-black p-8 font-serif">
            {/* Control Bar (Hidden on print) */}
            <PrintControl orderId={id} title={getTitle()} />

            {/* Document Body */}
            <div className="max-w-4xl mx-auto border-2 border-neutral-100 p-12 shadow-sm print:shadow-none print:border-none">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-black pb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter mb-2">GIZMO JUNCTION</h1>
                        <p className="text-xs uppercase font-bold text-neutral-500 tracking-widest">Premium Electronics & Accessories</p>
                        <div className="mt-4 text-sm space-y-1">
                            <p>Moi Avenue, Nairobi, Kenya</p>
                            <p>Phone: +254 700 000 000</p>
                            <p>Email: sales@gizmojunction.com</p>
                            <p>PIN: P000000000Z</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-black text-blue-600 mb-2">{getTitle()}</h2>
                        <div className="text-sm space-y-1">
                            <p><span className="font-bold">Number:</span> #{type === 'quotation' ? 'QT' : type === 'delivery' ? 'DN' : 'INV'}-{order.order_number}</p>
                            <p><span className="font-bold">Date:</span> {new Date().toLocaleDateString()}</p>
                            <p><span className="font-bold">Order Ref:</span> #{order.order_number}</p>
                        </div>
                    </div>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-2 gap-12 py-10 border-b border-neutral-100">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3">Bill To:</h3>
                        <p className="font-bold text-lg">{order.shipping_name}</p>
                        <p className="text-sm text-neutral-600">{order.shipping_email}</p>
                        <p className="text-sm text-neutral-600">{order.shipping_phone}</p>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3">Ship To:</h3>
                        <p className="font-bold text-sm">{order.shipping_name}</p>
                        <p className="text-sm text-neutral-600">{order.shipping_address}</p>
                        <p className="text-sm text-neutral-600">{order.shipping_city}, {order.shipping_postal_code}</p>
                        <p className="text-sm text-neutral-600 font-bold mt-1 uppercase">Kenya</p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="py-10">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-neutral-200">
                                <th className="py-4 text-xs font-black uppercase tracking-widest">Description</th>
                                <th className="py-4 text-xs font-black uppercase tracking-widest text-center">Qty</th>
                                {type !== 'delivery' && (
                                    <>
                                        <th className="py-4 text-xs font-black uppercase tracking-widest text-right">Unit Price</th>
                                        <th className="py-4 text-xs font-black uppercase tracking-widest text-right">Amount</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {order.order_items.map((item: any) => (
                                <tr key={item.id}>
                                    <td className="py-4">
                                        <p className="font-bold text-sm">{item.product_name}</p>
                                        <p className="text-[10px] uppercase text-neutral-500 font-medium tracking-tight">{item.variant_name}</p>
                                    </td>
                                    <td className="py-4 text-center text-sm font-bold">{item.quantity}</td>
                                    {type !== 'delivery' && (
                                        <>
                                            <td className="py-4 text-right text-sm">{formatPrice(Number(item.unit_price))}</td>
                                            <td className="py-4 text-right text-sm font-bold">{formatPrice(Number(item.total_price))}</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Totals */}
                {type !== 'delivery' && (
                    <div className="border-t-2 border-black pt-6 flex justify-end">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-500 uppercase font-bold tracking-widest text-xs">Subtotal</span>
                                <span className="font-bold text-neutral-700">{formatPrice(Number(order.subtotal))}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-500 uppercase font-bold tracking-widest text-xs">Shipping</span>
                                <span className="font-bold text-neutral-700">{formatPrice(Number(order.shipping_cost))}</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-neutral-200">
                                <span className="text-sm font-black uppercase tracking-widest">Total Amount</span>
                                <span className="text-xl font-black text-blue-600">{formatPrice(Number(order.total))}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Document Status / Notes */}
                <div className="mt-20 grid grid-cols-2 gap-20 items-end">
                    <div className="space-y-4">
                        <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-lg">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Instructions / Notes</h4>
                            <p className="text-xs text-neutral-600 leading-relaxed font-serif italic">
                                {type === 'delivery' ? 'Goods received in good condition.' : 'Thank you for your business. This document is valid for 30 days.'}
                            </p>
                        </div>
                        {type === 'delivery' && (
                            <div className="pt-10">
                                <div className="border-t border-black w-48 mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Receiver&apos;s Signature</p>
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        {type === 'receipt' && isPaid && (
                            <div className="inline-block border-4 border-emerald-500 text-emerald-500 px-6 py-2 rounded-xl text-3xl font-black uppercase rotate-[-5deg] opacity-70 mb-8">
                                PAID
                            </div>
                        )}
                        <div className="space-y-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Authorized Signature</p>
                            <div className="h-10 border-b border-black mb-2" />
                            <p className="text-sm font-black">Gizmo Junction Operations</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Branding */}
                <div className="mt-20 pt-8 border-t border-neutral-100 text-center">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em]">www.gizmojunction.com</p>
                </div>
            </div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; margin: 0; padding: 0; }
                    .min-h-screen { min-height: 0 !important; }
                    .max-w-4xl { max-width: 100% !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
                }
            `}} />
        </div>
    );
}
