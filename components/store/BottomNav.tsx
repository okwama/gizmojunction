'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, User, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Search', href: '/products', icon: Search },
        { label: 'Wishlist', href: '/wishlist', icon: Heart },
        { label: 'Cart', href: '/cart', icon: ShoppingBag },
        { label: 'Account', href: '/profile', icon: User },
    ];

    return (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[100] glass border-t border-white/20 dark:border-white/10 px-4 pb-6 pt-3 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between items-center">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-all duration-300",
                                isActive ? "text-blue-600 scale-110" : "text-neutral-500 hover:text-blue-500"
                            )}
                        >
                            <item.icon className={cn("w-6 h-6", isActive && "fill-blue-600/10")} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
