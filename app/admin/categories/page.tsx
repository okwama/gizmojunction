import { getCategoriesWithHierarchy } from '@/lib/actions/adminCategories';
import CategoryManager from '@/components/admin/CategoryManager';
import { Tag, HelpCircle } from 'lucide-react';

export default async function CategoriesPage() {
    const categories = await getCategoriesWithHierarchy();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight dark:text-white">Catalog Categories</h1>
                    <p className="text-neutral-500 font-medium">Reorganize, merge, and manage your product hierarchy.</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-blue-600/10 text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-600/20 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        {categories.length} Total
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Hierarchy Manager */}
                <div className="xl:col-span-2">
                    <CategoryManager categories={categories} />
                </div>

                {/* Info & Best Practices Sidebar */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                                <HelpCircle className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-black mb-4">Managing Hierarchy</h3>
                            <ul className="space-y-4 text-sm text-neutral-400 font-medium">
                                <li className="flex gap-3">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                                    <span>**Reorganize**: Use the move icon to change a category&apos;s parent.</span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                                    <span>**Merge**: Consolidate two categories into one. All products and subcategories will be moved to the target.</span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                                    <span>**Subcategories**: Create unlimited levels of hierarchy to help customers find products.</span>
                                </li>
                            </ul>
                        </div>
                        <Tag className="absolute -bottom-12 -right-12 text-white/5 -rotate-12" size={200} />
                    </div>

                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8">
                        <h3 className="text-lg font-black mb-4 dark:text-white">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-neutral-50 dark:border-neutral-800">
                                <span className="text-sm font-bold text-neutral-500">Parent Categories</span>
                                <span className="font-black dark:text-white">
                                    {categories.filter(c => !c.parent_id).length}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-neutral-50 dark:border-neutral-800">
                                <span className="text-sm font-bold text-neutral-500">Subcategories</span>
                                <span className="font-black dark:text-white">
                                    {categories.filter(c => c.parent_id).length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
