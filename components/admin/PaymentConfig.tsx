'use client';

import { useState, useTransition } from 'react';
import { updateBatchStoreSettings } from '@/lib/actions/admin';
import { CreditCard, Truck, Smartphone, Save, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentConfigProps {
    initialConfig: Record<string, any>;
}

export default function PaymentConfig({ initialConfig }: PaymentConfigProps) {
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);

    // Payment settings
    const [codEnabled, setCodEnabled] = useState(initialConfig.payment_cod_enabled !== false);
    const [mpesaEnabled, setMpesaEnabled] = useState(initialConfig.payment_mpesa_enabled !== false);
    const [stripeEnabled, setStripeEnabled] = useState(initialConfig.payment_stripe_enabled === true);
    const [mpesaPaybill, setMpesaPaybill] = useState(initialConfig.payment_mpesa_paybill || '');
    const [mpesaAccount, setMpesaAccount] = useState(initialConfig.payment_mpesa_account || '');

    const handleSave = () => {
        setSaved(false);
        startTransition(async () => {
            const settings: Record<string, any> = {
                payment_cod_enabled: codEnabled,
                payment_mpesa_enabled: mpesaEnabled,
                payment_stripe_enabled: stripeEnabled,
                payment_mpesa_paybill: mpesaPaybill || '',
                payment_mpesa_account: mpesaAccount || '',
            };

            const result = await updateBatchStoreSettings(settings);

            if (result?.error) {
                toast.error(`Failed to save settings: ${result.error}`);
            } else {
                setSaved(true);
                toast.success('Payment configuration saved!');
                setTimeout(() => setSaved(false), 2000);
            }
        });
    };

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden transition-colors">
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-lg">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black">Payment Gateways</h3>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all ${saved
                        ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                        : 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700'
                        } disabled:opacity-50`}
                >
                    {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {isPending ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}
                </button>
            </div>
            <div className="p-6 space-y-6">
                <div className="space-y-4">
                    {/* Cash on Delivery */}
                    <div className="flex items-center justify-between p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                                <Truck className="w-5 h-5 text-neutral-600" />
                            </div>
                            <div>
                                <h4 className="font-bold">Cash on Delivery</h4>
                                <p className="text-xs text-neutral-500">Enable customers to pay upon receipt</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={codEnabled}
                                onChange={(e) => setCodEnabled(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* Stripe Card */}
                    <div className="flex items-center justify-between p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold">Stripe (Card Payments)</h4>
                                    <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">New</span>
                                </div>
                                <p className="text-xs text-neutral-500">Accept Visa, Mastercard, Amex via Stripe</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={stripeEnabled}
                                onChange={(e) => setStripeEnabled(e.target.checked)} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    {stripeEnabled && (
                        <div className="ml-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 font-medium">
                            ⚡ Set <code className="bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded font-mono">STRIPE_SECRET_KEY</code> and <code className="bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded font-mono">STRIPE_WEBHOOK_SECRET</code> in your environment variables to activate Stripe payments.
                        </div>
                    )}

                    {/* M-Pesa STK Push */}
                    <div className="flex items-center justify-between p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Smartphone className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold">M-Pesa (STK Push)</h4>
                                    <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Real-time</span>
                                </div>
                                <p className="text-xs text-neutral-500">Send automatic payment request to customer&apos;s phone</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={mpesaEnabled}
                                onChange={(e) => setMpesaEnabled(e.target.checked)} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                {/* M-Pesa Configuration */}
                {mpesaEnabled && (
                    <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 animate-in fade-in slide-in-from-top-4 duration-300">
                        <h4 className="text-sm font-bold mb-3">M-Pesa Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-neutral-500 tracking-widest">Paybill Number</label>
                                <input
                                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-blue-600 rounded-xl outline-none transition-all text-sm font-bold"
                                    placeholder="e.g. 123456"
                                    value={mpesaPaybill}
                                    onChange={(e) => setMpesaPaybill(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-neutral-500 tracking-widest">Account Name</label>
                                <input
                                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-blue-600 rounded-xl outline-none transition-all text-sm font-bold"
                                    placeholder="e.g. Gizmo Junction"
                                    value={mpesaAccount}
                                    onChange={(e) => setMpesaAccount(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
