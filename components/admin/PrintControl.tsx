'use client';

import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PrintControlProps {
    orderId: string;
    title: string;
}

export default function PrintControl({ orderId, title }: PrintControlProps) {
    return (
        <div className="mb-8 flex items-center justify-between no-print bg-neutral-50 p-4 rounded-xl border border-neutral-200">
            <div className="flex items-center gap-4">
                <Link href={`/admin/orders/${orderId}`} className="flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-black">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Order
                </Link>
                <div className="h-4 w-px bg-neutral-300" />
                <span className="text-sm font-black uppercase tracking-widest text-neutral-400">Preview: {title}</span>
            </div>
            <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
            >
                <Printer className="w-4 h-4" />
                Print Document
            </button>
        </div>
    );
}
