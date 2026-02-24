import { getAbandonedCarts } from '@/lib/actions/admin';
import { formatPrice } from '@/lib/formatPrice';
import { Trash2, User, Mail, Calendar, Package, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default async function AbandonedCartsPage() {
    const carts = await getAbandonedCarts();

    const calculateTotal = (items: any[]) => {
        return items.reduce((sum, item) => {
            const price = Number(item.variant.product.base_price) + Number(item.variant.price_adjustment || 0);
            return sum + (price * item.quantity);
        }, 0);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight dark:text-white">Abandoned Carts</h1>
                    <p className="text-neutral-500 font-medium">Recover lost sales by monitoring incomplete checkouts.</p>
                </div>
                <div className="bg-blue-600/10 text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-600/20">
                    {carts.length} Active Abandonments
                </div>
            </div>

            <div className="grid gap-6">
                {carts.length === 0 ? (
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-20 text-center">
                        <div className="bg-neutral-50 dark:bg-neutral-800 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-neutral-300">
                            <Trash2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-black mb-2 dark:text-white">No abandoned carts found</h3>
                        <p className="text-neutral-500 max-w-sm mx-auto font-medium">We&apos;ll show carts here that have been inactive for more than 2 hours.</p>
                    </div>
                ) : (
                    carts.map((cart: any) => (
                        <div key={cart.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden hover:shadow-xl transition-shadow group">
                            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                                {/* Customer Info */}
                                <div className="md:w-1/3 space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Potential Customer</div>
                                            <h3 className="font-bold text-lg dark:text-white">{cart.profiles?.full_name || 'Guest User'}</h3>
                                            <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
                                                <Mail className="w-3.5 h-3.5" />
                                                {cart.email || 'No email captured'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-2xl">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> Updated
                                            </div>
                                            <div className="text-xs font-bold dark:text-neutral-200">
                                                {new Date(cart.updated_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-2xl">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1 flex items-center gap-1">
                                                <Package className="w-3 h-3" /> Items
                                            </div>
                                            <div className="text-xs font-bold dark:text-neutral-200">
                                                {cart.cart_items.length} Products
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Estimated Value</div>
                                        <div className="text-3xl font-black text-blue-600">
                                            {formatPrice(calculateTotal(cart.cart_items))}
                                        </div>
                                    </div>
                                </div>

                                {/* Items Preview */}
                                <div className="flex-1 space-y-4">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Cart Contents</div>
                                    <div className="grid gap-3">
                                        {cart.cart_items.map((item: any) => (
                                            <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-100 dark:border-neutral-800/50">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-white dark:bg-neutral-700 rounded-lg flex items-center justify-center border border-neutral-100 dark:border-neutral-600 shrink-0">
                                                        <Package className="w-5 h-5 text-neutral-300" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm dark:text-neutral-200 line-clamp-1">{item.variant.product.name}</div>
                                                        <div className="text-[10px] text-neutral-500 font-medium">Qty: {item.quantity} × {item.variant.name}</div>
                                                    </div>
                                                </div>
                                                <div className="text-sm font-black dark:text-neutral-300">
                                                    {formatPrice((Number(item.variant.product.base_price) + Number(item.variant.price_adjustment || 0)) * item.quantity)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="md:w-48 flex flex-col gap-3 justify-center">
                                    {cart.email ? (
                                        <button className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition flex items-center justify-center gap-2">
                                            Send Email
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <div className="text-center p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-red-600">No Recovery Email</p>
                                        </div>
                                    )}
                                    <button className="w-full py-4 border-2 border-neutral-100 dark:border-neutral-800 text-neutral-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-all flex items-center justify-center gap-2 group/del">
                                        <Trash2 className="w-4 h-4" />
                                        Discard
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
