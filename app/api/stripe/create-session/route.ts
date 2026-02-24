import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { orderId, orderNumber, total, items } = await req.json();

        if (!orderId || !total) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const lineItems = items?.map((item: any) => ({
            price_data: {
                currency: 'kes',
                product_data: {
                    name: `${item.productName} — ${item.variantName}`,
                },
                unit_amount: Math.round(item.unitPrice * 100), // Stripe uses cents
            },
            quantity: item.quantity,
        })) ?? [{
            price_data: {
                currency: 'kes',
                product_data: { name: `Order ${orderNumber}` },
                unit_amount: Math.round(total * 100),
            },
            quantity: 1,
        }];

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?order=${orderNumber}&payment=stripe`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
            metadata: {
                orderId,
                orderNumber,
            },
            payment_intent_data: {
                metadata: {
                    orderId,
                    orderNumber,
                },
            },
        });

        return NextResponse.json({ url: session.url, sessionId: session.id });
    } catch (error: any) {
        console.error('[Stripe] Create session error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
