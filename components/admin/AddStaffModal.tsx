'use client';

import { useState } from 'react';
import { createStaffMember } from '@/lib/actions/admin';
import { Loader2, Plus, Mail, Lock, UserPlus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AddStaffModalProps {
    roles: { id: string; name: string }[];
}

export default function AddStaffModal({ roles }: AddStaffModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'invite' | 'create'>('invite');
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsPending(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const roleId = formData.get('role') as string;
        const password = formData.get('password') as string;

        try {
            if (mode === 'create' && !password) {
                throw new Error('Password is required for direct creation');
            }

            await createStaffMember(email, roleId, mode === 'create' ? password : undefined);

            setIsOpen(false);
            router.refresh();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to add staff member');
        } finally {
            setIsPending(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
            >
                <UserPlus className="w-4 h-4" />
                Add Staff Member
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 relative border border-white/10">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                    <h2 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">Add New Staff</h2>
                    <p className="text-neutral-500 font-medium text-sm mt-1">Expand your team&apos;s capabilities.</p>
                </div>

                {/* Mode Toggles */}
                <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl mb-6">
                    <button
                        type="button"
                        onClick={() => setMode('invite')}
                        className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'invite'
                            ? 'bg-white dark:bg-neutral-700 shadow-sm text-blue-600'
                            : 'text-neutral-400 hover:text-neutral-600'
                            }`}
                    >
                        Send Invite
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('create')}
                        className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'create'
                            ? 'bg-white dark:bg-neutral-700 shadow-sm text-blue-600'
                            : 'text-neutral-400 hover:text-neutral-600'
                            }`}
                    >
                        Direct Create
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-neutral-500 tracking-widest">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="colleague@gizmo.com"
                                className="w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-blue-600 rounded-xl outline-none transition-all text-sm font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-neutral-500 tracking-widest">Role</label>
                        <div className="relative">
                            <select
                                name="role"
                                required
                                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-blue-600 rounded-xl outline-none transition-all text-sm font-bold appearance-none cursor-pointer"
                            >
                                {roles.map(r => (
                                    <option key={r.id} value={r.id}>{r.name.replace('_', ' ').toUpperCase()}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <UserPlus className="w-4 h-4 text-neutral-400" />
                            </div>
                        </div>
                    </div>

                    {mode === 'create' && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 fade-in">
                            <label className="text-xs font-black uppercase text-neutral-500 tracking-widest">Temporary Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <input
                                    name="password"
                                    type="text"
                                    required={mode === 'create'}
                                    placeholder="SecretKey123!"
                                    className="w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-blue-600 rounded-xl outline-none transition-all text-sm font-bold"
                                />
                            </div>
                            <p className="text-[10px] text-amber-500 font-bold">
                                ⚠️ Make sure to copy this password. It will not be shown again.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold flex items-center gap-2">
                            <X className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-6 transition-all"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {mode === 'invite' ? 'Send Invitation' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}
