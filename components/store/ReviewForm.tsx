'use client';

import { useState, useTransition } from 'react';
import { submitReview } from '@/lib/actions/reviews';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewForm({ productId }: { productId: string }) {
    const [isPending, startTransition] = useTransition();
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.set('rating', rating.toString());

        startTransition(async () => {
            const result = await submitReview(productId, formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Review submitted successfully!');
                setShowForm(false);
                setRating(0);
            }
        });
    };

    if (!showForm) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-bold text-lg text-slate-900 mb-2">Share Your Experience</h3>
                <p className="text-sm text-slate-500 mb-4">Help others by sharing your thoughts about this product.</p>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm"
                >
                    Write a Review
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-bold text-lg text-slate-900 mb-4">Write a Review</h3>

            {/* Star Rating Picker */}
            <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Your Rating</label>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            onClick={() => setRating(star)}
                            className="p-0.5 transition-transform hover:scale-110"
                        >
                            <Star
                                className={`w-8 h-8 transition-colors ${star <= (hoveredRating || rating)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'fill-slate-200 text-slate-200'
                                    }`}
                            />
                        </button>
                    ))}
                    {rating > 0 && (
                        <span className="ml-2 text-sm text-slate-500 font-medium">
                            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                        </span>
                    )}
                </div>
            </div>

            {/* Title */}
            <div className="mb-4">
                <label htmlFor="review-title" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Review Title
                </label>
                <input
                    id="review-title"
                    name="title"
                    type="text"
                    required
                    placeholder="Summarize your experience"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-slate-900"
                />
            </div>

            {/* Comment */}
            <div className="mb-5">
                <label htmlFor="review-comment" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Your Review
                </label>
                <textarea
                    id="review-comment"
                    name="comment"
                    rows={4}
                    required
                    placeholder="Tell others what you liked or didn't like about this product..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none text-slate-900"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <button
                    type="submit"
                    disabled={isPending || rating === 0}
                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                    type="button"
                    onClick={() => { setShowForm(false); setRating(0); }}
                    className="px-4 py-2.5 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition text-sm"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
