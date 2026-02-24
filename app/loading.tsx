import { ProductCardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-12">
            {/* Hero Skeleton */}
            <div className="w-full h-[400px] bg-neutral-100 dark:bg-neutral-900 rounded-[40px] animate-pulse" />

            {/* Featured Grid Skeleton */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-48 bg-neutral-100 dark:bg-neutral-900 rounded-lg animate-pulse" />
                    <div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-900 rounded-lg animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                </div>
            </div>

            {/* Support/Footer Skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                <div className="h-32 bg-neutral-100 dark:bg-neutral-900 rounded-3xl animate-pulse" />
                <div className="h-32 bg-neutral-100 dark:bg-neutral-900 rounded-3xl animate-pulse" />
                <div className="h-32 bg-neutral-100 dark:bg-neutral-900 rounded-3xl animate-pulse" />
            </div>
        </div>
    );
}
