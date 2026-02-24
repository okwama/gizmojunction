'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getProductReviews(productId: string) {
    const supabase = await createClient();

    const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
            id,
            rating,
            title,
            comment,
            is_verified_purchase,
            created_at,
            user_id,
            profiles:user_id (full_name, avatar_url)
        `)
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching reviews:', error);
        return { reviews: [], stats: { average: 0, total: 0, distribution: [0, 0, 0, 0, 0] } };
    }

    // Calculate stats
    const total = reviews?.length || 0;
    const sum = reviews?.reduce((acc, r) => acc + r.rating, 0) || 0;
    const average = total > 0 ? sum / total : 0;

    const distribution = [0, 0, 0, 0, 0]; // [1-star, 2-star, 3-star, 4-star, 5-star]
    reviews?.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
            distribution[r.rating - 1]++;
        }
    });

    return {
        reviews: reviews || [],
        stats: { average, total, distribution }
    };
}

export async function submitReview(productId: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be signed in to leave a review.' };
    }

    const rating = Number(formData.get('rating'));
    const title = formData.get('title') as string;
    const comment = formData.get('comment') as string;

    if (!rating || rating < 1 || rating > 5) {
        return { error: 'Please select a rating between 1 and 5.' };
    }

    if (!title?.trim() || !comment?.trim()) {
        return { error: 'Please fill in both title and comment.' };
    }

    // Check if user already reviewed this product
    const { data: existing } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();

    if (existing) {
        return { error: 'You have already reviewed this product.' };
    }

    // Check if user purchased this product (verified purchase)
    const { data: purchased } = await supabase
        .from('order_items')
        .select(`
            id,
            order:orders!inner(user_id, status)
        `)
        .eq('order.user_id', user.id)
        .in('order.status', ['delivered', 'completed'])
        .limit(1);

    const isVerified = purchased && purchased.length > 0;

    const { error: insertError } = await supabase
        .from('reviews')
        .insert({
            product_id: productId,
            user_id: user.id,
            rating,
            title: title.trim(),
            comment: comment.trim(),
            is_verified_purchase: isVerified,
            is_approved: true  // Auto-approve for now; admin can moderate later
        });

    if (insertError) {
        console.error('Error submitting review:', insertError);
        return { error: 'Failed to submit review. Please try again.' };
    }

    revalidatePath(`/products`);
    return { success: true };
}
