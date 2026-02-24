'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Timer, Zap, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';
import Link from 'next/link';

export default function FlashSale() {
    const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="py-16 bg-blue-600 overflow-hidden relative group">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-50 transition-transform group-hover:scale-125 duration-1000" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-700 rounded-full blur-3xl opacity-50" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="max-w-xl text-center lg:text-left text-white">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6">
                            <Zap className="w-3 h-3 fill-white" />
                            Flash Sale Live
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tighter">
                            UP TO <span className="text-yellow-400">40% OFF</span> ON PREMIUM AUDIO
                        </h2>
                        <p className="text-blue-100 text-lg mb-10 font-medium">
                            Grab the latest Sony, Apple, and Bose headphones at prices you won&apos;t see again this year.
                        </p>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl w-24 text-center">
                                <p className="text-3xl font-black tabular-nums">{String(timeLeft.hours).padStart(2, '0')}</p>
                                <p className="text-[10px] uppercase font-bold text-blue-200">Hours</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl w-24 text-center">
                                <p className="text-3xl font-black tabular-nums">{String(timeLeft.minutes).padStart(2, '0')}</p>
                                <p className="text-[10px] uppercase font-bold text-blue-200">Mins</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl w-24 text-center">
                                <p className="text-3xl font-black tabular-nums text-yellow-400">{String(timeLeft.seconds).padStart(2, '0')}</p>
                                <p className="text-[10px] uppercase font-bold text-blue-200">Secs</p>
                            </div>
                        </div>

                        <Link
                            href="/products?category=audio"
                            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-blue-600 font-black rounded-2xl hover:bg-neutral-50 transition-all hover:scale-105 shadow-2xl active:scale-95"
                        >
                            Shop the Sale
                            <ShoppingBag className="w-5 h-5" />
                        </Link>
                    </div>

                    <div className="relative">
                        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-[2rem] shadow-2xl">
                            <Image
                                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop"
                                alt="Premium Headphones"
                                width={400}
                                height={300}
                                className="object-cover rounded-2xl shadow-xl transform group-hover:rotate-3 transition-transform duration-500"
                            />
                            <div className="absolute -top-4 -right-4 bg-yellow-400 text-slate-900 w-24 h-24 rounded-full flex flex-col items-center justify-center font-black rotate-12 shadow-xl ring-8 ring-blue-600">
                                <p className="text-xs uppercase leading-none">Save</p>
                                <p className="text-xl">40%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
