import { getWishlist } from '@/lib/actions/wishlist';
import Image from 'next/image';
import { formatPrice } from '@/lib/formatPrice';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Heart, Trash2 } from 'lucide-react';
import AddToCart from '@/components/store/AddToCart';
import WishlistButton from '@/components/store/WishlistButton';

export default async function WishlistPage() {
    const wishlistItems = await getWishlist();

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950/20 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8 animate-fade-in-up">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight mb-2">My Wishlist</h1>
                            <p className="text-neutral-500 dark:text-neutral-400">Save your favorite tech for later</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl flex items-center gap-3">
                            <Heart className="w-6 h-6 text-red-600 fill-current" />
                            <span className="text-2xl font-black text-red-600">{wishlistItems.length}</span>
                        </div>
                    </div>

                    {wishlistItems.length === 0 ? (
                        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-12 text-center border border-neutral-200 dark:border-neutral-800 shadow-xl animate-fade-in-up">
                            <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Heart className="w-10 h-10 text-neutral-300" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
                            <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-sm mx-auto">
                                Looks like you haven&apos;t saved any gadgets yet. Explore our store to find the latest tech!
                            </p>
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                            >
                                Start Browsing
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            {wishlistItems.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="bg-white dark:bg-neutral-900 rounded-3xl p-4 sm:p-6 border border-neutral-200 dark:border-neutral-800 shadow-lg hover:shadow-xl transition group overflow-hidden relative"
                                >
                                    <div className="flex flex-col sm:flex-row gap-6 items-center">
                                        <div className="w-32 h-32 flex-shrink-0 bg-neutral-50 dark:bg-neutral-800 rounded-2xl overflow-hidden">
                                            {item.product.product_images?.[0] ? (
                                                <Image
                                                    src={item.product.product_images[0].url}
                                                    alt={item.product.name}
                                                    fill
                                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                    <ShoppingBag className="w-8 h-8 opacity-20" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 text-center sm:text-left">
                                            <Link href={`/products/${item.product.slug}`} className="hover:text-blue-600 transition">
                                                <h3 className="text-xl font-black truncate mb-1">{item.product.name}</h3>
                                            </Link>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3">
                                                {item.product.description}
                                            </p>
                                            <div className="text-2xl font-black text-blue-600">
                                                {formatPrice(item.product.base_price)}
                                            </div>
                                        </div>

                                        <div className="w-full sm:w-auto flex flex-col gap-3">
                                            <AddToCart
                                                productId={item.product.id}
                                                className="!w-full sm:!w-48 !py-4"
                                            />
                                            <WishlistButton
                                                productId={item.product.id}
                                                className="!w-full sm:!w-48 !bg-neutral-100 !text-neutral-500 !p-3 hover:!bg-red-50 hover:!text-red-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
