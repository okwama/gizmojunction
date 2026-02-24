/**
 * Safaricom Daraja API helper for M-Pesa STK Push (Lipa na M-Pesa Online)
 * Docs: https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate
 */

const DARAJA_BASE_URL = process.env.MPESA_IS_SANDBOX === 'true'
    ? 'https://sandbox.safaricom.co.ke'
    : 'https://api.safaricom.co.ke';

/**
 * Get OAuth access token from Daraja
 */
export async function getMpesaAccessToken(): Promise<string> {
    const consumerKey = process.env.MPESA_CONSUMER_KEY!;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    const res = await fetch(`${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
            Authorization: `Basic ${credentials}`,
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error('Failed to get M-Pesa access token');
    }

    const data = await res.json();
    return data.access_token;
}

/**
 * Generate the base64-encoded password for STK Push
 * Password = base64(shortcode + passkey + timestamp)
 */
export function getMpesaPassword(timestamp: string): string {
    const shortcode = process.env.MPESA_SHORTCODE!;
    const passkey = process.env.MPESA_PASSKEY!;
    return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
}

/**
 * Format timestamp as YYYYMMDDHHmmss
 */
export function getMpesaTimestamp(): string {
    return new Date()
        .toISOString()
        .replace(/[-:T.Z]/g, '')
        .slice(0, 14);
}

/**
 * Sanitize phone number to 254XXXXXXXXX format
 */
export function formatMpesaPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) return `254${cleaned.slice(1)}`;
    if (cleaned.startsWith('+')) return cleaned.slice(1);
    return cleaned;
}

/**
 * Initiate STK Push to customer's phone
 */
export async function initiateSTKPush({
    phone,
    amount,
    orderId,
    orderNumber,
}: {
    phone: string;
    amount: number;
    orderId: string;
    orderNumber: string;
}) {
    const accessToken = await getMpesaAccessToken();
    const timestamp = getMpesaTimestamp();
    const password = getMpesaPassword(timestamp);
    const formattedPhone = formatMpesaPhone(phone);
    const shortcode = process.env.MPESA_SHORTCODE!;

    const payload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(amount), // M-Pesa requires whole numbers
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL!,
        AccountReference: orderNumber,
        TransactionDesc: `Payment for order ${orderNumber}`,
    };

    const res = await fetch(`${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || data.ResponseCode !== '0') {
        throw new Error(data.errorMessage || data.CustomerMessage || 'STK Push failed');
    }

    return {
        checkoutRequestId: data.CheckoutRequestID,
        merchantRequestId: data.MerchantRequestID,
    };
}
