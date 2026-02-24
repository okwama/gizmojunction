/**
 * Format a number as KES currency.
 * e.g. formatPrice(1234.5) → "KES 1,234.50"
 */
export function formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}
