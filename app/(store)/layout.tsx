import Link from 'next/link';
import SearchBar from '@/components/store/SearchBar';
import Header from '@/components/store/Header';
import ThemeProvider from '@/components/store/ThemeProvider';
import { getStoreConfig } from '@/lib/actions/storeConfig';
import BottomNav from '@/components/store/BottomNav';
import { ComparisonProvider } from '@/components/store/ComparisonContext';
import ComparisonTray from '@/components/store/ComparisonTray';

export default async function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const config = await getStoreConfig();
    const themeMode = (config.theme_mode as 'light' | 'dark' | 'system') || 'system';

    return (
        <ThemeProvider adminTheme={themeMode}>
            <ComparisonProvider>
                <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 pb-20 sm:pb-0">
                    {/* Header */}
                    <Header />

                    {/* Main Content */}
                    <main className="flex-1">
                        {children}
                    </main>

                    {/* Footer */}
                    <footer className="border-t bg-neutral-50 dark:bg-neutral-950 mt-auto transition-colors duration-300">
                        <div className="container mx-auto px-4 py-12">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                                <div className="space-y-4">
                                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">Gizmo Junction</div>
                                    <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                                        Your premium destination for the latest electronics and smart technology. We bring the future to your doorstep.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-900 dark:text-white mb-6">Shop</h4>
                                    <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
                                        <li><Link href="/products" className="hover:text-blue-600 dark:hover:text-blue-400 transition">All Products</Link></li>
                                        <li><Link href="/products?category=smartphones" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Smartphones</Link></li>
                                        <li><Link href="/products?category=laptops" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Laptops</Link></li>
                                        <li><Link href="/products?category=accessories" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Accessories</Link></li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-900 dark:text-white mb-6">Support</h4>
                                    <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
                                        <li><Link href="/support/shipping-policy" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Shipping Policy</Link></li>
                                        <li><Link href="/support/returns-exchanges" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Returns & Exchanges</Link></li>
                                        <li><Link href="/support/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Contact Us</Link></li>
                                        <li><Link href="/support/faqs" className="hover:text-blue-600 dark:hover:text-blue-400 transition">FAQs</Link></li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-900 dark:text-white mb-6">Connect</h4>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Stay updated with our latest offers.</p>
                                    <div className="flex gap-4">
                                        {/* Social placeholders could go here */}
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-neutral-200 dark:border-neutral-800 mt-12 pt-8 text-center text-xs text-neutral-500 dark:text-neutral-500">
                                &copy; {new Date().getFullYear()} Gizmo Junction. Built for tech enthusiasts.
                            </div>
                        </div>
                    </footer>

                    <ComparisonTray />
                    <BottomNav />
                </div>
            </ComparisonProvider>
        </ThemeProvider>
    );
}
