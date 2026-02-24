import { getProductsByIds } from '@/lib/actions/products';
import { formatPrice } from '@/lib/formatPrice';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, GitCompare, X, Star } from 'lucide-react';
import Image from 'next/image';
import CompareButton from '@/components/store/CompareButton';
import AddToCart from '@/components/store/AddToCart';

interface PageProps {
    searchParams: Promise<{ ids?: string }>;
}

export default async function ComparePage({ searchParams }: PageProps) {
    const params = await searchParams;
    const ids = params.ids?.split(',').filter(Boolean) || [];

    if (ids.length === 0) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-xl border border-neutral-100 dark:border-neutral-800">
                        <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                            <GitCompare className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-black mb-4 dark:text-white">Nothing to compare</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 mb-8">
                            Add some products to your comparison list to see them side-by-side.
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center justify-center w-full py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition"
                        >
                            Browse Products
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const products = await getProductsByIds(ids);

    // Helper to get spec value from metadata or fallback
    const getSpec = (product: any, key: string) => {
        if (product.metadata && product.metadata[key]) return product.metadata[key];
        return '—';
    };

    // Define specs to compare based on common tech categories
    const commonSpecs = [
        { label: 'Brand', key: 'brand' },
        { label: 'Category', key: 'category' },
        { label: 'Processor', key: 'processor' },
        { label: 'Memory', key: 'ram' },
        { label: 'Storage', key: 'storage' },
        { label: 'Display', key: 'display' },
        { label: 'Battery', key: 'battery' }
    ];

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-12 pb-24">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <Link href="/products" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-blue-600 transition mb-4">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to Shop
                        </Link>
                        <h1 className="text-4xl font-black tracking-tight dark:text-white">Product Comparison</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-2 font-medium">Comparing {products.length} powerful gadgets</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200 dark:bg-neutral-800 rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-xl">
                    {products.map((product: any) => (
                        <div key={product.id} className="bg-white dark:bg-neutral-900 flex flex-col">
                            {/* Product Header Card */}
                            <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 relative group">
                                <div className="aspect-square bg-neutral-50 dark:bg-neutral-800 rounded-2xl overflow-hidden mb-6 relative">
                                    {product.product_images?.[0]?.url ? (
                                        <Image
                                            src={product.product_images[0].url}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ShoppingBag className="w-12 h-12 text-neutral-200" />
                                        </div>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">{product.brand?.name}</div>
                                    <h3 className="font-bold text-lg leading-tight line-clamp-2 dark:text-white h-12">{product.name}</h3>
                                </div>
                                <div className="text-2xl font-black text-neutral-900 dark:text-white mb-6">
                                    {formatPrice(product.base_price)}
                                </div>
                                <AddToCart productId={product.id} className="w-full" />
                            </div>

                            {/* Specifications Section */}
                            <div className="flex-1">
                                <div className="px-8 py-4 bg-neutral-50 dark:bg-neutral-800/50 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                    Specifications
                                </div>
                                {commonSpecs.map((spec) => (
                                    <div key={spec.key} className="px-8 py-6 border-b border-neutral-50 dark:border-neutral-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/20 transition-colors">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">{spec.label}</div>
                                        <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                                            {spec.key === 'brand' ? product.brand?.name :
                                                spec.key === 'category' ? product.category?.name :
                                                    getSpec(product, spec.key)}
                                        </div>
                                    </div>
                                ))}

                                <div className="px-8 py-6 border-b border-neutral-50 dark:border-neutral-800">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3">Rating</div>
                                    <div className="flex items-center gap-1 text-amber-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <Star className="w-4 h-4 fill-current" />
                                        <Star className="w-4 h-4 fill-current" />
                                        <Star className="w-4 h-4 fill-current" />
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="text-xs font-bold ml-1 text-neutral-400">(4.5)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 mt-auto">
                                <Link
                                    href={`/products/${product.slug}`}
                                    className="block w-full text-center py-3 rounded-xl border-2 border-neutral-100 dark:border-neutral-700 text-xs font-black uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition"
                                >
                                    Full Details
                                </Link>
                            </div>
                        </div>
                    ))}

                    {/* Empty Slots */}
                    {Array.from({ length: 4 - products.length }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-neutral-50 dark:bg-neutral-900 border-l border-neutral-100 dark:border-neutral-800 flex flex-col items-center justify-center p-12 text-center opacity-50">
                            <div className="w-12 h-12 rounded-full border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center mb-4">
                                <Plus className="w-6 h-6 text-neutral-300" />
                            </div>
                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-6">Slot {products.length + i + 1} Empty</p>
                            <Link
                                href="/products"
                                className="px-6 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition shadow-sm"
                            >
                                Add Product
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Plus({ className }: { className?: string }) {
    return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    )
}
