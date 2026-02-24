import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProducts } from '@/lib/actions/products';
import { getStoreConfig } from '@/lib/actions/storeConfig';
import { formatPrice } from '@/lib/formatPrice';
import BrandMarquee from '@/components/store/BrandMarquee';
import FlashSale from '@/components/store/FlashSale';
import WishlistButton from '@/components/store/WishlistButton';
import CompareButton from '@/components/store/CompareButton';
import {
    Smartphone,
    Laptop,
    Headphones,
    Watch,
    Tablet,
    Camera,
    Gamepad2,
    Cable,
    Truck,
    CreditCard,
    RotateCcw,
    ArrowRight,
    ShoppingBag
} from 'lucide-react';

export default async function HomePage() {
    const featuredProducts = await getFeaturedProducts();
    const config = await getStoreConfig();

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-slate-900 text-white overflow-hidden">
                {/* Configurable background image */}
                {config.hero_image_url ? (
                    <div className="absolute inset-0">
                        <Image
                            src={config.hero_image_url as string}
                            alt="Hero"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-slate-900/70" />
                    </div>
                ) : (
                    <div className="absolute inset-0 opacity-5">
                        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 100 L 100 0 L 100 100 Z" fill="white" />
                        </svg>
                    </div>
                )}

                <div className="container mx-auto px-4 py-24 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
                            {(config.hero_title as string) || <>The Future of <span className="text-blue-400">Tech</span> is Here</>}
                        </h1>
                        <p className="text-xl md:text-2xl mb-10 text-slate-300 max-w-2xl mx-auto">
                            {(config.hero_subtitle as string) || 'Upgrade your lifestyle with the latest electronics, gadgets, and smart devices at unbeatable prices.'}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/products"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-50 transition transform hover:scale-105 shadow-lg"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                {(config.hero_cta_text as string) || 'Shop Now'}
                            </Link>
                            <Link
                                href="/products?featured=true"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-700 text-white font-bold rounded-lg hover:bg-white/10 transition"
                            >
                                View Deals
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <BrandMarquee />

            {/* Categories Section - Theme Aware */}
            <section className="py-16 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 animate-fade-in-up">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Shop by Category</h2>
                            <p className="text-neutral-500 dark:text-neutral-400">Find exactly what you need</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        {categories.map((category) => (
                            <Link
                                key={category.slug}
                                href={`/products?category=${category.slug}`}
                                className="group bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-lg p-4 hover:shadow-md transition-all duration-200 text-center flex flex-col items-center justify-center h-full hover:bg-white dark:hover:bg-neutral-700 hover:border-blue-200 dark:hover:border-blue-800"
                            >
                                <div className="bg-white dark:bg-neutral-700 w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition shadow-sm border border-neutral-100 dark:border-neutral-600">
                                    <category.icon className="w-6 h-6 text-slate-700 dark:text-neutral-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                </div>
                                <h3 className="font-semibold text-sm transition">
                                    {category.name}
                                </h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products Section - Theme Aware */}
            <section className="py-16 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold">Featured Products</h2>
                        <Link href="/products" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 text-sm flex items-center transition">
                            View All <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {featuredProducts.length === 0 ? (
                            <div className="col-span-full text-center py-12 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                                <p className="text-neutral-500 font-medium">No featured products available yet.</p>
                                <Link href="/admin/products" className="text-blue-600 text-sm font-bold mt-2 hover:underline">Manage Products</Link>
                            </div>
                        ) : (
                            featuredProducts.map((product: any) => (
                                <Link
                                    key={product.id}
                                    href={`/products/${product.slug}`}
                                    className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-100 dark:border-neutral-700 hover:shadow-lg transition group flex flex-col h-full"
                                >
                                    <div className="aspect-[4/3] bg-neutral-50 dark:bg-neutral-900 relative overflow-hidden rounded-t-lg">
                                        {product.product_images?.[0] ? (
                                            <Image
                                                src={product.product_images[0].url}
                                                alt={product.product_images[0].alt_text || product.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-neutral-300 dark:text-neutral-700">
                                                <Smartphone className="w-12 h-12 opacity-20" />
                                            </div>
                                        )}
                                        {product.featured && (
                                            <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded shadow-lg">
                                                Featured
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <WishlistButton productId={product.id} className="shadow-lg backdrop-blur-md bg-white/50" />
                                            <CompareButton productId={product.id} className="shadow-lg backdrop-blur-md bg-white/50" />
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-bold mb-1 truncate dark:text-white">{product.name}</h3>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 line-clamp-2">{product.description}</p>
                                        <div className="flex justify-between items-center mt-auto">
                                            <span className="font-bold text-blue-600 dark:text-blue-400">{formatPrice(product.base_price)}</span>
                                            <button className="p-2 bg-neutral-100 dark:bg-neutral-700 text-slate-600 dark:text-neutral-300 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition">
                                                <ShoppingBag className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </section>

            <FlashSale />

            {/* Features Section - Theme Aware */}
            <section className="py-16 bg-neutral-50 dark:bg-neutral-950/20 text-neutral-900 dark:text-neutral-100 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature) => (
                            <div key={feature.title} className="flex items-start p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm">
                                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg mr-4">
                                    <feature.icon className="w-6 h-6 text-slate-600 dark:text-neutral-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

const categories = [
    { name: 'Phones', slug: 'smartphones', icon: Smartphone, count: 150 },
    { name: 'Laptops', slug: 'laptops', icon: Laptop, count: 85 },
    { name: 'Audio', slug: 'headphones', icon: Headphones, count: 120 },
    { name: 'Wearables', slug: 'smartwatches', icon: Watch, count: 65 },
    { name: 'Tablets', slug: 'tablets', icon: Tablet, count: 45 },
    { name: 'Cameras', slug: 'cameras', icon: Camera, count: 55 },
    { name: 'Gaming', slug: 'gaming', icon: Gamepad2, count: 90 },
    { name: 'Cables', slug: 'accessories', icon: Cable, count: 200 },
];

const features = [
    {
        icon: Truck,
        title: 'Free Shipping',
        description: 'On all orders over KES 5,000',
    },
    {
        icon: CreditCard,
        title: 'Secure Payment',
        description: '100% secure checkout',
    },
    {
        icon: RotateCcw,
        title: 'Easy Returns',
        description: '30-day money back',
    },
];
