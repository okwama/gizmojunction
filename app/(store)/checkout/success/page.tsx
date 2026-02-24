import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, ShoppingBag } from 'lucide-react';

export default async function OrderSuccessPage({
    searchParams
}: {
    searchParams: Promise<{ order?: string }>
}) {
    const params = await searchParams;
    const orderNumber = params.order;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center py-20 px-4">
            <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-12 text-center shadow-xl shadow-neutral-200/50 dark:shadow-none">
                <div className="w-20 h-20 bg-green-50 dark:bg-green-900/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                    Thank you for your purchase. Your order <span className="font-bold text-neutral-900 dark:text-white">#{orderNumber}</span> has been received and is being processed.
                </p>

                <div className="space-y-4">
                    <Link
                        href="/orders"
                        className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                    >
                        <Package className="w-5 h-5" />
                        Track My Order
                    </Link>
                    <Link
                        href="/products"
                        className="w-full flex items-center justify-center gap-2 px-8 py-4 border-2 border-neutral-100 dark:border-neutral-800 font-bold rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        Continue Shopping
                    </Link>
                </div>

                <div className="mt-12 pt-8 border-t border-neutral-100 dark:border-neutral-800">
                    <p className="text-sm text-neutral-500">
                        A confirmation email has been sent to your registered address.
                        If you have any questions, please contact our support.
                    </p>
                </div>
            </div>
        </div>
    );
}
