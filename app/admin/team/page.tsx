import { getStaffProfiles, getRoles, updateStaffRole } from '@/lib/actions/admin';
import { ShieldCheck, User, Mail, Calendar, MoreHorizontal, ShieldPlus, ChevronDown, Check, UserPlus } from 'lucide-react';
import RoleSelector from '@/components/admin/RoleSelector';
import AddStaffModal from '@/components/admin/AddStaffModal';

export default async function AdminTeamPage() {
    const staff = await getStaffProfiles();
    const roles = await getRoles();

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white">Staff Management</h1>
                    <p className="text-neutral-500 font-medium mt-1">Orchestrate your team and calibrate access levels.</p>
                </div>

                <AddStaffModal roles={roles} />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Administrators', value: staff.filter((s: any) => s.user_roles?.some((ur: any) => ur.roles?.name === 'admin')).length, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Operations Staff', value: staff.length, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Access Requests', value: 0, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">{stat.label}</p>
                        <h3 className="text-3xl font-black mt-2">{stat.value}</h3>
                        <div className={`mt-4 h-1 w-12 rounded-full ${stat.bg.replace('bg-', 'bg-')}`} />
                    </div>
                ))}
            </div>

            {/* Staff Table */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-neutral-400 tracking-widest">Member</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-neutral-400 tracking-widest">Primary Role</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-neutral-400 tracking-widest">Joined</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-neutral-400 tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {staff.map((member: any) => (
                            <tr key={member.id} className="group hover:bg-neutral-50/50 dark:hover:bg-white/5 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 font-black text-xl shadow-inner">
                                            {member.full_name?.charAt(0) || <User className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <p className="font-black text-neutral-900 dark:text-white leading-none">{member.full_name || 'Anonymous'}</p>
                                            <p className="text-xs text-neutral-400 font-medium mt-1.5 flex items-center gap-1.5">
                                                <Mail className="w-3 h-3" />
                                                {member.id.substring(0, 18)}...
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <RoleSelector
                                            userId={member.id}
                                            currentRoleId={member.user_roles?.[0]?.roles?.id}
                                            roles={roles}
                                        />
                                        {member.user_roles?.[0]?.roles?.name === 'admin' && (
                                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(member.created_at).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-all">
                                        <MoreHorizontal className="w-5 h-5 text-neutral-400" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {staff.length === 0 && (
                    <div className="p-20 text-center">
                        <ShieldPlus className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold">The Team is Empty</h3>
                        <p className="text-neutral-500 mt-2">Initialize your administrative cohort to begin.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
