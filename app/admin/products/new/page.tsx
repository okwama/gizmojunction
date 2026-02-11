import { createClient } from '@/lib/supabase/server';
import ProductForm from '@/components/admin/ProductForm';

export default async function NewProductPage() {
    const supabase = await createClient();

    const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .is('deleted_at', null);

    const { data: brands } = await supabase
        .from('brands')
        .select('id, name');

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Add New Product</h1>
            <ProductForm
                categories={categories || []}
                brands={brands || []}
            />
        </div>
    );
}
