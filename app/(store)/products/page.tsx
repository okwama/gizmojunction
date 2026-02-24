import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/formatPrice';
import { ShoppingBag, Filter, ArrowRight, ChevronRight } from 'lucide-react';
import CompareButton from '@/components/store/CompareButton';

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    base_price: number;
    brand: { name: string; slug: string } | null;
    category: { name: string; slug: string } | null;
    product_images: { url: string; alt_text: string | null }[];
    featured: boolean;
}

interface Category {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
    children?: Category[];
}

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string; brand?: string; featured?: string; q?: string }>;
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
            description,
            base_price,
            featured,
            brand:brands(name, slug),
            category:categories(name, slug),
            product_images(url, alt_text)
        `)
        .eq('is_published', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    // Apply filters
    if (params.category) {
        query = query.filter('category.slug', 'eq', params.category);
    }

    if (params.brand) {
        query = query.filter('brand.slug', 'eq', params.brand);
    }

    if (params.featured) {
        query = query.eq('featured', true);
    }

    if (params.q) {
        query = query.or(`name.ilike.%${params.q}%,description.ilike.%${params.q}%`);
    }

    const { data: products, error } = await query;

    if (error) {
        console.error('Error fetching products:', error);
    }

    // Fetch ALL categories (parents + children) for hierarchy
    const { data: allCategories } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id')
        .is('deleted_at', null)
        .order('name');

    // Build category tree
    const categoryTree: Category[] = [];
    const categoryMap = new Map<string, Category>();

    allCategories?.forEach(cat => {
        categoryMap.set(cat.id, { ...cat, children: [] });
    });

    categoryMap.forEach(cat => {
        if (cat.parent_id && categoryMap.has(cat.parent_id)) {
            categoryMap.get(cat.parent_id)!.children!.push(cat);
        } else if (!cat.parent_id) {
            categoryTree.push(cat);
        }
    });

    // Collect all slugs under the active parent for highlighting
    const allCategorySlugs = allCategories?.map(c => c.slug) || [];
    const activeParent = categoryTree.find(p =>
        p.slug === params.category || p.children?.some(c => c.slug === params.category)
    );

    const { data: brands } = await supabase
        .from('brands')
        .select('id, name, slug');

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-3 dark:text-white">
                            {params.q ? `Search results for "${params.q}"` : params.category ? `Shop ${params.category}` : 'All Products'}
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400">
                            Showing <span className="font-bold text-neutral-900 dark:text-white">{products?.length || 0}</span> products
                        </p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Filters */}
                    <aside className="lg:w-72 flex-shrink-0">
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-8 sticky top-24 shadow-sm">
                            <h2 className="font-bold text-xl mb-6 flex items-center">
                                <Filter className="w-5 h-5 mr-2 text-blue-600" />
                                Filters
                            </h2>

                            {/* Search */}
                            {params.q && (
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-500">Current Search</h3>
                                        <Link href="/products" className="text-xs text-blue-600 hover:underline">Clear</Link>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
                                        {params.q}
                                    </div>
                                </div>
                            )}

                            {/* Category Hierarchy */}
                            <div className="mb-8">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-500 mb-4">Categories</h3>
                                <div className="space-y-1">
                                    <Link
                                        href="/products"
                                        className={`flex items-center text-sm py-1.5 transition ${!params.category ? 'text-blue-600 font-bold' : 'text-neutral-600 dark:text-neutral-400 hover:text-blue-600'}`}
                                    >
                                        All Categories
                                        {!params.category && <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>}
                                    </Link>
                                    {categoryTree.map((parent) => {
                                        const isParentActive = params.category === parent.slug;
                                        const hasActiveChild = parent.children?.some(c => c.slug === params.category);
                                        const isExpanded = isParentActive || hasActiveChild;

                                        return (
                                            <div key={parent.id}>
                                                <Link
                                                    href={`/products?category=${parent.slug}`}
                                                    className={`flex items-center text-sm py-1.5 transition ${isParentActive ? 'text-blue-600 font-bold' : 'text-neutral-700 dark:text-neutral-300 hover:text-blue-600'}`}
                                                >
                                                    {parent.children && parent.children.length > 0 && (
                                                        <ChevronRight className={`w-3.5 h-3.5 mr-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                                    )}
                                                    {parent.name}
                                                    {isParentActive && <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>}
                                                </Link>
                                                {/* Subcategories — always show if parent is expanded */}
                                                {isExpanded && parent.children && parent.children.length > 0 && (
                                                    <div className="ml-5 mt-0.5 space-y-0.5 border-l-2 border-slate-100 dark:border-neutral-700 pl-3">
                                                        {parent.children.map((child) => (
                                                            <Link
                                                                key={child.id}
                                                                href={`/products?category=${child.slug}`}
                                                                className={`block text-sm py-1 transition ${params.category === child.slug ? 'text-blue-600 font-bold' : 'text-neutral-500 dark:text-neutral-400 hover:text-blue-600'}`}
                                                            >
                                                                {child.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Brands */}
                            <div>
                                <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-500 mb-4">Brands</h3>
                                <div className="space-y-3">
                                    <Link
                                        href="/products"
                                        className={`flex items-center text-sm transition ${!params.brand ? 'text-blue-600 font-bold' : 'text-neutral-600 dark:text-neutral-400 hover:text-blue-600'}`}
                                    >
                                        All Brands
                                        {!params.brand && <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>}
                                    </Link>
                                    {brands?.map((brand) => (
                                        <Link
                                            key={brand.id}
                                            href={`/products?brand=${brand.slug}`}
                                            className={`flex items-center text-sm transition ${params.brand === brand.slug ? 'text-blue-600 font-bold' : 'text-neutral-600 dark:text-neutral-400 hover:text-blue-600'}`}
                                        >
                                            {brand.name}
                                            {params.brand === brand.slug && <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {(!products || products.length === 0) ? (
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-20 text-center shadow-sm">
                                <ShoppingBag className="w-16 h-16 text-neutral-200 mx-auto mb-6" />
                                <h2 className="text-2xl font-bold mb-3 dark:text-white">No products found</h2>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-sm mx-auto">
                                    We couldn&apos;t find any products matching your criteria. Try adjusting your filters or search query.
                                </p>
                                <Link
                                    href="/products"
                                    className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                                >
                                    Clear all filters
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                {products.map((product: any) => (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.slug}`}
                                        className="group bg-white dark:bg-neutral-900 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-neutral-100 dark:border-neutral-800 flex flex-col"
                                    >
                                        <div className="aspect-[4/3] bg-neutral-50 dark:bg-neutral-950 relative overflow-hidden">
                                            {product.product_images?.[0] ? (
                                                <Image
                                                    src={product.product_images[0].url}
                                                    alt={product.product_images[0].alt_text || product.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ShoppingBag className="w-12 h-12 text-neutral-200" />
                                                </div>
                                            )}
                                            {product.featured && (
                                                <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                                                    Featured
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <CompareButton productId={product.id} />
                                            </div>
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-3">
                                                {product.brand && (
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                                                        {product.brand.name}
                                                    </span>
                                                )}
                                                <span className="font-bold text-blue-600 dark:text-blue-400">
                                                    {formatPrice(product.base_price)}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg mb-2 line-clamp-2 dark:text-white transition group-hover:text-blue-600">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 line-clamp-2 leading-relaxed">
                                                {product.description}
                                            </p>
                                            <div className="mt-auto pt-4 border-t border-neutral-50 dark:border-neutral-800 flex items-center justify-between">
                                                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                                                    {product.category?.name}
                                                </span>
                                                <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
