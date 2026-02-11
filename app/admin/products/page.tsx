import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Package, Plus, Search, Filter, Upload } from 'lucide-react';
import ProductsTable from '@/components/admin/ProductsTable';

export default async function AdminProductsPage({
    searchParams,
}: {
    searchParams: { search?: string; category?: string; brand?: string; status?: string };
}) {
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
    if (searchParams.search) {
        query = query.ilike('name', `%${searchParams.search}%`);
    }
    if (searchParams.category) {
        query = query.eq('category_id', searchParams.category);
    }
    if (searchParams.brand) {
        query = query.eq('brand_id', searchParams.brand);
    }
    if (searchParams.status === 'published') {
        query = query.eq('is_published', true);
    } else if (searchParams.status === 'draft') {
        query = query.eq('is_published', false);
    } else if (searchParams.status === 'featured') {
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
                            defaultValue={searchParams.search}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        name="category"
                        defaultValue={searchParams.category || ''}
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
                        defaultValue={searchParams.brand || ''}
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
                        defaultValue={searchParams.status || ''}
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
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {!products || products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                                        <p className="text-neutral-500 mb-3">No products found</p>
                                        <Link
                                            href="/admin/products/new"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Create Product
                                        </Link>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product: any) => (
                                    <tr key={product.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition">
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="text-sm font-bold text-neutral-900 dark:text-white">{product.name}</div>
                                                <div className="text-xs text-neutral-500 font-mono">{product.slug}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                                            {product.brand?.name || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                                            {product.category?.name || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                                            {product.variants?.[0]?.count || 0}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold text-neutral-900 dark:text-white">
                                            ${product.base_price.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1.5">
                                                {product.is_published ? (
                                                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        Published
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                                        Draft
                                                    </span>
                                                )}
                                                {product.featured && (
                                                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                        Featured
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex gap-3">
                                                <Link
                                                    href={`/admin/products/${product.id}`}
                                                    className="text-blue-600 hover:text-blue-700 font-bold"
                                                >
                                                    Edit
                                                </Link>
                                                <Link
                                                    href={`/products/${product.slug}`}
                                                    target="_blank"
                                                    className="text-neutral-500 hover:text-neutral-700 font-bold"
                                                >
                                                    View
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
