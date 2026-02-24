'use server';

import { createClient } from '@/lib/supabase/server';

export interface StoreConfig {
    // Hero
    hero_image_url?: string;
    hero_title?: string;
    hero_subtitle?: string;
    hero_cta_text?: string;
    // Promo bar
    promo_bar_text?: string;
    promo_bar_enabled?: boolean;
    promo_bar_bg_color?: string;
    // Theme
    theme_mode?: 'light' | 'dark' | 'system';
    // General
    [key: string]: any;
}

/**
 * Fetch all store_settings as a flat key→value map.
 */
export async function getStoreConfig(): Promise<StoreConfig> {
    const supabase = await createClient();

    const { data: settings, error } = await supabase
        .from('store_settings')
        .select('key, value');

    if (error) {
        console.error('Error fetching store config:', error);
        return {};
    }

    const config: StoreConfig = {};
    settings?.forEach((row: { key: string; value: any }) => {
        config[row.key] = row.value;
    });

    return config;
}
