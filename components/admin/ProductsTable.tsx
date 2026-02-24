'use client';

import { formatPrice } from '@/lib/formatPrice';
import { Edit2, Eye, Trash2, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ProductsTableProps {
    products: any[];
    categories: any[];
    brands: any[];
    activeFilters: {
        search?: string;
        category?: string;
        brand?: string;
        status?: string;
    };
}

export default function ProductsTable({ products }: ProductsTableProps) {
    return (
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {products.map((product) => (
                <tr key={product.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition">
                    <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                                {product.product_images?.[0]?.url ? (
                                    <Image
                                        src={product.product_images[0].url}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                        <Package className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-neutral-900 dark:text-white truncate max-w-[200px]">{product.name}</div>
                                <div className="text-[10px] text-neutral-400 font-mono">{product.slug}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                        {product.brand?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                        {product.category?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-md font-bold">
                            {product.variants?.[0]?.count || 0}
                        </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-neutral-900 dark:text-white">
                        {formatPrice(product.base_price)}
                    </td>
                    <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded ${product.is_published
                            ? 'bg-green-100 dark:bg-green-900/40 text-green-600'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                            }`}>
                            {product.is_published ? 'Live' : 'Draft'}
                        </span>
                    </td>
                    <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                            <Link
                                href={`/products/${product.slug}`}
                                className="p-1.5 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                title="View in Store"
                            >
                                <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                                href={`/admin/products/${product.id}`}
                                className="p-1.5 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                title="Edit"
                            >
                                <Edit2 className="w-4 h-4" />
                            </Link>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    );
}

