import { createClient } from '@/lib/supabase/server';
import { getCart } from '@/lib/actions/cart';
import { getStoreConfig } from '@/lib/actions/storeConfig';
import { formatPrice } from '@/lib/formatPrice';
import Link from 'next/link';
import { ShoppingCart, User, Globe, ChevronDown, Menu, LogOut } from 'lucide-react';
import SearchBar from '@/components/store/SearchBar';

export default async function TopHeader() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: categories } = await supabase
        .from('categories')
        .select(`
            id, 
            name, 
            slug,
            subcategories:categories(id, name, slug)
        `)
        .is('parent_id', null)
        .is('deleted_at', null)
        .order('name');

    const { data: topBrands } = await supabase
        .from('brands')
        .select('id, name, slug')
        .limit(6);

    const cart = await getCart();
    const config = await getStoreConfig();
    const cartItemsCount = cart?.cart_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
    const cartTotal = cart?.cart_items?.reduce((sum: number, item: any) => {
        const price = item.variant.product.base_price + (item.variant.price_adjustment || 0);
        return sum + (price * item.quantity);
    }, 0) || 0;

    return (
        <div className="flex flex-col w-full">
            {/* Layer 1: Announcement Banner */}
            {(config.promo_bar_enabled !== false) && (
                <div
                    className="py-2 text-center text-xs sm:text-sm font-medium text-white"
                    style={{ backgroundColor: (config.promo_bar_bg_color as string) || '#2563eb' }}
                >
                    {(config.promo_bar_text as string) || 'Free shipping on all orders over KES 9,900! Shop our latest deals now.'}
                </div>
            )}

            {/* Layer 2: Utility Bar */}
            <div className="bg-neutral-50 dark:bg-neutral-900 border-b py-2 text-xs text-neutral-600 dark:text-neutral-400">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition">
                            <Globe className="w-3 h-3" />
                            <span>English</span>
                            <ChevronDown className="w-3 h-3" />
                        </div>
                        <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition">
                            <span>KES</span>
                            <ChevronDown className="w-3 h-3" />
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/support/contact" className="hover:text-blue-600 transition text-[10px] uppercase font-black tracking-widest">Contact Us</Link>
                        <Link href="/support/faqs" className="hover:text-blue-600 transition text-[10px] uppercase font-black tracking-widest">FAQs</Link>
                        <Link href="/support/shipping-policy" className="hover:text-blue-600 transition text-[10px] uppercase font-black tracking-widest">Shipping</Link>
                        <Link href="/support/returns-exchanges" className="hover:text-blue-600 transition text-[10px] uppercase font-black tracking-widest">Returns</Link>
                    </div>
                </div>
            </div>

            {/* Layer 3: Main Branding Layer */}
            <div className="bg-white dark:bg-neutral-950 py-4 border-b">
                <div className="container mx-auto px-4 flex items-center justify-between gap-8">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-black tracking-tighter text-blue-600 shrink-0">
                        GIZMO<span className="text-neutral-900 dark:text-white">JUNCTION</span>
                    </Link>

                    {/* Search */}
                    <div className="hidden lg:flex flex-1 max-w-2xl">
                        <SearchBar />
                    </div>

                    {/* Meta Actions */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-4">
                            <Link href={user ? "/profile" : "/login"} className="flex items-center gap-2 group">
                                <div className="p-2 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 rounded-full transition">
                                    <User className="w-6 h-6 text-neutral-700 dark:text-neutral-300 group-hover:text-blue-600" />
                                </div>
                                <div className="hidden sm:block text-left">
                                    <div className="text-[10px] text-neutral-500 uppercase font-bold">Account</div>
                                    <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                                        {user ? 'My Profile' : 'Sign In'}
                                    </div>
                                </div>
                            </Link>

                            {user && (
                                <form action="/auth/sign-out" method="POST">
                                    <button
                                        type="submit"
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition text-neutral-500 hover:text-red-600 group"
                                        title="Sign Out"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </form>
                            )}
                        </div>

                        <Link href="/cart" className="flex items-center gap-2 group relative">
                            <div className="p-2 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 rounded-full transition">
                                <ShoppingCart className="w-6 h-6 text-neutral-700 dark:text-neutral-300 group-hover:text-blue-600" />
                                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-neutral-950">
                                    {cartItemsCount}
                                </span>
                            </div>
                            <div className="hidden sm:block text-left">
                                <div className="text-[10px] text-neutral-500 uppercase font-bold">My Cart</div>
                                <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{formatPrice(cartTotal)}</div>
                            </div>
                        </Link>

                        <button className="lg:hidden p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                {/* Search on Mobile */}
                <div className="container mx-auto px-4 mt-4 lg:hidden pb-2">
                    <SearchBar />
                </div>
            </div>

            {/* Layer 4: Mega Menu Nav */}
            <div className="sticky top-0 z-50 glass">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center h-12 gap-8 text-[11px] font-black uppercase tracking-[0.15em]">
                        <div className="group relative h-full flex items-center">
                            <Link href="/products" className="flex items-center gap-1 hover:text-blue-600 transition">
                                Shop All Products
                                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                            </Link>
                            {/* Mega Menu Dropdown */}
                            <div className="invisible group-hover:visible absolute top-full left-0 w-[600px] bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-100 dark:border-neutral-800 transition-all transform origin-top scale-y-95 group-hover:scale-y-100 opacity-0 group-hover:opacity-100 p-8 grid grid-cols-3 gap-8 z-50 rounded-b-2xl">
                                <div className="col-span-2 grid grid-cols-2 gap-8">
                                    {categories?.slice(0, 4).map((cat: any) => (
                                        <div key={cat.id}>
                                            <Link href={`/products?category=${cat.slug}`} className="block font-black text-blue-600 mb-3 hover:underline text-[10px] tracking-widest">
                                                {cat.name}
                                            </Link>
                                            <ul className="space-y-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-bold normal-case">
                                                {cat.subcategories?.slice(0, 4).map((sub: any) => (
                                                    <li key={sub.id}>
                                                        <Link href={`/products?category=${sub.slug}`} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                                                            {sub.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                                {cat.subcategories?.length > 4 && (
                                                    <li>
                                                        <Link href={`/products?category=${cat.slug}`} className="text-blue-500 hover:text-blue-600">
                                                            + View More
                                                        </Link>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                                    <h4 className="text-neutral-900 dark:text-white font-black text-[10px] uppercase tracking-[0.2em] mb-4">Top Brands</h4>
                                    <ul className="space-y-3">
                                        {topBrands?.map((brand) => (
                                            <li key={brand.id}>
                                                <Link
                                                    href={`/products?brand=${brand.slug}`}
                                                    className="flex items-center justify-between group/brand"
                                                >
                                                    <span className="text-[11px] font-bold text-neutral-500 group-hover/brand:text-blue-600 transition-colors">{brand.name}</span>
                                                    <ChevronDown className="w-3 h-3 text-neutral-300 -rotate-90 group-hover/brand:text-blue-600 transition-colors" />
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                                        <Link
                                            href="/products?sale=true"
                                            className="block w-full py-3 bg-blue-600 text-white text-center rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                                        >
                                            Spring Deals
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top level links */}
                        {categories?.slice(0, 5).map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/products?category=${cat.slug}`}
                                className="hover:text-blue-600 transition"
                            >
                                {cat.name}
                            </Link>
                        ))}

                        <div className="ml-auto flex items-center gap-6">
                            <div className="group relative h-full flex items-center">
                                <span className="hover:text-blue-600 transition text-[10px] cursor-pointer flex items-center gap-1">
                                    Support
                                    <ChevronDown className="w-3 h-3" />
                                </span>
                                <div className="invisible group-hover:visible absolute top-full right-0 w-48 bg-white dark:bg-neutral-900 shadow-xl border border-neutral-100 dark:border-neutral-800 p-4 z-50 rounded-b-xl">
                                    <ul className="space-y-3">
                                        <li><Link href="/support/contact" className="block text-[10px] font-bold text-neutral-500 hover:text-blue-600 uppercase tracking-widest">Contact Us</Link></li>
                                        <li><Link href="/support/faqs" className="block text-[10px] font-bold text-neutral-500 hover:text-blue-600 uppercase tracking-widest">FAQs</Link></li>
                                        <li><Link href="/support/shipping-policy" className="block text-[10px] font-bold text-neutral-500 hover:text-blue-600 uppercase tracking-widest">Shipping Policy</Link></li>
                                        <li><Link href="/support/returns-exchanges" className="block text-[10px] font-bold text-neutral-500 hover:text-blue-600 uppercase tracking-widest">Returns</Link></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
        </div>
    );
}
