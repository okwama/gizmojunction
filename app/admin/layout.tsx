import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ThemeProvider from '@/components/store/ThemeProvider';
import { getStoreConfig } from '@/lib/actions/storeConfig';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Star,
    Settings,
    LogOut,
    ExternalLink,
    Bell,
    Box,
    ChevronRight,
    UserPlus,
    Upload,
    FilePlus,
    Tag,
    Trash2
} from 'lucide-react';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login');
    }

    // Verify admin-level role
    const { data: userRoles } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', user.id);

    const isAdmin = userRoles?.some((ur: any) =>
        ['admin', 'operations', 'inventory_manager', 'customer_support'].includes(ur.roles?.name)
    );

    if (!isAdmin) {
        return redirect('/');
    }

    const config = await getStoreConfig();
    const themeMode = (config.theme_mode as 'light' | 'dark' | 'system') || 'system';

    const navGroups = [
        {
            title: 'Core Operations',
            items: [
                { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
                { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
                { name: 'Quotations', href: '/admin/quotations/new', icon: FilePlus },
            ]
        },
        {
            title: 'Logistics & Catalog',
            items: [
                { name: 'Products', href: '/admin/products', icon: Package },
                { name: 'Import Products', href: '/admin/products/import', icon: Upload },
                { name: 'Categories', href: '/admin/categories', icon: Tag },
                { name: 'Inventory', href: '/admin/inventory', icon: Box },
            ]
        },
        {
            title: 'Customer Success',
            items: [
                { name: 'Customers', href: '/admin/customers', icon: Users },
                { name: 'Reviews', href: '/admin/reviews', icon: Star },
            ]
        },
        {
            title: 'Marketing & Growth',
            items: [
                { name: 'Coupons', href: '/admin/marketing/coupons', icon: Tag },
                { name: 'Abandoned Carts', href: '/admin/marketing/abandoned-carts', icon: Trash2 },
            ]
        },
        {
            title: 'Administration',
            items: [
                { name: 'Team', href: '/admin/team', icon: UserPlus },
                { name: 'Settings', href: '/admin/settings', icon: Settings },
            ]
        }
    ];

    return (
        <ThemeProvider adminTheme={themeMode}>
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex transition-colors duration-300">
                {/* Premium Sidebar */}
                <aside className="w-60 bg-neutral-900 text-white min-h-screen sticky top-0 flex flex-col shadow-2xl z-20 overflow-hidden transform transition-all">
                    {/* Brand Section */}
                    <div className="p-4 border-b border-white/5">
                        <Link href="/admin/dashboard" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                                <span className="text-xl font-black">G</span>
                            </div>
                            <div>
                                <div className="font-black text-lg tracking-tighter">GIZMO</div>
                                <div className="text-[10px] uppercase tracking-widest text-blue-400 font-bold -mt-1">Control Center</div>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Section */}
                    <nav className="flex-1 px-3 py-4 space-y-6 custom-scrollbar overflow-y-auto">
                        {navGroups.map((group) => (
                            <div key={group.title} className="space-y-3">
                                <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-4 h-4 flex items-center">
                                    {group.title}
                                </h3>
                                <div className="space-y-1">
                                    {group.items.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="flex items-center justify-between group px-4 py-3 rounded-xl hover:bg-white/5 transition-all relative overflow-hidden"
                                        >
                                            <div className="flex items-center gap-3 relative z-10">
                                                <item.icon className="w-5 h-5 text-neutral-400 group-hover:text-blue-400 transition-colors" />
                                                <span className="text-sm font-bold text-neutral-300 group-hover:text-white transition-colors">{item.name}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-white/0 group-hover:text-white/20 transition-all -translate-x-2 group-hover:translate-x-0" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="p-4 border-t border-white/5 space-y-2">
                        <Link
                            href="/"
                            className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-sm font-bold"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Live Store
                        </Link>
                        <form action="/auth/sign-out" method="POST">
                            <button
                                type="submit"
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/5 rounded-xl transition-all text-sm font-bold"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </form>
                    </div>
                </aside>

                {/* Main Canvas */}
                <div className="flex-1 flex flex-col min-h-screen">
                    {/* Top Performance Header */}
                    <header className="h-12 bg-white dark:bg-neutral-900/50 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-10 px-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Admin Dashboard</h2>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            <button className="relative p-1.5 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all">
                                <Bell className="w-4 h-4" />
                                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-neutral-900" />
                            </button>

                            <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800" />

                            {/* Profile Summary */}
                            <div className="flex items-center gap-2.5">
                                <div className="text-right hidden sm:block">
                                    <div className="text-xs font-black text-neutral-900 dark:text-white leading-none">Management</div>
                                    <div className="text-[10px] text-blue-500 font-bold uppercase mt-0.5">Super Admin</div>
                                </div>
                                <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-lg shadow-blue-500/20">
                                    AD
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Dashboard Scroll Area */}
                    <main className="flex-1 p-4">
                        {children}
                    </main>
                </div>
            </div>
        </ThemeProvider>
    );
}
