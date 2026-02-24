'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthSync() {
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            // Trigger router refresh on significant auth changes
            // This forces server components (like the Header) to re-render
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
                router.refresh();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, router]);

    return null; // This component doesn't render anything
}
