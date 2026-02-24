'use client';

import { useEffect, useState } from 'react';

interface ThemeProviderProps {
    children: React.ReactNode;
    adminTheme?: 'light' | 'dark' | 'system';
}

export default function ThemeProvider({ children, adminTheme = 'system' }: ThemeProviderProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;

        const applyTheme = (mode: 'light' | 'dark') => {
            if (mode === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        if (adminTheme === 'dark') {
            applyTheme('dark');
        } else if (adminTheme === 'light') {
            applyTheme('light');
        } else {
            // System mode: respect OS preference
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            applyTheme(mediaQuery.matches ? 'dark' : 'light');

            const handler = (e: MediaQueryListEvent) => {
                applyTheme(e.matches ? 'dark' : 'light');
            };

            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, [adminTheme, mounted]);

    return <>{children}</>;
}
