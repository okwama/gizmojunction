'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/formatPrice';
import { Tag, Plus, Trash2, Edit, Check, X, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function CouponManager() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        type: 'percentage' as 'percentage' | 'fixed',
        value: 0,
        min_purchase: 0,
        usage_limit: '',
        expires_at: ''
    });

    const supabase = createClient();

    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('Failed to fetch coupons');
        } else {
            setCoupons(data || []);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    async function handleAddCoupon() {
        if (!newCoupon.code || newCoupon.value <= 0) {
            toast.error('Please fill required fields');
            return;
        }

        const { error } = await supabase
            .from('coupons')
            .insert({
                code: newCoupon.code.toUpperCase(),
                type: newCoupon.type,
                value: newCoupon.value,
                min_purchase: newCoupon.min_purchase,
                usage_limit: newCoupon.usage_limit ? parseInt(newCoupon.usage_limit) : null,
                expires_at: newCoupon.expires_at || null
            });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Coupon created successfully');
            setShowAddModal(false);
            setNewCoupon({
                code: '',
                type: 'percentage',
                value: 0,
                min_purchase: 0,
                usage_limit: '',
                expires_at: ''
            });
            fetchCoupons();
        }
    }

    async function toggleCouponStatus(id: string, currentStatus: boolean) {
        const { error } = await supabase
            .from('coupons')
            .update({ is_active: !currentStatus })
            .eq('id', id);

        if (error) {
            toast.error('Failed to update status');
        } else {
            fetchCoupons();
        }
    }

    async function deleteCoupon(id: string) {
        if (!confirm('Are you sure you want to delete this coupon?')) return;

        const { error } = await supabase
            .from('coupons')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Failed to delete coupon');
        } else {
            toast.success('Coupon deleted');
            fetchCoupons();
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">Coupon Management</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Create and manage discount codes for your customers</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-4 h-4" />
                    New Coupon
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {coupons.length === 0 ? (
                        <div className="col-span-full bg-neutral-50 dark:bg-neutral-900 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center text-neutral-500">
                            <Tag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="font-bold">No coupons found</p>
                            <p className="text-sm">Create your first coupon to boost sales!</p>
                        </div>
                    ) : (
                        coupons.map((coupon) => (
                            <div
                                key={coupon.id}
                                className={`bg-white dark:bg-neutral-900 border ${coupon.is_active ? 'border-neutral-200 dark:border-neutral-800' : 'border-red-100 dark:border-red-900/40 opacity-75'} rounded-2xl p-6 shadow-sm hover:shadow-md transition group overflow-hidden relative`}
                            >
                                {/* Coupon Design */}
                                <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-600/5 dark:bg-blue-600/10 rounded-full group-hover:scale-110 transition duration-500" />

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded">
                                                {coupon.code}
                                            </span>
                                            {!coupon.is_active && (
                                                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-600 text-[10px] font-black uppercase tracking-widest rounded">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                                            {coupon.type === 'percentage' ? `${coupon.value}%` : formatPrice(coupon.value)}
                                            <span className="text-xs font-bold text-neutral-400 ml-1 uppercase">Off</span>
                                        </h3>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                                            className={`p-2 rounded-lg transition ${coupon.is_active ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-red-50 hover:text-red-600' : 'bg-green-100 dark:bg-green-900/40 text-green-600'}`}
                                            title={coupon.is_active ? "Deactivate" : "Activate"}
                                        >
                                            {coupon.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => deleteCoupon(coupon.id)}
                                            className="p-2 border border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400 relative z-10">
                                    <div className="flex justify-between">
                                        <span>Min Purchase:</span>
                                        <span className="font-bold text-neutral-900 dark:text-white">{formatPrice(coupon.min_purchase)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Usage:</span>
                                        <span className="font-bold text-neutral-900 dark:text-white">
                                            {coupon.usage_count} / {coupon.usage_limit || '∞'}
                                        </span>
                                    </div>
                                    {coupon.expires_at && (
                                        <div className="flex justify-between italic text-xs pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Expires:</span>
                                            <span>{new Date(coupon.expires_at).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-900 rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Create New Coupon</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase text-neutral-400 mb-2">Coupon Code</label>
                                <input
                                    type="text"
                                    value={newCoupon.code}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g. SUMMER40"
                                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase text-neutral-400 mb-2">Type</label>
                                    <select
                                        value={newCoupon.type}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as any })}
                                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (KES)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-neutral-400 mb-2">Value</label>
                                    <input
                                        type="number"
                                        value={newCoupon.value}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, value: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase text-neutral-400 mb-2">Min Purchase</label>
                                    <input
                                        type="number"
                                        value={newCoupon.min_purchase}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, min_purchase: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-neutral-400 mb-2">Usage Limit</label>
                                    <input
                                        type="number"
                                        value={newCoupon.usage_limit}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, usage_limit: e.target.value })}
                                        placeholder="No limit"
                                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase text-neutral-400 mb-2">Expiry Date</label>
                                <input
                                    type="date"
                                    value={newCoupon.expires_at}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, expires_at: e.target.value })}
                                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition"
                                />
                            </div>

                            <button
                                onClick={handleAddCoupon}
                                className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Create Coupon
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
