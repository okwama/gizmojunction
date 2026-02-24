import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// M-Pesa callback handler — called by Safaricom when payment completes or fails
// Must be publicly accessible (no auth)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const stkCallback = body?.Body?.stkCallback;

        if (!stkCallback) {
            return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
        }

        const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = stkCallback;

        // Use service role client — this webhook has no user session
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        if (ResultCode === 0) {
            // Payment successful — extract M-Pesa receipt
            const items = CallbackMetadata?.Item || [];
            const mpesaCode = items.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
            const amountPaid = items.find((i: any) => i.Name === 'Amount')?.Value;

            // Find the payment record by checkoutRequestId stored in metadata
            const { data: payments } = await supabase
                .from('payments')
                .select('id, order_id, metadata')
                .filter('metadata->>checkoutRequestId', 'eq', CheckoutRequestID)
                .limit(1);

            if (payments && payments.length > 0) {
                const payment = payments[0];

                // Update payment record
                await supabase.from('payments').update({
                    status: 'completed',
                    transaction_id: mpesaCode,
                    metadata: {
                        ...payment.metadata,
                        mpesaReceiptNumber: mpesaCode,
                        amountPaid,
                        resultDesc: ResultDesc,
                    },
                    updated_at: new Date().toISOString(),
                }).eq('id', payment.id);

                // Update order status
                await supabase.from('orders').update({
                    status: 'confirmed',
                    updated_at: new Date().toISOString(),
                }).eq('id', payment.order_id);
            }
        } else {
            // Payment failed — update payment status
            const { data: payments } = await supabase
                .from('payments')
                .select('id')
                .filter('metadata->>checkoutRequestId', 'eq', CheckoutRequestID)
                .limit(1);

            if (payments && payments.length > 0) {
                await supabase.from('payments').update({
                    status: 'failed',
                    metadata: { resultCode: ResultCode, resultDesc: ResultDesc },
                    updated_at: new Date().toISOString(),
                }).eq('id', payments[0].id);
            }
        }

        // Always return 200 with Safaricom's required format
        return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    } catch (error: any) {
        console.error('[M-Pesa] Callback error:', error);
        // Still return 200 to prevent Safaricom from retrying with bad data
        return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
}
