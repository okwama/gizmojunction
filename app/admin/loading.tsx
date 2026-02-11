import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
    return (
        <div className="flex items-center justify-center min-h-[40vh]">
            <div className="flex items-center gap-3 text-neutral-400 font-bold text-xs uppercase tracking-widest">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                Synchronizing...
            </div>
        </div>
    );
}
