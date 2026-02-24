'use client';

import { useEffect, useState, useRef } from 'react';
import { ShoppingBag, ChevronUp } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';
import AddToCart from './AddToCart';

interface StickyBuyBarProps {
    product: {
        id: string;
        name: string;
        base_price: number;
        product_variants?: any[];
    };
}

export default function StickyBuyBar({ product }: StickyBuyBarProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show bar after scrolling down 500px
            if (window.scrollY > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
            {/* Desktop / Tablet Bar */}
            <div className="hidden sm:block bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] backdrop-blur-xl bg-white/90 dark:bg-neutral-900/90">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="hidden md:block w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex-shrink-0" />
                        <div className="min-w-0">
                            <h3 className="font-black text-sm text-neutral-900 dark:text-white truncate">{product.name}</h3>
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{formatPrice(product.base_price)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                            <AddToCart
                                productId={product.id}
                                variantId={product.product_variants?.[0]?.id}
                                className="!py-2.5 !px-6 !text-xs"
                            />
                        </div>
                        <button
                            onClick={scrollToTop}
                            className="p-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
                        >
                            <ChevronUp className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Bar */}
            <div className="sm:hidden bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 p-4 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest leading-none mb-1">Price</p>
                        <p className="text-lg font-black text-blue-600 dark:text-blue-400 leading-none">{formatPrice(product.base_price)}</p>
                    </div>
                    <div className="flex-1">
                        <AddToCart
                            productId={product.id}
                            variantId={product.product_variants?.[0]?.id}
                            className="!w-full !py-3 !text-xs shadow-lg shadow-blue-600/20"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
