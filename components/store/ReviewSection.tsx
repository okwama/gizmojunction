import { getProductReviews } from '@/lib/actions/reviews';
import { Star } from 'lucide-react';
import ReviewForm from './ReviewForm';

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
    const sizeClass = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${sizeClass} ${star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : star <= Math.ceil(rating) && rating % 1 > 0
                            ? 'fill-amber-200 text-amber-400'
                            : 'fill-slate-200 text-slate-200'
                        }`}
                />
            ))}
        </div>
    );
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="flex items-center gap-3 text-sm">
            <span className="w-12 text-slate-600 font-medium">{stars} star</span>
            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="w-8 text-right text-slate-500 font-medium">{count}</span>
        </div>
    );
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export default async function ReviewSection({ productId }: { productId: string }) {
    const { reviews, stats } = await getProductReviews(productId);

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Customer Reviews</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Rating Summary */}
                <div className="bg-slate-50 rounded-xl p-6">
                    <div className="text-center mb-4">
                        <div className="text-5xl font-black text-slate-900 mb-1">
                            {stats.average.toFixed(1)}
                        </div>
                        <div className="flex justify-center mb-2">
                            <StarRating rating={Math.round(stats.average)} size="lg" />
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                            Based on {stats.total} {stats.total === 1 ? 'review' : 'reviews'}
                        </p>
                    </div>
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => (
                            <RatingBar
                                key={stars}
                                stars={stars}
                                count={stats.distribution[stars - 1]}
                                total={stats.total}
                            />
                        ))}
                    </div>
                </div>

                {/* Review Form */}
                <div className="lg:col-span-2">
                    <ReviewForm productId={productId} />
                </div>
            </div>

            {/* Review List */}
            {reviews.length > 0 ? (
                <div className="space-y-6">
                    {reviews.map((review: any) => (
                        <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <StarRating rating={review.rating} />
                                        <h4 className="font-bold text-slate-900">{review.title}</h4>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <span className="font-medium">
                                            {review.profiles?.full_name || 'Anonymous'}
                                        </span>
                                        <span>•</span>
                                        <span>{formatDate(review.created_at)}</span>
                                        {review.is_verified_purchase && (
                                            <>
                                                <span>•</span>
                                                <span className="text-green-600 font-semibold flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    Verified Purchase
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <p className="text-slate-700 leading-relaxed mt-2">{review.comment}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-slate-50 rounded-xl p-10 text-center">
                    <div className="text-4xl mb-3">✨</div>
                    <p className="text-slate-600 font-medium">No reviews yet. Be the first to share your thoughts!</p>
                </div>
            )}
        </div>
    );
}
