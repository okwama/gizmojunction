import { createClient } from '@/lib/supabase/server';
import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gizmojunction.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient();

    // Fetch all live products for sitemap
    const { data: products } = await supabase
        .from('products')
        .select('slug, updated_at')
        .is('deleted_at', null);

    // Fetch all categories
    const { data: categories } = await supabase
        .from('categories')
        .select('slug, updated_at')
        .is('deleted_at', null);

    const productUrls: MetadataRoute.Sitemap = (products || []).map((p) => ({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    const categoryUrls: MetadataRoute.Sitemap = (categories || []).map((c) => ({
        url: `${SITE_URL}/products?category=${c.slug}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    const staticPages: MetadataRoute.Sitemap = [
        { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${SITE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${SITE_URL}/cart`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
        { url: `${SITE_URL}/support/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${SITE_URL}/support/shipping`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
        { url: `${SITE_URL}/support/returns`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
        { url: `${SITE_URL}/support/faqs`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    ];

    return [...staticPages, ...productUrls, ...categoryUrls];
}
