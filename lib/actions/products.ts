'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(state: any, formData: FormData) {
    const supabase = await createClient();

    // 1. Extract data from FormData
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const base_price = parseFloat(formData.get('base_price') as string);
    const category_id = formData.get('category_id') as string;
    const brand_id = formData.get('brand_id') as string;
    const is_published = formData.get('is_published') === 'on';
    const featured = formData.get('featured') === 'on';

    // 2. Validate data (Basic validation)
    if (!name || !slug || !base_price) {
        return { error: 'Missing required fields' };
    }

    // 3. Insert Product
    const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
            name,
            slug,
            description,
            base_price,
            category_id: category_id || null,
            brand_id: brand_id || null,
            is_published,
            featured,
        })
        .select()
        .single();

    if (productError) {
        return { error: `Failed to create product: ${productError.message}` };
    }

    // 4. Handle Images (if any)
    // Note: File upload usually handled via client-side directly to storage for better UX
    // Here we assume image URLs are passed or handled separately.
    // For MVP, we might just skip complex image upload in this server action 
    // and assume a separate flow or simple URL input.

    revalidatePath('/admin/products');
    revalidatePath('/products');
    redirect('/admin/products');
}

export async function updateProduct(id: string, prevState: any, formData: FormData) {
    const supabase = await createClient();

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const base_price = parseFloat(formData.get('base_price') as string);
    const category_id = formData.get('category_id') as string;
    const brand_id = formData.get('brand_id') as string;
    const is_published = formData.get('is_published') === 'on';
    const featured = formData.get('featured') === 'on';

    const { error } = await supabase
        .from('products')
        .update({
            name,
            slug,
            description,
            base_price,
            category_id: category_id || null,
            brand_id: brand_id || null,
            is_published,
            featured,
        })
        .eq('id', id);

    if (error) {
        return { error: `Failed to update product: ${error.message}` };
    }

    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${id}`);
    revalidatePath('/products');
    redirect('/admin/products');
}

export async function deleteProduct(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('products')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        throw new Error(`Failed to delete product: ${error.message}`);
    }

    revalidatePath('/admin/products');
}

export async function getFeaturedProducts() {
    const supabase = await createClient();

    // Fetch products that are published and not deleted
    // If 'featured' flag is set, prioritize those, otherwise just get latest
    const { data: products, error } = await supabase
        .from('products')
        .select(`
            id,
            name,
            slug,
            description,
            base_price,
            featured,
            product_images(url, alt_text, display_order)
        `)
        .eq('is_published', true)
        .is('deleted_at', null)
        .eq('featured', true)
        .limit(8)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching featured products:', error);
        return [];
    }

    // If no featured products, fallback to latest products
    if (!products || products.length === 0) {
        const { data: latestProducts } = await supabase
            .from('products')
            .select(`
                id,
                name,
                slug,
                description,
                base_price,
                featured,
                product_images(url, alt_text, display_order)
            `)
            .eq('is_published', true)
            .is('deleted_at', null)
            .limit(8)
            .order('created_at', { ascending: false });

        return latestProducts || [];
    }

    return products;
}

export async function getProductsByIds(ids: string[]) {
    const supabase = await createClient();

    const { data: products, error } = await supabase
        .from('products')
        .select(`
            id,
            name,
            slug,
            description,
            base_price,
            brand:brands(name),
            category:categories(name),
            product_images(url, alt_text),
            metadata
        `)
        .in('id', ids)
        .is('deleted_at', null);

    if (error) {
        console.error('Error fetching products by ids:', error);
        return [];
    }

    return products || [];
}
