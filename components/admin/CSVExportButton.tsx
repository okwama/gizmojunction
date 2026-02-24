'use client';

import { Download } from 'lucide-react';

interface CSVExportButtonProps {
    data: any[];
    filename: string;
}

export default function CSVExportButton({ data, filename }: CSVExportButtonProps) {
    const handleExport = () => {
        if (!data || data.length === 0) return;

        // Flatten data and create headers
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','), // Header row
            ...data.map(row =>
                headers.map(header => {
                    const val = row[header];
                    // Handle values with commas or quotes
                    const escaped = ('' + val).replace(/"/g, '""');
                    return `"${escaped}"`;
                }).join(',')
            )
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all text-neutral-400 active:scale-95"
        >
            <Download className="w-4 h-4" />
            Export CSV
        </button>
    );
}
