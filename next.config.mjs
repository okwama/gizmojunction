/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'vvxkpqrzbusyrblgbzgr.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'upload.wikimedia.org',
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '5mb',
        },
    },
};

export default nextConfig;
