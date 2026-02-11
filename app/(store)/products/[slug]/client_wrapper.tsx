'use client';

import { Suspense } from 'react';
import AddToCart from '@/components/store/AddToCart';

export default function ProductPageClientWrapper({ product }: { product: any }) {
    return (
        <div>
            <div className="mb-4 text-4xl font-bold">{product.name}</div>
            <div className="space-y-4">
                <AddToCart
                    productId={product.id}
                    variantId={product.product_variants?.[0]?.id}
                />
            </div>
        </div>
    );
}
