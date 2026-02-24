import { OrderRowSkeleton } from "@/components/ui/Skeleton";

export default function AdminLoading() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-neutral-100 dark:bg-neutral-900 rounded-lg animate-pulse" />
                    <div className="h-4 w-64 bg-neutral-100 dark:bg-neutral-900 rounded-lg animate-pulse" />
                </div>
                <div className="h-10 w-32 bg-neutral-100 dark:bg-neutral-900 rounded-xl animate-pulse" />
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                    <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse" />
                </div>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {[...Array(6)].map((_, i) => (
                        <OrderRowSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
