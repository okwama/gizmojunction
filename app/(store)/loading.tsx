import { Loader2 } from 'lucide-react';

export default function StoreLoading() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
            <div className="flex items-center gap-3 text-neutral-400 font-bold text-xs uppercase tracking-widest">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                Loading...
            </div>
        </div>
    );
}
