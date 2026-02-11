'use client';

import { useActionState } from 'react';
import { createProduct, updateProduct } from '@/lib/actions/products';

// Define the shape of our props
interface ProductFormProps {
    product?: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        base_price: number;
        category_id: string | null;
        brand_id: string | null;
        is_published: boolean | null;
        featured: boolean | null;
    };
    categories: { id: string; name: string }[];
    brands: { id: string; name: string }[];
}

export default function ProductForm({ product, categories, brands }: ProductFormProps) {
    const isEditing = !!product;

    const updateProductWithId = updateProduct.bind(null, product?.id || '');
    const action = isEditing ? updateProductWithId : createProduct;

    const [state, formAction, isPending] = useActionState(action, null);

    return (
        <form action={formAction} className="space-y-8 bg-white p-6 rounded-xl shadow-sm">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Basic Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            defaultValue={product?.name}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug</label>
                        <input
                            type="text"
                            name="slug"
                            id="slug"
                            defaultValue={product?.slug}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        id="description"
                        rows={4}
                        defaultValue={product?.description || ''}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="base_price" className="block text-sm font-medium text-gray-700">Price ($)</label>
                        <input
                            type="number"
                            name="base_price"
                            id="base_price"
                            step="0.01"
                            min="0"
                            defaultValue={product?.base_price}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            name="category_id"
                            id="category_id"
                            defaultValue={product?.category_id || ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                        >
                            <option value="">Select a category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="brand_id" className="block text-sm font-medium text-gray-700">Brand</label>
                        <select
                            name="brand_id"
                            id="brand_id"
                            defaultValue={product?.brand_id || ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                        >
                            <option value="">Select a brand</option>
                            {brands.map((b) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Visibility</h2>
                <div className="flex gap-6">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="is_published"
                            id="is_published"
                            defaultChecked={product?.is_published || false}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
                            Published
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="featured"
                            id="featured"
                            defaultChecked={product?.featured || false}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                            Featured
                        </label>
                    </div>
                </div>
            </div>

            {state?.error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-md">
                    {state.error}
                </div>
            )}

            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                    {isPending ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
                </button>
            </div>
        </form>
    );
}
