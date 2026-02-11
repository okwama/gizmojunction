/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'vvxkpqrzbusyrblgbzgr.supabase.co',
            },
        ],
    },
};

export default nextConfig;
