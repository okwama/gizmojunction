import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/formatPrice';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { getRelatedProducts } from '@/lib/actions/product-relations';

export default async function RelatedProducts({ productId }: { productId: string }) {
    const products = await getRelatedProducts(productId);

    if (products.length === 0) return null;

    return (
        <section className="mt-24">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tight">Customers Also Bought</h2>
                    <p className="text-neutral-500">Curated tech that pairs perfectly</p>
                </div>
                <Link
                    href="/products"
                    className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition"
                >
                    View All <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product: any) => (
                    <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className="group bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-xl transition duration-500"
                    >
                        <div className="aspect-square bg-neutral-50 dark:bg-neutral-800 overflow-hidden relative">
                            {product.product_images?.[0] ? (
                                <Image
                                    src={product.product_images[0].url}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    className="object-cover group-hover:scale-110 transition duration-700"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                    <ShoppingBag className="w-8 h-8 opacity-20" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold mb-1 truncate group-hover:text-blue-600 transition tracking-tight">
                                {product.name}
                            </h3>
                            <div className="text-xl font-black text-neutral-900 dark:text-white">
                                {formatPrice(product.base_price)}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
