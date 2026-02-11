'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import * as XLSX from 'xlsx';

export type ImportStrategy = 'skip' | 'update' | 'variant';

export interface ProductRow {
    partNo: string;
    description: string;
    availability: string;
    salePrice: number;
}

export interface ImportResult {
    success: boolean;
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
}

/**
 * Parse Excel file and extract product data
 */
export async function parseExcelFile(fileBuffer: ArrayBuffer): Promise<ProductRow[]> {
    try {
        const workbook = XLSX.read(fileBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

        // Find header row (look for "Part No" column)
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(10, data.length); i++) {
            if (data[i].some((cell: any) => String(cell).includes('Part No'))) {
                headerRowIndex = i;
                break;
            }
        }

        if (headerRowIndex === -1) {
            throw new Error('Could not find header row with "Part No" column');
        }

        const headers = data[headerRowIndex];
        const rows: ProductRow[] = [];

        // Find column indices - be flexible with column names
        const partNoIndex = headers.findIndex((h: any) => String(h).toLowerCase().includes('part') || String(h).toLowerCase().includes('model'));

        // Description column - try multiple patterns
        let descIndex = headers.findIndex((h: any) =>
            String(h).toLowerCase().includes('ram') ||
            String(h).toLowerCase().includes('description') ||
            String(h).toLowerCase().includes('product') ||
            String(h).toLowerCase().includes('laptop') ||
            String(h).toLowerCase().includes('desktop')
        );

        // If still not found, use column 1 (second column)
        if (descIndex === -1 && headers.length > 1) descIndex = 1;

        const availIndex = headers.findIndex((h: any) => String(h).toLowerCase().includes('availability') || String(h).toLowerCase().includes('stock'));
        const priceIndex = headers.findIndex((h: any) => String(h).toLowerCase().includes('price') || String(h).toLowerCase().includes('cost'));

        console.log('Detected columns:', { partNoIndex, descIndex, availIndex, priceIndex, headers });

        // Parse data rows
        for (let i = headerRowIndex + 1; i < data.length; i++) {
            const row = data[i];

            // Skip empty rows
            if (!row || row.length === 0) continue;

            const partNo = String(row[partNoIndex] || '').trim();

            // Skip empty part numbers or section headers
            if (!partNo ||
                partNo.toLowerCase().includes('laptop') ||
                partNo.toLowerCase().includes('desktop') ||
                partNo.toLowerCase().includes('ram') ||
                partNo.toLowerCase().includes('ddr')) continue;

            const description = String(row[descIndex] || '').trim();
            const availability = String(row[availIndex] || 'Out of Stock').trim();
            const priceStr = String(row[priceIndex] || '0').replace(/[^0-9.]/g, '');
            const salePrice = parseFloat(priceStr);

            // Skip if no valid data
            if (!description || salePrice === 0 || isNaN(salePrice)) {
                console.log('Skipping invalid row:', { partNo, description, salePrice });
                continue;
            }

            rows.push({
                partNo,
                description,
                availability,
                salePrice
            });
        }

        console.log(`Successfully parsed ${rows.length} products`);
        return rows;
    } catch (error) {
        console.error('Error parsing Excel file:', error);
        throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Extract product information from description
 */
import { detectCategory, detectBrand } from '@/lib/config/import-config';

/**
 * Extract product information from description using configuration
 */
function extractProductInfo(description: string, partNo: string) {
    // Detect brand using configuration
    const brandInfo = detectBrand(description);
    const brand = brandInfo.name;

    // Extract base product name (before detailed specs)
    // Remove brand name from start if present for cleaner product name
    let productName = description;
    const brandRegex = new RegExp(`^${brand}\\s+`, 'i');
    productName = productName.replace(brandRegex, '');

    // Take first part before comma or common separators
    const productNameMatch = productName.match(/^([^,]+)/);
    productName = productNameMatch ? productNameMatch[1].trim() : productName.substring(0, 50);

    // Detect category using configuration
    const categoryInfo = detectCategory(description);
    const category = categoryInfo.name;

    // Generate slug
    const slug = `${brandInfo.slug}-${partNo.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    return {
        brand,
        productName,
        category,
        categorySlug: categoryInfo.slug,
        parentCategory: categoryInfo.parentCategory,
        slug,
        fullDescription: description
    };
}

/**
 * Import products with duplicate handling
 */
export async function importProducts(
    rows: ProductRow[],
    strategy: ImportStrategy = 'skip'
): Promise<ImportResult> {
    const supabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    const result: ImportResult = {
        success: true,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: []
    };

    for (const row of rows) {
        try {
            const info = extractProductInfo(row.description, row.partNo);

            // Get or create brand
            let { data: brand } = await supabase
                .from('brands')
                .select('id')
                .eq('slug', info.brand.toLowerCase())
                .single();

            if (!brand) {
                const { data: newBrand, error: brandError } = await supabase
                    .from('brands')
                    .insert({ name: info.brand, slug: info.brand.toLowerCase(), description: `${info.brand} products` })
                    .select('id')
                    .single();

                if (brandError) throw brandError;
                brand = newBrand;
            }

            // Get or create category
            let { data: category } = await supabase
                .from('categories')
                .select('id')
                .eq('slug', info.categorySlug)
                .single();

            if (!category) {
                // If category has a parent, find or create the parent first
                let parentId = null;
                if (info.parentCategory) {
                    const { data: parentCat } = await supabase
                        .from('categories')
                        .select('id')
                        .eq('name', info.parentCategory) // Look up parent by name
                        .single();

                    if (parentCat) {
                        parentId = parentCat.id;
                    }
                }

                const { data: newCategory, error: categoryError } = await supabase
                    .from('categories')
                    .insert({
                        name: info.category,
                        slug: info.categorySlug,
                        description: `${info.category} products`,
                        parent_id: parentId
                    })
                    .select('id')
                    .single();

                if (categoryError) throw categoryError;
                category = newCategory;
            }

            // Check if variant with this SKU already exists
            const { data: existingVariant } = await supabase
                .from('product_variants')
                .select('id, product_id')
                .eq('sku', row.partNo)
                .single();

            if (existingVariant) {
                if (strategy === 'skip') {
                    result.skipped++;
                    continue;
                } else if (strategy === 'update') {
                    // Update existing variant
                    await supabase
                        .from('product_variants')
                        .update({
                            name: info.fullDescription.substring(0, 100),
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', existingVariant.id);

                    // Update product price
                    await supabase
                        .from('products')
                        .update({
                            base_price: row.salePrice,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', existingVariant.product_id);

                    result.updated++;
                    continue;
                }
            }

            // Create new product
            const { data: product, error: productError } = await supabase
                .from('products')
                .insert({
                    name: info.productName,
                    slug: info.slug,
                    description: info.fullDescription,
                    base_price: row.salePrice,
                    brand_id: brand.id,
                    category_id: category.id,
                    is_published: true,
                    featured: false
                })
                .select('id')
                .single();

            if (productError) {
                // If slug conflict, try with random suffix
                if (productError.code === '23505') {
                    const randomSlug = `${info.slug}-${Math.random().toString(36).substring(7)}`;
                    const { data: retryProduct, error: retryError } = await supabase
                        .from('products')
                        .insert({
                            name: info.productName,
                            slug: randomSlug,
                            description: info.fullDescription,
                            base_price: row.salePrice,
                            brand_id: brand.id,
                            category_id: category.id,
                            is_published: true,
                            featured: false
                        })
                        .select('id')
                        .single();

                    if (retryError) throw retryError;
                    product = retryProduct;
                } else {
                    throw productError;
                }
            }

            // Create variant
            await supabase
                .from('product_variants')
                .insert({
                    product_id: product!.id,
                    sku: row.partNo,
                    name: info.fullDescription.substring(0, 100),
                    price_adjustment: 0
                });

            result.created++;
        } catch (error) {
            console.error(`Error importing ${row.partNo}:`, error);
            result.errors.push(`${row.partNo}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            result.skipped++;
        }
    }

    revalidatePath('/admin/products');
    return result;
}
