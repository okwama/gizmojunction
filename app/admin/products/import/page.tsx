'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseExcelFile, importProducts, ProductRow, ImportStrategy, ImportResult } from '@/lib/actions/import';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Loader2, AlertCircle, ArrowRight, Package } from 'lucide-react';

export default function ProductImportPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<ProductRow[]>([]);
    const [strategy, setStrategy] = useState<ImportStrategy>('skip');
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [importLog, setImportLog] = useState<string[]>([]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            await processFile(droppedFile);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            await processFile(selectedFile);
        }
    };

    const processFile = async (selectedFile: File) => {
        setFile(selectedFile);
        setError(null);
        setPreview([]);
        setResult(null);
        setImportLog([`📁 File selected: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)`]);

        try {
            setImportLog(prev => [...prev, '🔄 Parsing Excel file...']);
            const buffer = await selectedFile.arrayBuffer();
            const rows = await parseExcelFile(buffer);
            setPreview(rows.slice(0, 10));
            setImportLog(prev => [...prev, `✅ Found ${rows.length} products in file`, `👀 Showing preview of first 10 products`]);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to parse file';
            setError(errorMsg);
            setImportLog(prev => [...prev, `❌ Error: ${errorMsg}`]);
            setFile(null);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setImporting(true);
        setError(null);
        setImportLog([`🚀 Starting import with "${strategy}" strategy...`]);

        try {
            const buffer = await file.arrayBuffer();
            const rows = await parseExcelFile(buffer);
            setImportLog(prev => [...prev, `📦 Processing ${rows.length} products...`]);

            const importResult = await importProducts(rows, strategy);
            setResult(importResult);

            setImportLog(prev => [
                ...prev,
                `✅ Import complete!`,
                `   • ${importResult.created} products created`,
                `   • ${importResult.updated} products updated`,
                `   • ${importResult.skipped} products skipped`,
                ...(importResult.errors.length > 0 ? [`   • ${importResult.errors.length} errors`] : [])
            ]);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Import failed';
            setError(errorMsg);
            setImportLog(prev => [...prev, `❌ Import failed: ${errorMsg}`]);
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">Product Import</h1>
                <p className="text-sm text-neutral-500 mt-0.5">Bulk import products from supplier Excel files</p>
            </div>

            {/* File Upload */}
            {!result && (
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-blue-600" />
                            Upload Excel File
                        </h2>

                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all ${isDragging
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
                                    : file
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : 'border-neutral-300 dark:border-neutral-700 hover:border-blue-400 bg-neutral-50 dark:bg-neutral-800/50'
                                }`}
                        >
                            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                                {file ? (
                                    <>
                                        <CheckCircle className="w-12 h-12 text-green-600 mb-3" />
                                        <p className="text-sm font-bold text-green-700 dark:text-green-400">{file.name}</p>
                                        <p className="text-xs text-neutral-500 mt-1">{(file.size / 1024).toFixed(2)} KB • Click to change</p>
                                    </>
                                ) : (
                                    <>
                                        <FileSpreadsheet className={`w-12 h-12 mb-3 transition-colors ${isDragging ? 'text-blue-600' : 'text-neutral-400'}`} />
                                        <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                                            {isDragging ? 'Drop file here' : 'Click to upload or drag and drop'}
                                        </p>
                                        <p className="text-xs text-neutral-500 mt-1">Excel files (.xlsx, .xls)</p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Import Log */}
            {importLog.length > 0 && (
                <div className="bg-neutral-900 dark:bg-neutral-950 rounded-xl border border-neutral-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-neutral-700 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <h3 className="text-sm font-black text-neutral-300">Import Log</h3>
                    </div>
                    <div className="p-4 max-h-48 overflow-y-auto font-mono text-xs space-y-1">
                        {importLog.map((log, idx) => (
                            <div key={idx} className="text-neutral-300">{log}</div>
                        ))}
                    </div>
                </div>
            )}

            {/* Preview & Strategy Selection */}
            {preview.length > 0 && !result && (
                <>
                    {/* Preview Table */}
                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                            <h2 className="text-lg font-black">Preview (First 10 Products)</h2>
                            <p className="text-xs text-neutral-500 mt-0.5">Review the data before importing</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-black uppercase tracking-wider text-neutral-500">Part No</th>
                                        <th className="px-4 py-2 text-left text-xs font-black uppercase tracking-wider text-neutral-500">Description</th>
                                        <th className="px-4 py-2 text-left text-xs font-black uppercase tracking-wider text-neutral-500">Availability</th>
                                        <th className="px-4 py-2 text-left text-xs font-black uppercase tracking-wider text-neutral-500">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {preview.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                                            <td className="px-4 py-3 text-xs font-mono text-neutral-900 dark:text-white">{row.partNo}</td>
                                            <td className="px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300 max-w-md truncate">{row.description}</td>
                                            <td className="px-4 py-3 text-xs">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${row.availability.toLowerCase().includes('stock')
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {row.availability}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-bold text-neutral-900 dark:text-white">Ksh {row.salePrice.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Duplicate Strategy */}
                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-lg font-black mb-4">Duplicate Handling Strategy</h2>
                            <div className="space-y-3">
                                <label className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition ${strategy === 'skip'
                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-neutral-200 dark:border-neutral-700 hover:border-blue-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="strategy"
                                        value="skip"
                                        checked={strategy === 'skip'}
                                        onChange={(e) => setStrategy(e.target.value as ImportStrategy)}
                                        className="mt-1 mr-3"
                                    />
                                    <div>
                                        <span className="font-bold text-sm">Skip Duplicates</span>
                                        <p className="text-xs text-neutral-500 mt-0.5">Keep existing products, ignore new ones with same SKU (safest)</p>
                                    </div>
                                </label>

                                <label className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition ${strategy === 'update'
                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-neutral-200 dark:border-neutral-700 hover:border-blue-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="strategy"
                                        value="update"
                                        checked={strategy === 'update'}
                                        onChange={(e) => setStrategy(e.target.value as ImportStrategy)}
                                        className="mt-1 mr-3"
                                    />
                                    <div>
                                        <span className="font-bold text-sm">Update Duplicates</span>
                                        <p className="text-xs text-neutral-500 mt-0.5">Update prices and descriptions for products with same SKU</p>
                                    </div>
                                </label>

                                <label className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition ${strategy === 'variant'
                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-neutral-200 dark:border-neutral-700 hover:border-blue-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="strategy"
                                        value="variant"
                                        checked={strategy === 'variant'}
                                        onChange={(e) => setStrategy(e.target.value as ImportStrategy)}
                                        className="mt-1 mr-3"
                                    />
                                    <div>
                                        <span className="font-bold text-sm">Create as New Variant</span>
                                        <p className="text-xs text-neutral-500 mt-0.5">Add as new variant if product exists with different specs</p>
                                    </div>
                                </label>
                            </div>

                            <button
                                onClick={handleImport}
                                disabled={importing}
                                className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {importing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" />
                                        Import Products
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Import Results */}
            {result && (
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            Import Complete
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-xs font-bold text-green-600 mb-1">Created</p>
                                <p className="text-2xl font-black text-green-700">{result.created}</p>
                            </div>
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-xs font-bold text-blue-600 mb-1">Updated</p>
                                <p className="text-2xl font-black text-blue-700">{result.updated}</p>
                            </div>
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                                <p className="text-xs font-bold text-neutral-600 mb-1">Skipped</p>
                                <p className="text-2xl font-black text-neutral-700 dark:text-neutral-300">{result.skipped}</p>
                            </div>
                        </div>

                        {result.errors.length > 0 && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm font-bold text-red-700 mb-2">Errors ({result.errors.length})</p>
                                <div className="max-h-32 overflow-y-auto space-y-1">
                                    {result.errors.map((err, idx) => (
                                        <p key={idx} className="text-xs text-red-600 font-mono">{err}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push('/admin/products')}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                            >
                                <Package className="w-4 h-4" />
                                View All Products
                            </button>
                            <button
                                onClick={() => {
                                    setFile(null);
                                    setPreview([]);
                                    setResult(null);
                                    setError(null);
                                    setImportLog([]);
                                }}
                                className="flex-1 px-4 py-2.5 border-2 border-neutral-200 dark:border-neutral-700 font-bold text-sm rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                            >
                                Import Another File
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
