'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const brands = [
    { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
    { name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
    { name: 'Sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg' },
    { name: 'LG', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/LG_logo_%282015%29.svg' },
    { name: 'Dell', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg' },
    { name: 'HP', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg' },
    { name: 'Lenovo', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg' },
    { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg' },
];

export default function BrandMarquee() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="py-10 bg-neutral-50/50 dark:bg-neutral-900/50 border-y border-neutral-100 dark:border-neutral-800 overflow-hidden group">
            <div className="container mx-auto px-4 mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 text-center">Authorized Retailer For Global Leaders</p>
            </div>

            <div className="relative flex overflow-hidden">
                <div className="flex animate-marquee whitespace-nowrap gap-12 py-4 items-center">
                    {/* First set of brands */}
                    {brands.map((brand, i) => (
                        <div key={`brand-1-${i}`} className="flex items-center justify-center w-32 h-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer px-4">
                            <Image
                                src={brand.logo}
                                alt={brand.name}
                                width={128}
                                height={48}
                                className="max-w-full max-h-full object-contain dark:invert"
                            />
                        </div>
                    ))}
                    {/* Duplicate set for seamless looping */}
                    {brands.map((brand, i) => (
                        <div key={`brand-2-${i}`} className="flex items-center justify-center w-32 h-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer px-4">
                            <Image
                                src={brand.logo}
                                alt={brand.name}
                                width={128}
                                height={48}
                                className="max-w-full max-h-full object-contain dark:invert"
                            />
                        </div>
                    ))}
                </div>

                {/* Second duplicated row for perfect smoothness */}
                <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap gap-12 py-4 items-center">
                    {brands.map((brand, i) => (
                        <div key={`brand-3-${i}`} className="flex items-center justify-center w-32 h-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer px-4">
                            <Image
                                src={brand.logo}
                                alt={brand.name}
                                width={128}
                                height={48}
                                className="max-w-full max-h-full object-contain dark:invert"
                            />
                        </div>
                    ))}
                    {brands.map((brand, i) => (
                        <div key={`brand-4-${i}`} className="flex items-center justify-center w-32 h-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer px-4">
                            <Image
                                src={brand.logo}
                                alt={brand.name}
                                width={128}
                                height={48}
                                className="max-w-full max-h-full object-contain dark:invert"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
                .animate-marquee2 {
                    animation: marquee2 40s linear infinite;
                }
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-100%); }
                }
                @keyframes marquee2 {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(0%); }
                }
                .group:hover .animate-marquee,
                .group:hover .animate-marquee2 {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}
