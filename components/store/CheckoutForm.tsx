'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder, ShippingAddress } from '@/lib/actions/orders';
import { ShoppingBag, Truck, CreditCard, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';

type Step = 'shipping' | 'review' | 'processing';

export default function CheckoutForm({ cartItems, subtotal, initialData }: {
    cartItems: any[],
    subtotal: number,
    initialData?: { name: string; email: string; phone: string }
}) {
    const router = useRouter();
    const [step, setStep] = useState<Step>('shipping');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [shippingInfo, setShippingInfo] = useState<ShippingAddress>({
        name: initialData?.name || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        address: '',
        city: '',
        postal_code: ''
    });

    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'mpesa'>('cod');

    const tax = subtotal * 0.1;
    const shippingCost = subtotal > 500 ? 0 : 50;
    const total = subtotal + tax + shippingCost;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 'shipping') {
            setStep('review');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await createOrder(shippingInfo);
            if (result?.error) {
                setError(result.error);
                setLoading(false);
            }
            // Redirect handled in server action
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Form Steps */}
            <div className="lg:col-span-8">
                {/* Progress Bar */}
                <div className="flex items-center mb-12">
                    <div className={`flex items-center ${step === 'shipping' ? 'text-blue-600' : 'text-neutral-400'}`}>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold mr-3 ${step === 'shipping' ? 'border-blue-600 bg-blue-50' : 'border-neutral-300'}`}>
                            1
                        </div>
                        <span className="font-semibold">Shipping</span>
                    </div>
                    <div className="h-[2px] w-12 bg-neutral-200 mx-4"></div>
                    <div className={`flex items-center ${step === 'review' ? 'text-blue-600' : 'text-neutral-400'}`}>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold mr-3 ${step === 'review' ? 'border-blue-600 bg-blue-50' : 'border-neutral-300'}`}>
                            2
                        </div>
                        <span className="font-semibold">Review</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {step === 'shipping' && (
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-8 shadow-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center">
                                <Truck className="w-5 h-5 mr-2 text-blue-600" />
                                Shipping Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        name="name"
                                        value={shippingInfo.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Phone Number</label>
                                    <input
                                        required
                                        type="tel"
                                        name="phone"
                                        value={shippingInfo.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        value={shippingInfo.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Delivery Address</label>
                                    <textarea
                                        required
                                        name="address"
                                        value={shippingInfo.address}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
                                        placeholder="Street address, Apartment, Suite, etc."
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">City</label>
                                    <input
                                        required
                                        type="text"
                                        name="city"
                                        value={shippingInfo.city}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
                                        placeholder="New York"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Postal Code</label>
                                    <input
                                        required
                                        type="text"
                                        name="postal_code"
                                        value={shippingInfo.postal_code}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
                                        placeholder="10001"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'review' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-8 shadow-sm">
                                <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
                                    <span className="flex items-center">
                                        <Truck className="w-5 h-5 mr-2 text-blue-600" />
                                        Shipping Summary
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setStep('shipping')}
                                        className="text-sm font-semibold text-blue-600 hover:underline"
                                    >
                                        Edit
                                    </button>
                                </h2>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-neutral-500 mb-1">Name</p>
                                        <p className="font-semibold">{shippingInfo.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-500 mb-1">Phone</p>
                                        <p className="font-semibold">{shippingInfo.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-500 mb-1">Email</p>
                                        <p className="font-semibold">{shippingInfo.email}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-neutral-500 mb-1">Address</p>
                                        <p className="font-semibold">{shippingInfo.address}, {shippingInfo.city}, {shippingInfo.postal_code}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-8 shadow-sm">
                                <h2 className="text-xl font-bold mb-6 flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                                    Payment Method
                                </h2>
                                <div className="space-y-4">
                                    {/* Cash on Delivery */}
                                    <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'cod'
                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-neutral-200 dark:border-neutral-700 hover:border-blue-300'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cod"
                                            checked={paymentMethod === 'cod'}
                                            onChange={(e) => setPaymentMethod(e.target.value as 'cod' | 'mpesa')}
                                            className="mt-1 mr-3"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Truck className="w-5 h-5 text-neutral-600" />
                                                <span className="font-bold">Cash on Delivery</span>
                                            </div>
                                            <p className="text-xs text-neutral-500 mt-1">Pay when you receive your order</p>
                                        </div>
                                    </label>

                                    {/* M-Pesa */}
                                    <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'mpesa'
                                            ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                                            : 'border-neutral-200 dark:border-neutral-700 hover:border-green-300'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="mpesa"
                                            checked={paymentMethod === 'mpesa'}
                                            onChange={(e) => setPaymentMethod(e.target.value as 'cod' | 'mpesa')}
                                            className="mt-1 mr-3"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#00A651" />
                                                </svg>
                                                <span className="font-bold">M-Pesa</span>
                                            </div>
                                            <p className="text-xs text-neutral-500 mt-1">Mobile money payment</p>
                                        </div>
                                    </label>

                                    {/* M-Pesa Instructions */}
                                    {paymentMethod === 'mpesa' && (
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                            <h4 className="font-bold text-green-900 dark:text-green-100 mb-2 text-sm">Payment Instructions</h4>
                                            <ol className="text-xs text-green-800 dark:text-green-200 space-y-1.5 list-decimal list-inside">
                                                <li>Go to M-Pesa menu on your phone</li>
                                                <li>Select <strong>Lipa na M-Pesa</strong></li>
                                                <li>Select <strong>Paybill</strong></li>
                                                <li>Enter Business No: <strong className="font-mono bg-green-100 dark:bg-green-900/40 px-1.5 py-0.5 rounded">123456</strong></li>
                                                <li>Enter Account No: <strong className="font-mono bg-green-100 dark:bg-green-900/40 px-1.5 py-0.5 rounded">Gizmo Junction</strong></li>
                                                <li>Enter Amount: <strong className="font-mono bg-green-100 dark:bg-green-900/40 px-1.5 py-0.5 rounded">${total.toFixed(2)}</strong></li>
                                                <li>Enter your M-Pesa PIN and confirm</li>
                                            </ol>
                                            <p className="text-xs text-green-700 dark:text-green-300 mt-3 font-medium">⚠️ Please complete payment before placing your order</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between pt-6">
                        {step === 'review' && (
                            <button
                                type="button"
                                onClick={() => setStep('shipping')}
                                className="px-8 py-3 font-bold text-neutral-600 hover:text-neutral-900 flex items-center"
                            >
                                <ChevronLeft className="w-5 h-5 mr-2" />
                                Back to Shipping
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`ml-auto px-10 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 flex items-center disabled:opacity-50`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Placing Order...
                                </>
                            ) : (
                                <>
                                    {step === 'shipping' ? 'Review Order' : 'Complete Purchase'}
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg text-red-600 text-sm font-semibold">
                            {error}
                        </div>
                    )}
                </form>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-4">
                <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg p-8 shadow-sm sticky top-24">
                    <h2 className="text-lg font-bold mb-6">Order Summary</h2>
                    <div className="space-y-4 mb-8">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-neutral-500 truncate max-w-[150px]">
                                    {item.product_variants.products.name} x {item.quantity}
                                </span>
                                <span className="font-semibold">
                                    ${((Number(item.product_variants.products.base_price) + Number(item.product_variants.price_adjustment)) * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3 pt-6 border-t border-neutral-100 dark:border-neutral-800 text-sm">
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Subtotal</span>
                            <span className="font-semibold">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Tax (10%)</span>
                            <span className="font-semibold">${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pb-6">
                            <span className="text-neutral-500">Shipping</span>
                            <span className="font-semibold">{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between pt-6 border-t border-neutral-100 dark:border-neutral-800 text-lg font-bold">
                            <span>Total</span>
                            <span className="text-blue-600">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
