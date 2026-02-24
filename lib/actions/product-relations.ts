'use server';

import { createClient } from '@/lib/supabase/server';

export async function getRelatedProducts(productId: string) {
    const supabase = await createClient();

    // Strategy: 
    // 1. Check product_relationships table for explicit cross-sells
    // 2. Fallback to products in the same category

    // Explicit relationships
    const { data: explicit } = await supabase
        .from('product_relationships')
        .select(`
            related_product_id,
            related_product:products!product_relationships_related_product_id_fkey (
                id,
                name,
                slug,
                base_price,
                product_images (url, alt_text)
            )
        `)
        .eq('product_id', productId)
        .eq('relationship_type', 'cross-sell')
        .limit(4);

    if (explicit && explicit.length > 0) {
        return explicit.map((e: any) => e.related_product);
    }

    // Fallback: Get product category first
    const { data: currentProduct } = await supabase
        .from('products')
        .select('category_id')
        .eq('id', productId)
        .single();

    if (currentProduct?.category_id) {
        const { data: related } = await supabase
            .from('products')
            .select(`
                id,
                name,
                slug,
                base_price,
                product_images (url, alt_text)
            `)
            .eq('category_id', currentProduct.category_id)
            .neq('id', productId)
            .limit(4);

        return related || [];
    }

    return [];
}
