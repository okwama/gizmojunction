import Skeleton from "@/components/ui/Skeleton";

export default function LoginLoading() {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-[32px] p-8 sm:p-12 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center gap-4">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-12 w-full rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-12 w-full rounded-2xl" />
                    </div>
                </div>

                <Skeleton className="h-14 w-full rounded-2xl mt-4" />

                <div className="flex justify-center">
                    <Skeleton className="h-4 w-40" />
                </div>
            </div>
        </div>
    );
}
