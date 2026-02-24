'use client';

import { useComparison } from './ComparisonContext';
import { GitCompare, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompareButtonProps {
    productId: string;
    className?: string;
    variant?: 'icon' | 'full';
}

export default function CompareButton({ productId, className, variant = 'icon' }: CompareButtonProps) {
    const { addToComparison, removeFromComparison, isInComparison } = useComparison();
    const active = isInComparison(productId);

    const toggleComparison = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (active) {
            removeFromComparison(productId);
        } else {
            addToComparison(productId);
        }
    };

    if (variant === 'full') {
        return (
            <button
                onClick={toggleComparison}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm",
                    active
                        ? "bg-blue-600 text-white shadow-blue-600/20"
                        : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-blue-600 hover:text-blue-600",
                    className
                )}
            >
                {active ? <Check className="w-4 h-4" /> : <GitCompare className="w-4 h-4" />}
                {active ? 'In Comparison' : 'Add to Compare'}
            </button>
        );
    }

    return (
        <button
            onClick={toggleComparison}
            title={active ? "Remove from comparison" : "Add to comparison"}
            className={cn(
                "p-2 rounded-full transition-all border shadow-sm flex items-center justify-center",
                active
                    ? "bg-blue-600 border-blue-600 text-white scale-110 shadow-blue-600/30"
                    : "bg-white/80 dark:bg-neutral-900/80 border-white/20 text-neutral-600 dark:text-neutral-400 hover:text-blue-600 hover:border-blue-600",
                className
            )}
        >
            {active ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
    );
}
