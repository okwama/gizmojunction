import { initiateSTKPush } from '@/lib/mpesa';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { phone, amount, orderId, orderNumber } = await req.json();

        if (!phone || !amount || !orderId || !orderNumber) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await initiateSTKPush({ phone, amount, orderId, orderNumber });

        // Store the STK checkoutRequestId against the order for later matching in callback
        const supabase = await createClient();
        await supabase.from('payments').update({
            metadata: {
                provider: 'mpesa_stk',
                checkoutRequestId: result.checkoutRequestId,
                merchantRequestId: result.merchantRequestId,
            }
        }).eq('order_id', orderId);

        return NextResponse.json({
            success: true,
            checkoutRequestId: result.checkoutRequestId,
            message: 'STK Push sent. Please check your phone and enter your M-Pesa PIN.',
        });
    } catch (error: any) {
        console.error('[M-Pesa] STK Push error:', error);
        return NextResponse.json({ error: error.message || 'STK Push failed' }, { status: 500 });
    }
}
