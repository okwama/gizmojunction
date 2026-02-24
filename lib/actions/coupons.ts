'use server';

import { createClient } from '@/lib/supabase/server';

export async function validateCoupon(code: string, subtotal: number) {
    const supabase = await createClient();

    const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

    if (error || !coupon) {
        throw new Error('Invalid coupon code');
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        throw new Error('Coupon has expired');
    }

    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        throw new Error('Coupon usage limit reached');
    }

    if (subtotal < coupon.min_purchase) {
        throw new Error(`Minimum purchase of KES ${coupon.min_purchase} required`);
    }

    let discountAmount = 0;
    if (coupon.type === 'percentage') {
        discountAmount = (subtotal * coupon.value) / 100;
    } else {
        discountAmount = coupon.value;
    }

    return {
        id: coupon.id,
        code: coupon.code,
        discountAmount: Math.min(discountAmount, subtotal) // Cannot discount more than subtotal
    };
}
