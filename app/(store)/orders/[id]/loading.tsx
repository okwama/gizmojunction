import Skeleton from "@/components/ui/Skeleton";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function OrderDetailLoading() {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center text-sm font-bold text-neutral-300 mb-8 gap-1">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Orders
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-64" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-8 w-32 rounded-full" />
                    </div>

                    {/* Status Stepper Skeleton */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-8 mb-8 shadow-sm">
                        <div className="relative h-20 flex items-center justify-between">
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-neutral-100 dark:bg-neutral-800 -translate-y-1/2" />
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="w-10 h-10 rounded-full z-10" />
                            ))}
                        </div>
                        <div className="mt-8 flex justify-center">
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <div className="p-6 space-y-6">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex gap-6">
                                            <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
                                            <div className="flex-1 space-y-3">
                                                <Skeleton className="h-5 w-2/3" />
                                                <Skeleton className="h-3 w-1/3" />
                                                <div className="flex justify-between">
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-4 w-20" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
                                <Skeleton className="h-4 w-32" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
                                <Skeleton className="h-4 w-32" />
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
