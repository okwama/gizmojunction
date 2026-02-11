'use client';

import { useState } from 'react';
import { adjustInventory } from '@/lib/actions/inventory';
import {
    Plus,
    Minus,
    Package,
    Warehouse as WarehouseIcon,
    Check,
    X,
    Loader2
} from 'lucide-react';

interface Warehouse {
    id: string;
    name: string;
}

interface Variant {
    id: string;
    sku: string;
    name: string;
    products: {
        name: string;
    } | null;
}

interface InventoryAdjustFormProps {
    warehouses: Warehouse[];
    variants: Variant[];
}

export default function InventoryAdjustForm({ warehouses, variants }: InventoryAdjustFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [variantId, setVariantId] = useState('');
    const [warehouseId, setWarehouseId] = useState('');
    const [amount, setAmount] = useState(0);
    const [type, setType] = useState<'purchase' | 'sale' | 'adjustment' | 'return'>('adjustment');
    const [notes, setNotes] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await adjustInventory(variantId, warehouseId, amount, type, notes);
            setIsOpen(false);
            setVariantId('');
            setWarehouseId('');
            setAmount(0);
            setNotes('');
        } catch (error) {
            console.error('Adjustment failed:', error);
            alert('Failed to adjust inventory');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
            >
                <Plus className="w-4 h-4" />
                Quick Adjust
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Stock Adjustment</h2>
                        <p className="text-xs text-neutral-500 font-bold mt-1 uppercase tracking-widest">Update item levels manually</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors text-neutral-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Target Product SKU</label>
                            <div className="relative group">
                                <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-blue-600 transition-colors" />
                                <select
                                    required
                                    value={variantId}
                                    onChange={(e) => setVariantId(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none transition-all text-sm font-bold appearance-none"
                                >
                                    <option value="">Select Variant...</option>
                                    {variants.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.sku} - {v.products?.name} ({v.name})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Warehouse Location</label>
                            <div className="relative group">
                                <WarehouseIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-blue-600 transition-colors" />
                                <select
                                    required
                                    value={warehouseId}
                                    onChange={(e) => setWarehouseId(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none transition-all text-sm font-bold appearance-none"
                                >
                                    <option value="">Select Warehouse...</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Type</label>
                                <select
                                    value={type}
                                    onChange={(e: any) => setType(e.target.value)}
                                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none transition-all text-sm font-bold appearance-none text-center"
                                >
                                    <option value="adjustment">Adjustment</option>
                                    <option value="purchase">Purchase (In)</option>
                                    <option value="sale">Sale (Out)</option>
                                    <option value="return">Return</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Quantity Change</label>
                                <input
                                    type="number"
                                    required
                                    placeholder="0"
                                    value={amount}
                                    onChange={(e) => setAmount(parseInt(e.target.value))}
                                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none transition-all text-sm font-black text-center"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Internal Notes</label>
                            <textarea
                                placeholder="Reason for adjustment, PO#, etc."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none transition-all text-sm min-h-[100px] resize-none font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-2xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !variantId || !warehouseId || amount === 0}
                            className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Post Adjustment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
