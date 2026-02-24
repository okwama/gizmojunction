import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Stripe requires the raw body to verify webhook signatures
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
    } catch (err: any) {
        console.error('[Stripe Webhook] Signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Use service role client — no user session in webhook context
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const { orderId, orderNumber } = session.metadata ?? {};

        if (orderId) {
            // Update order status
            await supabase.from('orders').update({
                status: 'confirmed',
                updated_at: new Date().toISOString(),
            }).eq('id', orderId);

            // Update payment record
            await supabase.from('payments').update({
                status: 'completed',
                transaction_id: session.payment_intent as string,
                metadata: {
                    provider: 'stripe',
                    sessionId: session.id,
                    paymentIntent: session.payment_intent,
                    amountTotal: session.amount_total,
                    currency: session.currency,
                },
                updated_at: new Date().toISOString(),
            }).eq('order_id', orderId);
        }
    }

    if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.payment_failed') {
        const object = event.data.object as any;
        const orderId = object?.metadata?.orderId;

        if (orderId) {
            await supabase.from('payments').update({
                status: 'failed',
                metadata: { provider: 'stripe', reason: event.type },
                updated_at: new Date().toISOString(),
            }).eq('order_id', orderId);
        }
    }

    return NextResponse.json({ received: true });
}
