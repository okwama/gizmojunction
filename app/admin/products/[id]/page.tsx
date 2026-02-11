import { createClient } from '@/lib/supabase/server';
import ProductForm from '@/components/admin/ProductForm';
import { notFound } from 'next/navigation';

export default async function EditProductPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch product
    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !product) {
        notFound();
    }

    // Fetch options
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .is('deleted_at', null);

    const { data: brands } = await supabase
        .from('brands')
        .select('id, name');

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Edit Product: {product.name}</h1>
            <ProductForm
                product={product}
                categories={categories || []}
                brands={brands || []}
            />
        </div>
    );
}
