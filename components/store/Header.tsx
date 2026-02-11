import { createClient } from '@/lib/supabase/server';
import { getCart } from '@/lib/actions/cart';
import Link from 'next/link';
import { ShoppingCart, User, Globe, ChevronDown, Menu, LogOut } from 'lucide-react';
import SearchBar from '@/components/store/SearchBar';

export default async function TopHeader() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: categories } = await supabase
        .from('categories')
        .select('id, name, slug')
        .is('parent_id', null)
        .is('deleted_at', null);

    const cart = await getCart();
    const cartItemsCount = cart?.cart_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
    const cartTotal = cart?.cart_items?.reduce((sum: number, item: any) => {
        const price = item.variant.product.base_price + (item.variant.price_adjustment || 0);
        return sum + (price * item.quantity);
    }, 0) || 0;

    return (
        <div className="flex flex-col w-full">
            {/* Layer 1: Announcement Banner */}
            <div className="bg-blue-600 text-white py-2 text-center text-xs sm:text-sm font-medium">
                Free shipping on all orders over $99! Shop our latest spring deals now.
            </div>

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
                            <span>USD</span>
                            <ChevronDown className="w-3 h-3" />
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/support/contact" className="hover:text-blue-600 transition">Contact Us</Link>
                        <Link href="/support/faqs" className="hover:text-blue-600 transition">FAQs</Link>
                        <Link href="/support/shipping-policy" className="hover:text-blue-600 transition">Shipping</Link>
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
                                <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">${cartTotal.toFixed(2)}</div>
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
            <div className="bg-white dark:bg-black border-b sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center h-12 gap-8 text-sm font-bold uppercase tracking-wide">
                        <div className="group relative h-full flex items-center">
                            <Link href="/products" className="flex items-center gap-1 hover:text-blue-600 transition">
                                Shop All Products
                                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                            </Link>
                            {/* Mega Menu Dropdown */}
                            <div className="invisible group-hover:visible absolute top-full left-0 w-[500%] max-w-[80vw] bg-white dark:bg-neutral-900 shadow-2xl border transition-all transform origin-top scale-y-95 group-hover:scale-y-100 opacity-0 group-hover:opacity-100 p-8 grid grid-cols-4 gap-8 z-50">
                                <div className="col-span-3 grid grid-cols-3 gap-8">
                                    {categories?.map((cat) => (
                                        <div key={cat.id}>
                                            <Link href={`/products?category=${cat.slug}`} className="block font-bold text-blue-600 mb-4 hover:underline">
                                                {cat.name}
                                            </Link>
                                            {/* We could fetch subcategories here if needed */}
                                            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400 font-medium normal-case">
                                                <li><Link href={`/products?category=${cat.slug}&type=latest`} className="hover:text-blue-500">Latest Models</Link></li>
                                                <li><Link href={`/products?category=${cat.slug}&type=featured`} className="hover:text-blue-500">Featured Deals</Link></li>
                                                <li><Link href={`/products?category=${cat.slug}&type=sale`} className="hover:text-blue-500">On Sale</Link></li>
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-xl flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-blue-600 font-black text-xl mb-2 italic underline text-shadow-sm">Spring Sale!</h4>
                                        <p className="text-xs normal-case text-neutral-500">Get up to 40% off on select accessories this week only.</p>
                                    </div>
                                    <Link href="/products?sale=true" className="inline-block py-2 bg-blue-600 text-white text-center rounded-lg text-xs">View Deals</Link>
                                </div>
                            </div>
                        </div>

                        <Link href="/products?category=smartphones" className="hover:text-blue-600 transition">Smartphones</Link>
                        <Link href="/products?category=laptops" className="hover:text-blue-600 transition">Laptops</Link>
                        <Link href="/products?category=audio" className="hover:text-blue-600 transition">Audio</Link>
                        <Link href="/products?category=gaming" className="hover:text-blue-600 transition">Gaming</Link>

                        <div className="ml-auto flex items-center gap-6">
                            <Link href="/support/contact" className="hover:text-blue-600 transition">Contact Us</Link>
                            <Link href="/support/faqs" className="hover:text-blue-600 transition">Help Center</Link>
                        </div>
                    </nav>
                </div>
            </div>
        </div>
    );
}
