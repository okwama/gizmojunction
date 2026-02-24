'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCategoriesWithHierarchy() {
    const supabase = await createClient();

    const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .is('deleted_at', null)
        .order('name');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    return categories || [];
}

export async function createCategory(formData: FormData) {
    const supabase = await createClient();
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const parent_id = formData.get('parent_id') as string || null;
    const description = formData.get('description') as string;

    const { error } = await supabase
        .from('categories')
        .insert({
            name,
            slug,
            parent_id,
            description
        });

    if (error) throw error;

    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    return { success: true };
}

export async function updateCategoryHierarchy(categoryId: string, parentId: string | null) {
    const supabase = await createClient();

    // Prevent circular references (basic check: can't be own parent)
    if (categoryId === parentId) {
        throw new Error('A category cannot be its own parent.');
    }

    const { error } = await supabase
        .from('categories')
        .update({ parent_id: parentId, updated_at: new Date().toISOString() })
        .eq('id', categoryId);

    if (error) throw error;

    revalidatePath('/admin/categories');
    revalidatePath('/', 'layout');
    return { success: true };
}

export async function mergeCategories(sourceId: string, targetId: string) {
    const supabase = await createClient();

    if (sourceId === targetId) {
        throw new Error('Cannot merge a category into itself.');
    }

    // 1. Move all products from source to target
    const { error: productError } = await supabase
        .from('products')
        .update({ category_id: targetId })
        .eq('category_id', sourceId);

    if (productError) throw productError;

    // 2. Move all child categories from source to target
    const { error: categoryError } = await supabase
        .from('categories')
        .update({ parent_id: targetId })
        .eq('parent_id', sourceId);

    if (categoryError) throw categoryError;

    // 3. Delete the source category (soft delete)
    const { error: deleteError } = await supabase
        .from('categories')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', sourceId);

    if (deleteError) throw deleteError;

    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    revalidatePath('/', 'layout');
    return { success: true };
}

export async function deleteCategory(id: string) {
    const supabase = await createClient();

    // Soft delete
    const { error } = await supabase
        .from('categories')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/categories');
    revalidatePath('/', 'layout');
    return { success: true };
}
