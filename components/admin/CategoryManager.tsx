'use client';

import { useState } from 'react';
import {
    ChevronRight,
    ChevronDown,
    MoreVertical,
    Plus,
    FolderTree,
    GitMerge,
    ArrowRightLeft,
    Trash2,
    Pencil,
    X,
    Check
} from 'lucide-react';
import {
    updateCategoryHierarchy,
    mergeCategories,
    deleteCategory,
    createCategory
} from '@/lib/actions/adminCategories';
import { toast } from 'sonner';

interface Category {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
    description: string | null;
}

interface CategoryManagerProps {
    categories: Category[];
}

export default function CategoryManager({ categories }: CategoryManagerProps) {
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [targetCategoryId, setTargetCategoryId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expanded);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpanded(newExpanded);
    };

    const buildTree = (cats: Category[], parentId: string | null = null): any[] => {
        return cats
            .filter(c => c.parent_id === parentId)
            .map(c => ({
                ...c,
                children: buildTree(cats, c.id)
            }));
    };

    const categoryTree = buildTree(categories);

    const handleMove = async () => {
        if (!selectedCategory || !targetCategoryId) return;
        setIsSubmitting(true);
        try {
            await updateCategoryHierarchy(selectedCategory.id, targetCategoryId === 'root' ? null : targetCategoryId);
            toast.success('Category moved successfully');
            setIsMoveModalOpen(false);
            setTargetCategoryId('');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMerge = async () => {
        if (!selectedCategory || !targetCategoryId) return;
        setIsSubmitting(true);
        try {
            await mergeCategories(selectedCategory.id, targetCategoryId);
            toast.success('Categories merged successfully');
            setIsMergeModalOpen(false);
            setTargetCategoryId('');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category? All products will need to be reassigned manually if you delete instead of merging.')) return;
        try {
            await deleteCategory(id);
            toast.success('Category deleted');
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const renderCategory = (cat: any, depth: number = 0) => {
        const isExpanded = expanded.has(cat.id);
        const hasChildren = cat.children.length > 0;

        return (
            <div key={cat.id} className="select-none">
                <div
                    className={`
                        flex items-center justify-between p-3 rounded-2xl transition-all group
                        ${selectedCategory?.id === cat.id ? 'bg-blue-600/10 border-blue-600/20 text-blue-600' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400'}
                    `}
                    style={{ marginLeft: `${depth * 24}px` }}
                >
                    <div className="flex items-center gap-2 flex-1">
                        <button
                            onClick={() => toggleExpand(cat.id)}
                            className={`p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors ${!hasChildren && 'invisible'}`}
                        >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <FolderTree className={`w-4 h-4 ${selectedCategory?.id === cat.id ? 'text-blue-600' : 'text-neutral-400'}`} />
                        <span className={`font-bold text-sm ${selectedCategory?.id === cat.id ? 'text-blue-700 dark:text-blue-400' : 'text-neutral-900 dark:text-white'}`}>
                            {cat.name}
                        </span>
                        <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full font-medium text-neutral-400">
                            /{cat.slug}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => { setSelectedCategory(cat); setIsMoveModalOpen(true); }}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-xl transition-all"
                            title="Move Category"
                        >
                            <ArrowRightLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => { setSelectedCategory(cat); setIsMergeModalOpen(true); }}
                            className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 rounded-xl transition-all"
                            title="Merge Category"
                        >
                            <GitMerge className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-xl transition-all"
                            title="Delete Category"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {isExpanded && cat.children.map((child: any) => renderCategory(child, depth + 1))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black">Category Hierarchy</h2>
                        <p className="text-xs text-neutral-500 font-medium">Manage how your products grouped and displayed.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                        <Plus className="w-4 h-4" />
                        Add Category
                    </button>
                </div>
                <div className="p-4 space-y-1">
                    {categoryTree.length === 0 ? (
                        <div className="text-center py-20 text-neutral-400">
                            <FolderTree className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="font-bold">No categories found</p>
                        </div>
                    ) : (
                        categoryTree.map(cat => renderCategory(cat))
                    )}
                </div>
            </div>

            {/* Move Modal */}
            {isMoveModalOpen && (
                <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-3xl p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black">Move &quot;{selectedCategory?.name}&quot;</h3>
                            <button onClick={() => setIsMoveModalOpen(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block">New Parent Category</label>
                                <select
                                    className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 ring-blue-500/20"
                                    value={targetCategoryId}
                                    onChange={(e) => setTargetCategoryId(e.target.value)}
                                >
                                    <option value="">Select Parent...</option>
                                    <option value="root">Root (No Parent)</option>
                                    {categories
                                        .filter(c => c.id !== selectedCategory?.id)
                                        .map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <button
                                onClick={handleMove}
                                disabled={isSubmitting || !targetCategoryId}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                            >
                                {isSubmitting ? 'Moving...' : 'Confirm Move'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Merge Modal */}
            {isMergeModalOpen && (
                <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-3xl p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-black text-amber-600">Merge Categories</h3>
                            <button onClick={() => setIsMergeModalOpen(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-neutral-500 mb-6 font-medium">
                            Merging will move all products and subcategories from **{selectedCategory?.name}** into the target category. **This cannot be undone.**
                        </p>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block">Target Category</label>
                                <select
                                    className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 ring-amber-500/20"
                                    value={targetCategoryId}
                                    onChange={(e) => setTargetCategoryId(e.target.value)}
                                >
                                    <option value="">Select Target...</option>
                                    {categories
                                        .filter(c => c.id !== selectedCategory?.id)
                                        .map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <button
                                onClick={handleMerge}
                                disabled={isSubmitting || !targetCategoryId}
                                className="w-full py-4 bg-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                            >
                                {isSubmitting ? 'Merging...' : 'Confirm irreversible Merge'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Category Modal */}
            {isCreateModalOpen && <CreateCategoryModal categories={categories} onClose={() => setIsCreateModalOpen(false)} />}
        </div>
    );
}

function CreateCategoryModal({ categories, onClose }: { categories: Category[], onClose: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        try {
            await createCategory(formData);
            toast.success('Category created');
            onClose();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black">New Category</h3>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block">Name</label>
                            <input name="name" required className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl p-4 text-sm font-bold" placeholder="e.g. Laptops" />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block">Slug</label>
                            <input name="slug" required className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl p-4 text-sm font-bold text-neutral-400" placeholder="e.g. laptops" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block">Parent Category</label>
                        <select name="parent_id" className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl p-4 text-sm font-bold">
                            <option value="">None (Top Level)</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block">Description</label>
                        <textarea name="description" rows={3} className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl p-4 text-sm font-bold" />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Category'}
                    </button>
                </form>
            </div>
        </div>
    );
}
