'use client';

import { useTransition } from 'react';
import { updateCartItemQuantity, removeFromCart } from '@/lib/actions/cart';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemProps {
    item: any;
}

export default function CartItem({ item }: CartItemProps) {
    const [isPending, startTransition] = useTransition();

    const handleQuantityChange = (newQuantity: number) => {
        startTransition(async () => {
            await updateCartItemQuantity(item.id, newQuantity);
        });
    };

    const handleRemove = () => {
        startTransition(async () => {
            await removeFromCart(item.id);
        });
    };

    const product = item.variant.product;
    const price = product.base_price + (item.variant.price_adjustment || 0);
    const total = price * item.quantity;

    return (
        <div className="flex items-center gap-4 py-4 border-b">
            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {product.product_images?.[0] ? (
                    <img
                        src={product.product_images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No image
                    </div>
                )}
            </div>

            <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-900">{product.name}</h3>
                <p className="text-sm text-slate-500">{item.variant.name}</p>
                <div className="mt-2 text-primary-600 font-bold">
                    ${price.toFixed(2)}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 rounded-lg">
                    <button
                        onClick={() => handleQuantityChange(item.quantity - 1)}
                        disabled={isPending}
                        className="p-2 hover:bg-slate-100 disabled:opacity-50 text-slate-600 hover:text-slate-900 transition"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-slate-900">{item.quantity}</span>
                    <button
                        onClick={() => handleQuantityChange(item.quantity + 1)}
                        disabled={isPending}
                        className="p-2 hover:bg-slate-100 disabled:opacity-50 text-slate-600 hover:text-slate-900 transition"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <button
                    onClick={handleRemove}
                    disabled={isPending}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            <div className="w-24 text-right font-bold text-lg text-slate-900">
                ${total.toFixed(2)}
            </div>
        </div>
    );
}
