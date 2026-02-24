import { ProductCardSkeleton } from "@/components/ui/Skeleton";

export default function StoreLoading() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-12">
            <div className="flex flex-col gap-4">
                <div className="h-8 w-64 bg-neutral-100 dark:bg-neutral-900 rounded-lg animate-pulse" />
                <div className="h-4 w-32 bg-neutral-100 dark:bg-neutral-900 rounded-lg animate-pulse" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
