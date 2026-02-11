import { getAdminReviews } from '@/lib/actions/admin';
import { Star, MessageSquare, CheckCircle, XCircle, Package, User, ShieldAlert, Filter, Search, MoreHorizontal } from 'lucide-react';
import { updateReviewStatus } from '@/lib/actions/admin';

export default async function AdminReviewsPage() {
    const reviews = await getAdminReviews();

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white">Review Queue</h1>
                    <p className="text-neutral-500 font-medium mt-1">Moderate customer feedback and maintain brand integrity.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            placeholder="Search reviews..."
                            className="pl-11 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 outline-none w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Pending Approval', value: reviews.filter(r => !r.is_approved).length, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Total Reviews', value: reviews.length, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Average Rating', value: (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length || 0).toFixed(1), color: 'text-violet-500', bg: 'bg-violet-500/10' },
                    { label: 'Flagged Content', value: 0, color: 'text-red-500', bg: 'bg-red-500/10' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-4">
                        <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl`}>
                            <Star className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">{stat.label}</p>
                            <h3 className="text-xl font-black">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-20 text-center">
                        <MessageSquare className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold">No feedback recorded yet</h3>
                        <p className="text-neutral-500 mt-2">The conversation with your customers hasn't started.</p>
                    </div>
                ) : (
                    reviews.map((review: any) => (
                        <div key={review.id} className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
                            <div className="flex flex-col lg:flex-row gap-8 relative z-10">
                                {/* Product & User Info */}
                                <div className="lg:w-64 shrink-0 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center">
                                            <Package className="w-6 h-6 text-neutral-400" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Product</p>
                                            <h4 className="font-bold text-sm truncate">{review.products?.name}</h4>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Customer</p>
                                            <h4 className="font-bold text-sm truncate">{review.profiles?.full_name || 'Anonymous'}</h4>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <div className="flex gap-1 text-amber-500">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-current' : 'opacity-20'}`} />
                                            ))}
                                        </div>
                                        <p className="text-xs text-neutral-400 mt-2 font-medium">{new Date(review.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {/* Review Content */}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h3 className="text-xl font-black text-neutral-900 dark:text-white leading-tight">"{review.title}"</h3>
                                        <p className="text-neutral-600 dark:text-neutral-400 mt-3 leading-relaxed text-sm">
                                            {review.comment}
                                        </p>
                                    </div>

                                    {!review.is_approved && (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            <ShieldAlert className="w-3.5 h-3.5" />
                                            Awaiting Moderation
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="lg:w-48 flex flex-col gap-2 justify-center">
                                    <form action={async () => {
                                        'use server';
                                        await updateReviewStatus(review.id, true);
                                    }}>
                                        <button className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all">
                                            <CheckCircle className="w-4 h-4" />
                                            Approve
                                        </button>
                                    </form>
                                    <form action={async () => {
                                        'use server';
                                        await updateReviewStatus(review.id, false);
                                    }}>
                                        <button className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-red-50 text-neutral-400 hover:text-red-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                            <XCircle className="w-4 h-4" />
                                            Reject
                                        </button>
                                    </form>
                                    <button className="mt-2 text-[10px] font-bold text-neutral-400 hover:text-neutral-600 uppercase tracking-[0.2em] transition-colors">
                                        Spam Report
                                    </button>
                                </div>
                            </div>

                            {/* Accent Background Overlay for group hover */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
