'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { toggleWishlist, isInWishlist } from '@/lib/actions/wishlist';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface WishlistButtonProps {
    productId: string;
    variantId?: string;
    className?: string;
}

export default function WishlistButton({ productId, variantId, className }: WishlistButtonProps) {
    const [active, setActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function checkStatus() {
            try {
                const status = await isInWishlist(productId);
                setActive(status);
            } catch (error) {
                console.error('Error checking wishlist status:', error);
            } finally {
                setLoading(false);
            }
        }
        checkStatus();
    }, [productId]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setLoading(true);
        try {
            const result = await toggleWishlist(productId);
            setActive(result.added);
            toast.success(result.added ? 'Added to wishlist' : 'Removed from wishlist');
            router.refresh();
        } catch (error: any) {
            if (error.message === 'Not authenticated') {
                toast.error('Please sign in to save items');
                router.push('/login');
            } else {
                toast.error('Something went wrong');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={cn(
                "p-2.5 rounded-xl transition-all duration-300",
                active
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 scale-110"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-red-500 hover:bg-red-50/50",
                loading && "opacity-50 cursor-not-allowed",
                className
            )}
            title={active ? "Remove from Wishlist" : "Add to Wishlist"}
        >
            <Heart className={cn("w-5 h-5 transition-transform", active && "fill-current")} />
        </button>
    );
}
