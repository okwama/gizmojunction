import { getAuditLogs } from '@/lib/actions/admin';
import { getStoreConfig } from '@/lib/actions/storeConfig';
import StorefrontConfig from '@/components/admin/StorefrontConfig';
import PaymentConfig from '@/components/admin/PaymentConfig';
import { Settings, Shield, Bell, Database, HardDrive, Cpu, Terminal, History, ChevronRight, Lock, Globe, Save, CreditCard, Truck, Smartphone } from 'lucide-react';

export default async function AdminSettingsPage() {
    // We'll mock some settings for now, but fetch real audit logs
    const auditLogs = await getAuditLogs().catch(() => []);
    const storeConfig = await getStoreConfig(); // Fallback if table doesn't exist yet

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">System Forge</h1>
                    <p className="text-xs text-neutral-500 font-medium mt-0.5">Configure the engine and track administrative trajectory.</p>
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Settings Categories */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Storefront Configuration */}
                    <StorefrontConfig initialConfig={storeConfig} />

                    {/* General Settings */}
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                <Globe className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black">Store Environment</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-neutral-500 tracking-widest">Store Name</label>
                                    <input className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-blue-600 rounded-xl outline-none transition-all text-sm font-bold" defaultValue="Gizmo Junction" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-neutral-500 tracking-widest">Support Email</label>
                                    <input className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-blue-600 rounded-xl outline-none transition-all text-sm font-bold" defaultValue="ops@gizmojunction.com" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-amber-500" />
                                    <div>
                                        <h4 className="text-sm font-black text-amber-600">Maintenance Mode</h4>
                                        <p className="text-xs text-amber-500/80 font-medium">Temporarily disable public access to the storefront.</p>
                                    </div>
                                </div>
                                <div className="w-12 h-6 bg-neutral-200 dark:bg-neutral-800 rounded-full cursor-not-allowed" />
                            </div>
                        </div>
                    </div>

                    {/* Payment Configuration */}
                    <PaymentConfig initialConfig={storeConfig} />

                    {/* Infrastructure Monitor */}
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                                <Cpu className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black">Infrastructure Health</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { label: 'Database', status: 'Optimal', icon: Database, color: 'text-emerald-500' },
                                { label: 'Storage', status: '82% Free', icon: HardDrive, color: 'text-blue-500' },
                                { label: 'Edge Network', status: 'Latency: 12ms', icon: Globe, color: 'text-violet-500' },
                            ].map((item) => (
                                <div key={item.label} className="p-4 border border-neutral-100 dark:border-neutral-800 rounded-2xl">
                                    <item.icon className={`w-5 h-5 ${item.color} mb-2`} />
                                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">{item.label}</p>
                                    <p className="text-sm font-black mt-1">{item.status}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Audit Logs & Security */}
                <div className="space-y-8">
                    {/* Security Quick Actions */}
                    <div className="bg-neutral-900 text-white rounded-3xl p-8 shadow-xl shadow-blue-500/10 relative overflow-hidden group">
                        <h3 className="text-xl font-black relative z-10">Admin Authority</h3>
                        <p className="text-neutral-400 text-xs font-medium mt-2 relative z-10">Manage permissions and security protocols.</p>
                        <div className="space-y-3 mt-6 relative z-10">
                            <button className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                                <span className="text-xs font-bold flex items-center gap-2">
                                    <Lock className="w-3.5 h-3.5 text-blue-400" />
                                    Security Keys
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 opacity-20" />
                            </button>
                            <button className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                                <span className="text-xs font-bold flex items-center gap-2">
                                    <Bell className="w-3.5 h-3.5 text-blue-400" />
                                    Alert Routing
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 opacity-20" />
                            </button>
                        </div>
                        <Terminal className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform" size={150} />
                    </div>

                    {/* Audit Log Viewer */}
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col h-[500px]">
                        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                            <h3 className="text-lg font-black flex items-center gap-2">
                                <History className="w-5 h-5 text-blue-600" />
                                Audit Logs
                            </h3>
                            <span className="text-[10px] font-black uppercase text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">Real-time</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {auditLogs.length === 0 ? (
                                <div className="text-center py-10 opacity-50">
                                    <p className="text-xs font-bold">No logs available</p>
                                    <p className="text-[10px] uppercase mt-1">Starting telemetry...</p>
                                </div>
                            ) : (
                                auditLogs.map((log: any) => (
                                    <div key={log.id} className="relative pl-6 border-l-2 border-neutral-100 dark:border-neutral-800 pb-1">
                                        <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-tight">{log.action}</span>
                                            <span className="text-[10px] text-neutral-500 font-medium mt-0.5">
                                                {log.entity_type} • {new Date(log.created_at).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button className="w-full py-4 text-xs font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 border-t border-neutral-100 dark:border-neutral-800 transition-all">
                            Export Full Registry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
