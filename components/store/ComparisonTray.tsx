'use client';

import { useComparison } from './ComparisonContext';
import { X, GitCompare, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ProductPreview {
    id: string;
    name: string;
    image?: string;
}

export default function ComparisonTray() {
    const { comparisonList, removeFromComparison, clearComparison } = useComparison();
    const [products, setProducts] = useState<ProductPreview[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const supabase = createClient();

    const fetchProducts = useCallback(async (ids: string[]) => {
        const { data, error } = await supabase
            .from('products')
            .select('id, name, product_images(url)')
            .in('id', ids);

        if (data) {
            const formatted = data.map(p => ({
                id: p.id,
                name: p.name,
                image: p.product_images?.[0]?.url
            }));
            setProducts(formatted);
        }
    }, [supabase]);

    useEffect(() => {
        if (comparisonList.length > 0) {
            setIsVisible(true);
            fetchProducts(comparisonList);
        } else {
            setIsVisible(false);
            setProducts([]);
        }
    }, [comparisonList, fetchProducts]);

    if (!isVisible || comparisonList.length === 0) return null;

    return (
        <div className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-[45] w-full max-w-4xl px-4 animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl bg-white/90 dark:bg-neutral-900/90">
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                            <GitCompare className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-neutral-900 dark:text-white">
                            Compare Products <span className="text-neutral-400 font-bold ml-1">({comparisonList.length}/4)</span>
                        </h4>
                    </div>
                    <button
                        onClick={clearComparison}
                        className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-red-500 transition-colors"
                    >
                        Clear All
                    </button>
                </div>

                <div className="p-4 flex items-center justify-between gap-6">
                    <div className="flex flex-1 items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                        {products.map((product) => (
                            <div key={product.id} className="relative group shrink-0">
                                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
                                    {product.image ? (
                                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <GitCompare className="w-6 h-6 text-neutral-300" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => removeFromComparison(product.id)}
                                    className="absolute -top-2 -right-2 bg-neutral-900 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {product.name}
                                </div>
                            </div>
                        ))}

                        {/* Placeholder slots */}
                        {Array.from({ length: 4 - products.length }).map((_, i) => (
                            <div key={`empty-${i}`} className="w-16 h-16 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-center text-neutral-300 shrink-0">
                                <GitCompare className="w-4 h-4 opacity-50" />
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href={`/compare?ids=${comparisonList.join(',')}`}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            Compare Now
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
