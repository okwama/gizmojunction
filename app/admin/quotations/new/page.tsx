import { createClient } from '@/lib/supabase/server';
import QuotationForm from '@/components/admin/QuotationForm';
import { FilePlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewQuotationPage() {
    const supabase = await createClient();

    const { data: products } = await supabase
        .from('products')
        .select('id, name, base_price')
        .is('deleted_at', null)
        .order('name');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/dashboard"
                        className="p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Draft New Quotation</h1>
                        <p className="text-xs text-neutral-500 font-medium mt-0.5">Create a professional estimate for your potential client.</p>
                    </div>
                </div>
            </div>

            <QuotationForm products={products || []} />
        </div>
    );
}
