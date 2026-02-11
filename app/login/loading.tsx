import { Loader2 } from 'lucide-react';

export default function LoginLoading() {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
            <div className="flex items-center gap-3 text-neutral-400 font-bold text-xs uppercase tracking-widest">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                Preparing session...
            </div>
        </div>
    );
}
