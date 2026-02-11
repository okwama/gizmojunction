import { createClient } from '@/lib/supabase/server';
import {
    Box,
    ArrowUpDown,
    History,
    Plus,
    Minus,
    AlertTriangle,
    Warehouse as WarehouseIcon,
    Search,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';
import { getInventory, getWarehouses, getInventoryMovements, getVariants } from '@/lib/actions/inventory';
import InventoryAdjustForm from '@/components/admin/InventoryAdjustForm';

export default async function AdminInventoryPage() {
    const inventory = await getInventory();
    const warehouses = await getWarehouses() as any[];
    const movements = await getInventoryMovements();
    const variants = await getVariants() as any[];

    // Calculate low stock items (less than 10)
    const lowStockCount = inventory?.filter((item: any) => item.quantity < 10).length || 0;
    const totalItems = inventory?.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0) || 0;

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white">Inventory Control</h1>
                    <p className="text-neutral-500 font-medium mt-1">Manage stock levels across all active warehouses.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            placeholder="Locate item or SKU..."
                            className="pl-11 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-600/20 transition-all w-64"
                        />
                    </div>
                    <InventoryAdjustForm warehouses={warehouses} variants={variants} />
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start">
                        <div className="p-4 bg-blue-500 rounded-2xl text-white shadow-lg">
                            <Box className="w-6 h-6" />
                        </div>
                        <div className="text-[10px] uppercase font-black tracking-widest text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full">Active Items</div>
                    </div>
                    <div className="mt-8">
                        <h3 className="text-4xl font-black text-neutral-900 dark:text-white">{totalItems}</h3>
                        <p className="text-sm font-bold text-neutral-500 mt-1 uppercase tracking-wider">Total Units in Stock</p>
                    </div>
                    <Box size={100} className="absolute -bottom-4 -right-4 opacity-5 group-hover:scale-110 transition-transform" />
                </div>

                <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start">
                        <div className={`p-4 ${lowStockCount > 0 ? 'bg-orange-500' : 'bg-emerald-500'} rounded-2xl text-white shadow-lg`}>
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className={`text-[10px] uppercase font-black tracking-widest ${lowStockCount > 0 ? 'text-orange-500 bg-orange-500/10' : 'text-emerald-500 bg-emerald-500/10'} px-2 py-1 rounded-full`}>
                            {lowStockCount > 0 ? 'Action Required' : 'Healthy'}
                        </div>
                    </div>
                    <div className="mt-8">
                        <h3 className="text-4xl font-black text-neutral-900 dark:text-white">{lowStockCount}</h3>
                        <p className="text-sm font-bold text-neutral-500 mt-1 uppercase tracking-wider">Low Stock SKU Alerts</p>
                    </div>
                    <AlertTriangle size={100} className="absolute -bottom-4 -right-4 opacity-5 group-hover:scale-110 transition-transform" />
                </div>

                <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start">
                        <div className="p-4 bg-violet-500 rounded-2xl text-white shadow-lg">
                            <WarehouseIcon className="w-6 h-6" />
                        </div>
                        <div className="text-[10px] uppercase font-black tracking-widest text-violet-500 bg-violet-500/10 px-2 py-1 rounded-full">Network</div>
                    </div>
                    <div className="mt-8">
                        <h3 className="text-4xl font-black text-neutral-900 dark:text-white">{warehouses?.length || 0}</h3>
                        <p className="text-sm font-bold text-neutral-500 mt-1 uppercase tracking-wider">Active Warehouses</p>
                    </div>
                    <WarehouseIcon size={100} className="absolute -bottom-4 -right-4 opacity-5 group-hover:scale-110 transition-transform" />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                {/* Stock Table */}
                <div className="xl:col-span-2 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                    <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black">Stock Ledger</h3>
                            <p className="text-sm text-neutral-500 font-medium leading-none mt-1">Detailed inventory levels by warehouse.</p>
                        </div>
                        <button className="text-xs font-black text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-xl transition-all uppercase tracking-widest border border-blue-100 dark:border-blue-900">Export CSV</button>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-50/50 dark:bg-neutral-800/30 border-b border-neutral-100 dark:border-neutral-800">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">Product / SKU</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">Warehouse</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">Quantity</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">Last Sync</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                                {inventory?.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div>
                                                <div className="text-sm font-black text-neutral-900 dark:text-white truncate max-w-[200px]">
                                                    {item.product_variants?.products?.name}
                                                </div>
                                                <div className="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-wider flex items-center gap-1">
                                                    <span className="text-blue-500">SKU:</span> {item.product_variants?.sku}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                                                    <WarehouseIcon className="w-3 h-3 text-neutral-500" />
                                                </div>
                                                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                                    {item.warehouses?.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-lg font-black ${item.quantity < 10 ? 'text-orange-500' : 'text-neutral-900 dark:text-white'}`}>
                                                    {item.quantity}
                                                </span>
                                                {item.quantity < 10 && (
                                                    <div className="animate-pulse w-1.5 h-1.5 bg-orange-500 rounded-full" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.quantity > 50
                                                ? 'bg-emerald-500/10 text-emerald-500'
                                                : item.quantity > 10
                                                    ? 'bg-blue-500/10 text-blue-500'
                                                    : 'bg-orange-500/10 text-orange-500'
                                                }`}>
                                                {item.quantity > 50 ? 'In Stock' : item.quantity > 10 ? 'Optimal' : 'Low Stock'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
                                            {new Date(item.updated_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {!inventory?.length && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <Box className="w-12 h-12 text-neutral-200 mb-4" />
                                                <p className="text-neutral-500 font-bold">No inventory levels recorded yet.</p>
                                                <button className="text-blue-600 font-black text-xs uppercase tracking-widest mt-2 hover:underline">Log First Movement</button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: History & Trends */}
                <div className="space-y-8">
                    {/* Recent Movement */}
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-neutral-100 dark:border-neutral-800">
                            <h3 className="text-xl font-black flex items-center gap-2">
                                <History className="w-5 h-5 text-blue-600" />
                                Growth Logs
                            </h3>
                            <p className="text-sm text-neutral-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Recent stock movements</p>
                        </div>
                        <div className="p-2 space-y-1">
                            {movements?.map((m: any) => (
                                <div key={m.id} className="p-4 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.quantity_change > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                            }`}>
                                            {m.quantity_change > 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-black truncate text-neutral-900 dark:text-white uppercase tracking-tighter">
                                                {m.product_variants?.sku}
                                            </div>
                                            <div className="text-[10px] font-bold text-neutral-400 mt-0.5 truncate uppercase">
                                                {m.movement_type} • {m.warehouses?.name}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`text-sm font-black text-right ${m.quantity_change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {m.quantity_change > 0 ? '+' : ''}{m.quantity_change}
                                    </div>
                                </div>
                            ))}
                            {!movements?.length && (
                                <div className="p-10 text-center">
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">No recent logs</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-neutral-50/50 dark:bg-neutral-800/20 border-t border-neutral-100 dark:border-neutral-800">
                            <button className="w-full py-3 text-[10px] font-black text-neutral-500 uppercase tracking-widest hover:text-blue-600 transition-colors">View Audit History</button>
                        </div>
                    </div>

                    {/* Quick Insight */}
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-lg font-black leading-tight">Optimization Report</h4>
                            <p className="text-blue-100/80 text-xs font-medium mt-2 leading-relaxed">System suggests moving 50 units of "Smart Watch X" from Main to Secondary to balance localized demand forecasts.</p>
                            <button className="mt-6 px-6 py-3 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-neutral-50 transition-all active:scale-95">
                                Run Auto-Balance
                            </button>
                        </div>
                        <WarehouseIcon size={150} className="absolute -bottom-8 -right-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    </div>
                </div>
            </div>
        </div>
    );
}
