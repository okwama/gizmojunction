'use client';

import { useTransition } from 'react';
import { addToCart } from '@/lib/actions/cart';
import { toast } from 'sonner';

interface AddToCartProps {
    productId: string;
    variantId?: string;
    className?: string;
    disabled?: boolean;
}

export default function AddToCart({ productId, variantId, className, disabled }: AddToCartProps) {
    const [isPending, startTransition] = useTransition();

    const handleAddToCart = () => {
        startTransition(async () => {
            try {
                await addToCart(productId, variantId);
                toast.success('Product added to cart');
            } catch (error) {
                console.error('Failed to add to cart:', error);
                toast.error('Failed to add to cart. Please try again.');
            }
        });
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={disabled || isPending}
            className={className || "w-full bg-primary-600 text-white py-4 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"}
        >
            {isPending ? 'Adding...' : 'Add to Cart'}
        </button>
    );
}
