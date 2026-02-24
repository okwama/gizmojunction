'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder, ShippingAddress } from '@/lib/actions/orders';
import { formatPrice } from '@/lib/formatPrice';
import { ShoppingBag, Truck, CreditCard, ChevronRight, ChevronLeft, Loader2, Tag, X } from 'lucide-react';
import { validateCoupon } from '@/lib/actions/coupons';

type Step = 'shipping' | 'review' | 'processing';

export default function CheckoutForm({ cartItems, subtotal, initialData, storeConfig }: {
    cartItems: any[],
    subtotal: number,
    initialData?: { name: string; email: string; phone: string },
    storeConfig: Record<string, any>
}) {
    const router = useRouter();
    const [step, setStep] = useState<Step>('shipping');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ id: string, code: string, discountAmount: number } | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);

    const [mpesaPhone, setMpesaPhone] = useState(initialData?.phone || '');
    const [mpesaStatus, setMpesaStatus] = useState<'idle' | 'pushing' | 'waiting' | 'success' | 'error'>('idle');
    const [mpesaMessage, setMpesaMessage] = useState('');

    const [shippingInfo, setShippingInfo] = useState<ShippingAddress>({
        name: initialData?.name || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        address: '',
        city: '',
        postal_code: ''
    });

    const stripeEnabled = storeConfig.payment_stripe_enabled !== false;
    const mpesaSTKEnabled = storeConfig.payment_mpesa_enabled !== false;
    const codEnabled = storeConfig.payment_cod_enabled !== false;

    type PaymentMethod = 'cod' | 'mpesa_stk' | 'stripe';
    const defaultMethod: PaymentMethod = stripeEnabled ? 'stripe' : mpesaSTKEnabled ? 'mpesa_stk' : 'cod';
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(defaultMethod);

    const tax = subtotal * 0.1;
    const shippingCost = subtotal > 500 ? 0 : 50;
    const discountAmount = appliedCoupon?.discountAmount || 0;
    const total = subtotal + tax + shippingCost - discountAmount;

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setCouponLoading(true);
        setCouponError(null);
        try {
            const result = await validateCoupon(couponCode, subtotal);
            setAppliedCoupon(result);
            setCouponCode('');
        } catch (err: any) {
            setCouponError(err.message);
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponError(null);
    };

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
            if (paymentMethod === 'stripe') {
                // 1. Create order first (as 'pending')
                const result = await createOrder(
                    shippingInfo,
                    'stripe',
                    appliedCoupon?.id,
                    appliedCoupon?.discountAmount
                );
                if (result?.error) { setError(result.error); setLoading(false); return; }
                // createOrder returns the orderId and orderNumber for Stripe flow
                const { orderId, orderNumber, cartItemsSnap } = result as any;
                // 2. Create Stripe checkout session
                const res = await fetch('/api/stripe/create-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId, orderNumber, total, items: cartItemsSnap }),
                });
                const { url, error: stripeError } = await res.json();
                if (stripeError) { setError(stripeError); setLoading(false); return; }
                window.location.href = url; // Redirect to Stripe-hosted page
                return;
            }

            if (paymentMethod === 'mpesa_stk') {
                // 1. Create order first
                const result = await createOrder(
                    shippingInfo,
                    'mpesa_stk',
                    appliedCoupon?.id,
                    appliedCoupon?.discountAmount
                );
                if (result?.error) { setError(result.error); setLoading(false); return; }
                const { orderId, orderNumber } = result as any;

                // 2. Trigger STK Push
                setMpesaStatus('pushing');
                setMpesaMessage('Sending payment request to your phone...');
                const res = await fetch('/api/mpesa/stk-push', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: mpesaPhone, amount: total, orderId, orderNumber }),
                });
                const mpesaResult = await res.json();
                if (!mpesaResult.success) {
                    setMpesaStatus('error');
                    setError(mpesaResult.error || 'STK Push failed. Please try again.');
                    setLoading(false);
                    return;
                }
                setMpesaStatus('waiting');
                setMpesaMessage('Check your phone and enter your M-Pesa PIN. Order placed — you will be notified once confirmed.');
                router.push(`/checkout/success?order=${orderNumber}&payment=mpesa_stk`);
                return;
            }

            // COD
            const result = await createOrder(
                shippingInfo,
                'cod',
                appliedCoupon?.id,
                appliedCoupon?.discountAmount
            );
            if (result?.error) {
                setError(result.error);
                setLoading(false);
            }
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
                                    {/* Stripe Card */}
                                    {stripeEnabled && (
                                        <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'stripe'
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-neutral-200 dark:border-neutral-700 hover:border-blue-300'}`}>
                                            <input type="radio" name="payment" value="stripe" checked={paymentMethod === 'stripe'}
                                                onChange={() => setPaymentMethod('stripe')} className="mt-1 mr-3" />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="w-5 h-5 text-blue-600" />
                                                    <span className="font-bold">Credit / Debit Card</span>
                                                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Recommended</span>
                                                </div>
                                                <p className="text-xs text-neutral-500 mt-1">Visa, Mastercard, Amex — powered by Stripe</p>
                                            </div>
                                        </label>
                                    )}

                                    {/* M-Pesa STK Push */}
                                    {mpesaSTKEnabled && (
                                        <>
                                            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'mpesa_stk'
                                                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                                                    : 'border-neutral-200 dark:border-neutral-700 hover:border-green-300'}`}>
                                                <input type="radio" name="payment" value="mpesa_stk" checked={paymentMethod === 'mpesa_stk'}
                                                    onChange={() => setPaymentMethod('mpesa_stk')} className="mt-1 mr-3" />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center justify-center w-5 h-5 bg-green-600 text-white rounded-full text-[8px] font-black">M</span>
                                                        <span className="font-bold">M-Pesa STK Push</span>
                                                        <span className="text-[10px] bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Instant</span>
                                                    </div>
                                                    <p className="text-xs text-neutral-500 mt-1">We send a payment request directly to your M-Pesa</p>
                                                </div>
                                            </label>
                                            {paymentMethod === 'mpesa_stk' && (
                                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 space-y-3">
                                                    <label className="text-xs font-black uppercase tracking-widest text-green-800 dark:text-green-200 block">M-Pesa Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        value={mpesaPhone}
                                                        onChange={(e) => setMpesaPhone(e.target.value)}
                                                        placeholder="e.g. 0712 345 678"
                                                        className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-green-200 dark:border-green-700 rounded-xl text-sm font-bold focus:ring-2 ring-green-500/20 outline-none"
                                                    />
                                                    <p className="text-[10px] text-green-700 dark:text-green-400 font-medium">💡 You will receive an M-Pesa prompt on this number. Enter your PIN to confirm payment.</p>
                                                    {mpesaMessage && (
                                                        <p className={`text-xs font-bold ${mpesaStatus === 'error' ? 'text-red-600' : 'text-green-700 dark:text-green-300'}`}>{mpesaMessage}</p>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Cash on Delivery */}
                                    {codEnabled && (
                                        <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'cod'
                                                ? 'border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50'
                                                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'}`}>
                                            <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'}
                                                onChange={() => setPaymentMethod('cod')} className="mt-1 mr-3" />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Truck className="w-5 h-5 text-neutral-600" />
                                                    <span className="font-bold">Cash on Delivery</span>
                                                </div>
                                                <p className="text-xs text-neutral-500 mt-1">Pay when you receive your order</p>
                                            </div>
                                        </label>
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
                                    {paymentMethod === 'stripe' ? 'Redirecting to Stripe...' :
                                        paymentMethod === 'mpesa_stk' ? 'Sending STK Push...' :
                                            'Placing Order...'}
                                </>
                            ) : (
                                <>
                                    {step === 'shipping' ? 'Review Order' :
                                        paymentMethod === 'stripe' ? 'Pay with Card' :
                                            paymentMethod === 'mpesa_stk' ? 'Send M-Pesa Request' :
                                                'Complete Purchase'}
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

                    {/* Items List */}
                    <div className="space-y-4 mb-8">
                        {cartItems.map((item: any) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-neutral-500 truncate max-w-[150px]">
                                    {item.product_variants.products.name} x {item.quantity}
                                </span>
                                <span className="font-semibold">
                                    {formatPrice((Number(item.product_variants.products.base_price) + Number(item.product_variants.price_adjustment)) * item.quantity)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Coupon Input */}
                    <div className="py-6 border-t border-neutral-100 dark:border-neutral-800">
                        {appliedCoupon ? (
                            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-green-600" />
                                    <span className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-widest">{appliedCoupon.code}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveCoupon}
                                    className="p-1 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-full transition"
                                >
                                    <X className="w-4 h-4 text-green-600" />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Discount Code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="flex-1 px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        disabled={couponLoading || !couponCode}
                                        className="px-4 py-2 bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition disabled:opacity-50"
                                    >
                                        {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                                    </button>
                                </div>
                                {couponError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{couponError}</p>}
                            </div>
                        )}
                    </div>

                    {/* Totals Section */}
                    <div className="space-y-3 pt-6 border-t border-neutral-100 dark:border-neutral-800 text-sm">
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Subtotal</span>
                            <span className="font-semibold">{formatPrice(subtotal)}</span>
                        </div>
                        {appliedCoupon && (
                            <div className="flex justify-between text-green-600 text-[10px] font-black uppercase tracking-widest">
                                <span className="flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    Discount ({appliedCoupon.code})
                                </span>
                                <span className="font-bold">-{formatPrice(appliedCoupon.discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Tax (10%)</span>
                            <span className="font-semibold">{formatPrice(tax)}</span>
                        </div>
                        <div className="flex justify-between pb-6">
                            <span className="text-neutral-500">Shipping</span>
                            <span className="font-semibold">{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span>
                        </div>
                        <div className="flex justify-between pt-6 border-t border-neutral-100 dark:border-neutral-800 text-lg font-bold">
                            <span>Total</span>
                            <span className="text-blue-600">{formatPrice(total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
