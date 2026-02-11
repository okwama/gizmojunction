'use client';

import { useState } from 'react';
import { updateStaffRole } from '@/lib/actions/admin';
import { Loader2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RoleSelectorProps {
    userId: string;
    currentRoleId: string;
    roles: { id: string; name: string }[];
}

export default function RoleSelector({ userId, currentRoleId, roles }: RoleSelectorProps) {
    const [isPending, setIsPending] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRoleId = e.target.value;
        setIsPending(true);
        setSuccess(false);

        try {
            await updateStaffRole(userId, newRoleId);
            setSuccess(true);
            router.refresh();

            // Reset success indicator after 2 seconds
            setTimeout(() => setSuccess(false), 2000);
        } catch (error) {
            console.error('Failed to update role:', error);
            alert('Failed to update role. Please try again.');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="relative flex items-center">
            <select
                disabled={isPending}
                defaultValue={currentRoleId}
                onChange={handleRoleChange}
                className="bg-neutral-100 dark:bg-neutral-800 border-none rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-600/20 outline-none appearance-none pr-8 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
            >
                {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                        {role.name.replace('_', ' ').toUpperCase()}
                    </option>
                ))}
            </select>

            <div className="absolute right-2 pointer-events-none">
                {isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                ) : success ? (
                    <Check className="w-3 h-3 text-emerald-500 animate-in zoom-in" />
                ) : (
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-neutral-400" />
                )}
            </div>
        </div>
    );
}
