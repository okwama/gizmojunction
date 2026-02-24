'use client';

import { useState } from 'react';
import { Plus, Trash2, Save, Printer, FileText, Search, User, Package } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';

interface Product {
    id: string;
    name: string;
    base_price: number;
    sku?: string;
}

interface QuotationItem {
    id: string; // temp id
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

export default function QuotationForm({ products }: { products: Product[] }) {
    const [customer, setCustomer] = useState({ name: '', email: '', phone: '', address: '' });
    const [items, setItems] = useState<QuotationItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [discount, setDiscount] = useState(0);
    const [shipping, setShipping] = useState(0);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addItem = (product: Product) => {
        const existing = items.find(i => i.productId === product.id);
        if (existing) {
            setItems(items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setItems([...items, {
                id: Math.random().toString(36).substr(2, 9),
                productId: product.id,
                name: product.name,
                price: product.base_price,
                quantity: 1
            }]);
        }
    };

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const updateQuantity = (id: string, q: number) => {
        setItems(items.map(i => i.id === id ? { ...i, quantity: Math.max(1, q) } : i));
    };

    const subtotal = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const total = subtotal + Number(shipping) - Number(discount);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {/* Product Selector */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-black uppercase tracking-tight">Select Products</h2>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search catalog..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-xs font-bold w-64 outline-none focus:ring-2 focus:ring-blue-600/20"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 h-[300px] overflow-y-auto custom-scrollbar">
                        {filteredProducts.slice(0, 10).map(product => (
                            <button
                                key={product.id}
                                onClick={() => addItem(product)}
                                className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-left group"
                            >
                                <div>
                                    <p className="text-xs font-bold truncate max-w-[150px]">{product.name}</p>
                                    <p className="text-[10px] text-neutral-500">{formatPrice(product.base_price)}</p>
                                </div>
                                <Plus className="w-4 h-4 text-blue-600 group-hover:scale-125 transition-transform" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quotation Items */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
                        <h2 className="text-lg font-black uppercase tracking-tight">Line Items</h2>
                    </div>
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {items.length === 0 ? (
                            <div className="p-12 text-center text-neutral-400">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="text-sm font-bold">Add products to start your quotation</p>
                            </div>
                        ) : (
                            items.map(item => (
                                <div key={item.id} className="p-4 flex items-center justify-between group">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="text-sm font-bold truncate">{item.name}</p>
                                        <p className="text-xs text-neutral-500">{formatPrice(item.price)} per unit</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-white dark:hover:bg-neutral-700 rounded transition-all">-</button>
                                            <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-white dark:hover:bg-neutral-700 rounded transition-all">+</button>
                                        </div>
                                        <div className="w-24 text-right">
                                            <p className="text-sm font-black">{formatPrice(item.price * item.quantity)}</p>
                                        </div>
                                        <button onClick={() => removeItem(item.id)} className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {items.length > 0 && (
                        <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                            <div className="flex justify-end items-center gap-10 text-sm">
                                <span className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                                <span className="font-bold w-24 text-right">{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-end items-center gap-10 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Shipping</span>
                                    <input
                                        type="number"
                                        className="w-20 px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded text-right text-xs"
                                        value={shipping}
                                        onChange={e => setShipping(Number(e.target.value))}
                                    />
                                </div>
                                <span className="font-bold w-24 text-right">+{formatPrice(Number(shipping))}</span>
                            </div>
                            <div className="flex justify-end items-center gap-10 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-red-500 font-bold uppercase tracking-widest text-[10px]">Discount</span>
                                    <input
                                        type="number"
                                        className="w-20 px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded text-right text-xs"
                                        value={discount}
                                        onChange={e => setDiscount(Number(e.target.value))}
                                    />
                                </div>
                                <span className="font-bold text-red-500 w-24 text-right">-{formatPrice(Number(discount))}</span>
                            </div>
                            <div className="flex justify-end items-center gap-10 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                                <span className="text-xs font-black uppercase tracking-widest text-neutral-500">Estimated Total</span>
                                <h3 className="text-2xl font-black text-blue-600 w-32 text-right">{formatPrice(total)}</h3>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {/* Customer Details */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <User className="w-5 h-5 text-blue-600" />
                        <h2 className="text-sm font-black uppercase tracking-widest">Client Identity</h2>
                    </div>
                    <div className="space-y-3">
                        <input
                            placeholder="Full Name"
                            className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-neutral-200 dark:ring-neutral-700 focus:ring-2 focus:ring-blue-600"
                            value={customer.name}
                            onChange={e => setCustomer({ ...customer, name: e.target.value })}
                        />
                        <input
                            placeholder="Email Address"
                            className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-neutral-200 dark:ring-neutral-700 focus:ring-2 focus:ring-blue-600"
                            value={customer.email}
                            onChange={e => setCustomer({ ...customer, email: e.target.value })}
                        />
                        <input
                            placeholder="Phone Number"
                            className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-neutral-200 dark:ring-neutral-700 focus:ring-2 focus:ring-blue-600"
                            value={customer.phone}
                            onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                        />
                        <textarea
                            placeholder="Billing Address"
                            rows={3}
                            className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-neutral-200 dark:ring-neutral-700 focus:ring-2 focus:ring-blue-600"
                            value={customer.address}
                            onChange={e => setCustomer({ ...customer, address: e.target.value })}
                        />
                    </div>
                </div>

                {/* Final Actions */}
                <div className="bg-neutral-900 text-white rounded-2xl p-6 shadow-xl shadow-blue-500/10 space-y-4 no-print">
                    <h3 className="text-lg font-black">Finalize Draft</h3>
                    <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-[0.2em] leading-relaxed">
                        Generating a quotation will create a non-binding sales document for your client.
                    </p>
                    <div className="space-y-2 pt-2">
                        <button
                            onClick={() => window.print()}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                            <Printer className="w-4 h-4" />
                            Print & Preview
                        </button>
                        <button
                            onClick={() => alert(`Quotation Draft Saved for ${customer.name || 'Anonymous'}`)}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all active:scale-95"
                        >
                            <Save className="w-4 h-4 text-blue-400" />
                            Save as Draft
                        </button>
                    </div>
                </div>
            </div>

            {/* Hidden Print-Only Layout */}
            <div className="hidden print:block fixed inset-0 bg-white text-black p-12 font-serif z-[100]">
                <div className="flex justify-between items-start border-b-2 border-black pb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter mb-2">GIZMO JUNCTION</h1>
                        <p className="text-xs uppercase font-bold text-neutral-500 tracking-widest">Premium Electronics & Accessories</p>
                        <div className="mt-4 text-sm space-y-1">
                            <p>Moi Avenue, Nairobi, Kenya</p>
                            <p>Phone: +254 700 000 000</p>
                            <p>Email: sales@gizmojunction.com</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-black text-blue-600 mb-2">PRO-FORMA QUOTATION</h2>
                        <div className="text-sm space-y-1">
                            <p><span className="font-bold">Number:</span> QT-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                            <p><span className="font-bold">Date:</span> {new Date().toLocaleDateString()}</p>
                            <p><span className="font-bold">Valid For:</span> 30 Days</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 py-10 border-b border-neutral-100">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3">Prepared For:</h3>
                        <p className="font-bold text-lg">{customer.name || 'Valued Customer'}</p>
                        <p className="text-sm text-neutral-600">{customer.email || 'N/A'}</p>
                        <p className="text-sm text-neutral-600">{customer.phone || 'N/A'}</p>
                        <p className="text-sm text-neutral-600 mt-2">{customer.address || 'Standard Delivery'}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3">Sales Agent:</h3>
                        <p className="font-bold">Gizmo Junction Admin</p>
                        <p className="text-sm text-neutral-600">Operations Department</p>
                    </div>
                </div>

                <div className="py-10">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-neutral-200">
                                <th className="py-4 text-xs font-black uppercase tracking-widest">Product Description</th>
                                <th className="py-4 text-xs font-black uppercase tracking-widest text-center">Quantity</th>
                                <th className="py-4 text-xs font-black uppercase tracking-widest text-right">Unit Price</th>
                                <th className="py-4 text-xs font-black uppercase tracking-widest text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td className="py-4">
                                        <p className="font-bold text-sm">{item.name}</p>
                                    </td>
                                    <td className="py-4 text-center text-sm">{item.quantity}</td>
                                    <td className="py-4 text-right text-sm">{formatPrice(item.price)}</td>
                                    <td className="py-4 text-right text-sm font-bold">{formatPrice(item.price * item.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="border-t-2 border-black pt-6 flex justify-end">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-500 uppercase font-bold tracking-widest text-[10px]">Subtotal</span>
                            <span className="font-bold">{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-500 uppercase font-bold tracking-widest text-[10px]">Shipping</span>
                            <span className="font-bold">+{formatPrice(Number(shipping))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-red-500 uppercase font-bold tracking-widest text-[10px]">Discount</span>
                            <span className="font-bold text-red-500">-{formatPrice(Number(discount))}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-neutral-200">
                            <span className="text-sm font-black uppercase tracking-widest">Total Amount</span>
                            <span className="text-xl font-black text-blue-600">{formatPrice(total)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-20 text-center border-t border-neutral-100 pt-8">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em]">www.gizmojunction.com</p>
                    <p className="text-[10px] text-neutral-400 mt-2 italic">This is a computer generated quotation and does not require a signature.</p>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; margin: 0 !important; }
                    main { padding: 0 !important; margin: 0 !important; }
                    .admin-layout-container { display: block !important; }
                }
            `}</style>
        </div>
    );
}
