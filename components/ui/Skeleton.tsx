'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-md",
                className
            )}
        />
    );
}

// Complex Skeletons
export function ProductCardSkeleton() {
    return (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-100 dark:border-neutral-800 p-4 space-y-4">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
        </div>
    );
}

export function OrderRowSkeleton() {
    return (
        <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
            <div className="flex items-center gap-6">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24 rounded-full" />
            </div>
        </div>
    );
}
