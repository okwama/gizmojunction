import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import AddToCart from '@/components/store/AddToCart';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // Fetch product with all related data
    const { data: product, error } = await supabase
        .from('products')
        .select(`
      id,
      name,
      slug,
      description,
      base_price,
      featured,
      brand:brands(id, name, slug),
      category:categories(id, name, slug),
      product_images(id, url, alt_text, display_order),
      product_variants(
        id,
        sku,
        name,
        price_adjustment,
        attributes
      )
    `)
        .eq('slug', slug)
        .eq('is_published', true)
        .is('deleted_at', null)
        .single();

    if (error || !product) {
        notFound();
    }

    // Sort images by display order
    const images = product.product_images?.sort((a, b) =>
        (a.display_order || 0) - (b.display_order || 0)
    ) || [];

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="text-sm text-gray-600 mb-8">
                    <Link href="/" className="hover:text-primary-600">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/products" className="hover:text-primary-600">Products</Link>
                    {product.category && (
                        <>
                            <span className="mx-2">/</span>
                            <Link
                                href={`/products?category=${product.category.slug}`}
                                className="hover:text-primary-600"
                            >
                                {product.category.name}
                            </Link>
                        </>
                    )}
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Images */}
                    <div>
                        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                            {images[0] ? (
                                <img
                                    src={images[0].url}
                                    alt={images[0].alt_text || product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    No image available
                                </div>
                            )}
                        </div>
                        {/* Thumbnail gallery */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                                {images.map((image) => (
                                    <div key={image.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-75">
                                        <img
                                            src={image.url}
                                            alt={image.alt_text || product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        {product.brand && (
                            <div className="text-sm text-gray-600 mb-2">
                                <Link href={`/products?brand=${product.brand.slug}`} className="hover:text-primary-600">
                                    {product.brand.name}
                                </Link>
                            </div>
                        )}

                        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{product.name}</h1>

                        {product.featured && (
                            <div className="inline-block bg-primary-100 text-primary-700 text-sm px-3 py-1 rounded-full mb-4">
                                ⭐ Featured Product
                            </div>
                        )}

                        <div className="text-3xl font-bold text-primary-600 mb-6">
                            ${product.base_price.toFixed(2)}
                        </div>

                        <div className="prose prose-sm mb-8">
                            <p className="text-gray-700 leading-relaxed">{product.description}</p>
                        </div>

                        {/* Variants */}
                        {product.product_variants && product.product_variants.length > 0 && (
                            <div className="mb-8">
                                <h3 className="font-semibold mb-3">Available Options</h3>
                                <div className="space-y-2">
                                    {product.product_variants.map((variant) => (
                                        <div
                                            key={variant.id}
                                            className="flex justify-between items-center p-3 border rounded-lg hover:border-primary-600 cursor-pointer"
                                        >
                                            <div>
                                                <div className="font-medium">{variant.name}</div>
                                                <div className="text-sm text-gray-600">SKU: {variant.sku}</div>
                                            </div>
                                            <div className="text-lg font-semibold text-primary-600">
                                                ${(product.base_price + (variant.price_adjustment || 0)).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add to Cart */}
                        <div className="space-y-4">
                            <AddToCart
                                productId={product.id}
                                variantId={product.product_variants?.[0]?.id}
                            />
                            <button className="w-full border-2 border-primary-600 text-primary-600 py-4 rounded-lg font-semibold hover:bg-primary-50 transition">
                                Buy Now
                            </button>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-8 space-y-4 text-sm">
                            <div className="flex items-center gap-3 text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Free shipping on orders over $50</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>30-day money-back guarantee</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Secure payment processing</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews & Q&A Section */}
                <div className="mt-16">
                    <div className="border-t pt-12">
                        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
                        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                            No reviews yet. Be the first to review this product!
                        </div>
                    </div>

                    <div className="border-t pt-12 mt-12">
                        <h2 className="text-2xl font-bold mb-6">Questions & Answers</h2>
                        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                            No questions yet. Ask a question about this product!
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
