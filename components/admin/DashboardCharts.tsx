'use client';

import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Cell,
} from 'recharts';
import { formatPrice } from '@/lib/formatPrice';

interface ChartData {
    date: string;
    revenue: number;
    orders: number;
}

interface TopProduct {
    name: string;
    revenue: number;
    units: number;
}

interface DashboardChartsProps {
    data: ChartData[];
    topProducts?: TopProduct[];
}

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626'];

export default function DashboardCharts({ data, topProducts = [] }: DashboardChartsProps) {
    const formattedData = data.map(item => ({
        ...item,
        displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">Revenue Trend</h3>
                            <p className="text-xs text-neutral-500 font-medium">Last 30 days performance</p>
                        </div>
                        <div className="text-blue-600 font-black text-lg">
                            {formatPrice(data.reduce((sum, d) => sum + d.revenue, 0))}
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={formattedData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="displayDate" axisLine={false} tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9ca3af' }} minTickGap={30} />
                                <YAxis axisLine={false} tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                                    tickFormatter={(value: any) => `KES ${Number(value) > 1000 ? (Number(value) / 1000).toFixed(1) + 'k' : value}`} />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [formatPrice(Number(value)), 'Revenue']} />
                                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Volume */}
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">Order Volume</h3>
                            <p className="text-xs text-neutral-500 font-medium">Daily order count</p>
                        </div>
                        <div className="text-blue-600 font-black text-lg">
                            {data.reduce((sum, d) => sum + d.orders, 0)} Orders
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={formattedData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="displayDate" axisLine={false} tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9ca3af' }} minTickGap={30} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="orders" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Products by Revenue */}
            {topProducts.length > 0 && (
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">Top Products</h3>
                            <p className="text-xs text-neutral-500 font-medium">By revenue — last 30 days</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProducts} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                    <XAxis type="number" axisLine={false} tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                                        tickFormatter={(v: any) => `KES ${Number(v) > 1000 ? (Number(v) / 1000).toFixed(0) + 'k' : v}`} />
                                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false}
                                        tick={{ fontSize: 10, fill: '#6b7280' }} width={120} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        formatter={(value: any) => [formatPrice(Number(value)), 'Revenue']} />
                                    <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={20}>
                                        {topProducts.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3">
                            {topProducts.map((product, index) => (
                                <div key={product.name} className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                                        {index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">{product.name}</p>
                                        <p className="text-[10px] text-neutral-500">{product.units} units sold</p>
                                    </div>
                                    <span className="text-sm font-black text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                                        {formatPrice(product.revenue)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
