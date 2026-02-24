import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/formatPrice';
import { Package, Plus, Search, Filter, Upload } from 'lucide-react';
import ProductsTable from '@/components/admin/ProductsTable';

export default async function AdminProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; category?: string; brand?: string; status?: string }>;
}) {
    const params = await searchParams;
    const supabase = await createClient();

    // Build query
    let query = supabase
        .from('products')
        .select(`
            id,
            name,
            slug,
            base_price,
            is_published,
            featured,
            brand:brands(id, name),
            category:categories(id, name),
            variants:product_variants(count),
            created_at
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    // Apply filters
    if (params.search) {
        query = query.ilike('name', `%${params.search}%`);
    }
    if (params.category) {
        query = query.eq('category_id', params.category);
    }
    if (params.brand) {
        query = query.eq('brand_id', params.brand);
    }
    if (params.status === 'published') {
        query = query.eq('is_published', true);
    } else if (params.status === 'draft') {
        query = query.eq('is_published', false);
    } else if (params.status === 'featured') {
        query = query.eq('featured', true);
    }

    const { data: products } = await query;

    // Get filter options
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .is('deleted_at', null)
        .order('name');

    const { data: brands } = await supabase
        .from('brands')
        .select('id, name')
        .order('name');

    return (
        <div className="space-y-4">
            {/* Compact Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">Products</h1>
                    <p className="text-sm text-neutral-500 mt-0.5">{products?.length || 0} total products</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/admin/products/import"
                        className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 font-bold text-sm rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Import
                    </Link>
                    <Link
                        href="/admin/products/new"
                        className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Product
                    </Link>
                </div>
            </div>

            {/* Compact Filters */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                <form className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {/* Search */}
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            name="search"
                            placeholder="Search products..."
                            defaultValue={params.search}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        name="category"
                        defaultValue={params.category || ''}
                        className="px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Categories</option>
                        {categories?.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    {/* Brand Filter */}
                    <select
                        name="brand"
                        defaultValue={params.brand || ''}
                        className="px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Brands</option>
                        {brands?.map((brand) => (
                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        name="status"
                        defaultValue={params.status || ''}
                        className="px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="featured">Featured</option>
                    </select>

                    <button
                        type="submit"
                        className="md:col-span-5 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 font-bold text-sm rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition flex items-center justify-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Apply Filters
                    </button>
                </form>
            </div>

            {/* Compact Table */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
                            <tr>
                                <th className="px-4 py-2.5 text-left text-xs font-black uppercase tracking-wider text-neutral-500">Product</th>
                                <th className="px-4 py-2.5 text-left text-xs font-black uppercase tracking-wider text-neutral-500">Brand</th>
                                <th className="px-4 py-2.5 text-left text-xs font-black uppercase tracking-wider text-neutral-500">Category</th>
                                <th className="px-4 py-2.5 text-left text-xs font-black uppercase tracking-wider text-neutral-500">Variants</th>
                                <th className="px-4 py-2.5 text-left text-xs font-black uppercase tracking-wider text-neutral-500">Price</th>
                                <th className="px-4 py-2.5 text-left text-xs font-black uppercase tracking-wider text-neutral-500">Status</th>
                                <th className="px-4 py-2.5 text-left text-xs font-black uppercase tracking-wider text-neutral-500">Actions</th>
                            </tr>
                        </thead>
                        <ProductsTable
                            products={products || []}
                            categories={categories || []}
                            brands={brands || []}
                            activeFilters={{
                                search: params.search,
                                category: params.category,
                                brand: params.brand,
                                status: params.status
                            }}
                        />
                    </table>
                </div>
            </div>
        </div>
    );
}
