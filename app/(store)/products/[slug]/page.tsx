import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/formatPrice';
import Link from 'next/link';
import AddToCart from '@/components/store/AddToCart';
import ReviewSection from '@/components/store/ReviewSection';
import StickyBuyBar from '@/components/store/StickyBuyBar';
import WishlistButton from '@/components/store/WishlistButton';
import RelatedProducts from '@/components/store/RelatedProducts';
import CompareButton from '@/components/store/CompareButton';
import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: product } = await supabase
        .from('products')
        .select('name, description, base_price, product_images(url, alt_text)')
        .eq('slug', slug)
        .is('deleted_at', null)
        .single();

    if (!product) {
        return { title: 'Product Not Found | Gizmo Junction' };
    }

    const image = (product.product_images as any[])?.[0];
    const price = Number(product.base_price);
    const description = product.description
        ? `${product.description.slice(0, 155)}...`
        : `Buy ${product.name} at KES ${price.toLocaleString()}. Shop electronics and gadgets at Gizmo Junction.`;

    return {
        title: `${product.name} | Gizmo Junction`,
        description,
        openGraph: {
            title: product.name,
            description,
            type: 'website',
            images: image?.url ? [{ url: image.url, alt: image.alt_text || product.name }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description,
            images: image?.url ? [image.url] : [],
        },
    };
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

    // Cast joined relations (Supabase TS infers arrays, but .single() returns objects)
    const p = product as any;

    // Sort images by display order
    const images = (p.product_images || []).sort((a: any, b: any) =>
        (a.display_order || 0) - (b.display_order || 0)
    );

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="text-sm text-gray-600 mb-8">
                    <Link href="/" className="hover:text-primary-600">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/products" className="hover:text-primary-600">Products</Link>
                    {p.category && (
                        <>
                            <span className="mx-2">/</span>
                            <Link
                                href={`/products?category=${p.category.slug}`}
                                className="hover:text-primary-600"
                            >
                                {p.category.name}
                            </Link>
                        </>
                    )}
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">{p.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Images */}
                    <div>
                        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                            {images[0] ? (
                                <Image
                                    src={images[0].url}
                                    alt={images[0].alt_text || p.name}
                                    fill
                                    className="object-cover"
                                    priority
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
                                {images.map((image: any) => (
                                    <div key={image.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-75">
                                        <Image
                                            src={image.url}
                                            alt={image.alt_text || p.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        {p.brand && (
                            <div className="text-sm text-gray-600 mb-2">
                                <Link href={`/products?brand=${p.brand.slug}`} className="hover:text-primary-600">
                                    {p.brand.name}
                                </Link>
                            </div>
                        )}

                        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{p.name}</h1>

                        {p.featured && (
                            <div className="inline-block bg-primary-100 text-primary-700 text-sm px-3 py-1 rounded-full mb-4">
                                ⭐ Featured Product
                            </div>
                        )}

                        <div className="text-3xl font-bold text-primary-600 mb-6">
                            {formatPrice(p.base_price)}
                        </div>

                        <div className="prose prose-sm mb-8">
                            <p className="text-gray-700 leading-relaxed">{p.description}</p>
                        </div>

                        {/* Variants */}
                        {p.product_variants && p.product_variants.length > 0 && (
                            <div className="mb-8">
                                <h3 className="font-semibold mb-3">Available Options</h3>
                                <div className="space-y-2">
                                    {p.product_variants.map((variant: any) => (
                                        <div
                                            key={variant.id}
                                            className="flex justify-between items-center p-3 border rounded-lg hover:border-primary-600 cursor-pointer"
                                        >
                                            <div>
                                                <div className="font-medium">{variant.name}</div>
                                                <div className="text-sm text-gray-600">SKU: {variant.sku}</div>
                                            </div>
                                            <div className="text-lg font-semibold text-primary-600">
                                                {formatPrice(p.base_price + (variant.price_adjustment || 0))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add to Cart */}
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <AddToCart
                                        productId={p.id}
                                        variantId={p.product_variants?.[0]?.id}
                                    />
                                </div>
                                <WishlistButton productId={p.id} />
                                <CompareButton productId={p.id} className="p-4" variant="icon" />
                            </div>
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
                                <span>Free shipping on orders over KES 5,000</span>
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

                <RelatedProducts productId={p.id} />

                {/* Reviews Section */}
                <div className="mt-16">
                    <div className="border-t pt-12">
                        <ReviewSection productId={p.id} />
                    </div>
                </div>
            </div>

            <StickyBuyBar product={p} />
        </div>
    );
}

