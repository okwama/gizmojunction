import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'orders@gizmojunction.co.ke';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL = Deno.env.get('NEXT_PUBLIC_SITE_URL') || 'https://gizmojunction.vercel.app';

serve(async (_req) => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Carts abandoned > 2 hours ago but have an email AND have items
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const { data: carts, error } = await supabase
        .from('carts')
        .select(`
            id,
            email,
            updated_at,
            cart_items (
                id,
                quantity,
                variant:product_variants (
                    name,
                    price_adjustment,
                    product:products (
                        name,
                        base_price,
                        slug
                    )
                )
            )
        `)
        .lt('updated_at', twoHoursAgo)
        .not('email', 'is', null)
        .eq('abandoned_email_sent', false); // Only send once

    if (error) {
        console.error('Error fetching abandoned carts:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const abandonedCarts = (carts || []).filter(
        (c) => c.cart_items && c.cart_items.length > 0
    );

    let sentCount = 0;

    for (const cart of abandonedCarts) {
        if (!cart.email) continue;

        const items = cart.cart_items as any[];
        const total = items.reduce((sum: number, item: any) => {
            const price =
                Number(item.variant?.product?.base_price || 0) +
                Number(item.variant?.price_adjustment || 0);
            return sum + price * item.quantity;
        }, 0);

        const itemList = items
            .map((item: any) => {
                const price =
                    Number(item.variant?.product?.base_price || 0) +
                    Number(item.variant?.price_adjustment || 0);
                return `
                <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                        <span style="font-weight:600;">${item.variant?.product?.name || 'Product'}</span>
                        <span style="color:#888; font-size:12px;"> — ${item.variant?.name || ''}</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align:right;">
                        x${item.quantity}
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align:right; font-weight:600;">
                        KES ${(price * item.quantity).toLocaleString()}
                    </td>
                </tr>`;
            })
            .join('');

        const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
            <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <div style="background:linear-gradient(135deg,#1e40af,#2563eb);padding:40px;text-align:center;">
                    <h1 style="color:#fff;font-size:28px;font-weight:900;margin:0;">You left something behind! 🛒</h1>
                    <p style="color:rgba(255,255,255,0.85);margin-top:8px;font-size:15px;">Your Gizmo Junction cart is waiting for you.</p>
                </div>
                <div style="padding:40px;">
                    <p style="font-size:16px;color:#374151;margin-top:0;">Hi there,</p>
                    <p style="font-size:15px;color:#6b7280;">You left these items in your cart. Don't miss out — complete your purchase before they sell out!</p>
                    
                    <table style="width:100%;border-collapse:collapse;margin:24px 0;">
                        <thead>
                            <tr>
                                <th style="text-align:left;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;padding-bottom:12px;">Item</th>
                                <th style="text-align:right;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;padding-bottom:12px;">Qty</th>
                                <th style="text-align:right;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;padding-bottom:12px;">Price</th>
                            </tr>
                        </thead>
                        <tbody>${itemList}</tbody>
                    </table>
                    
                    <div style="background:#f8f9fa;border-radius:12px;padding:16px;margin-bottom:32px;display:flex;justify-content:space-between;">
                        <span style="font-size:15px;font-weight:700;color:#111827;">Total</span>
                        <span style="font-size:18px;font-weight:900;color:#2563eb;">KES ${total.toLocaleString()}</span>
                    </div>
                    
                    <div style="text-align:center;">
                        <a href="${SITE_URL}/cart" style="display:inline-block;background:linear-gradient(135deg,#1e40af,#2563eb);color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-weight:900;font-size:16px;letter-spacing:0.02em;">
                            Complete My Purchase →
                        </a>
                    </div>
                    
                    <hr style="margin:32px 0;border:none;border-top:1px solid #f0f0f0;">
                    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0;">
                        Gizmo Junction · Nairobi, Kenya<br>
                        <a href="${SITE_URL}" style="color:#6b7280;">Visit our store</a>
                    </p>
                </div>
            </div>
        </body>
        </html>`;

        // Send via Resend
        const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: cart.email,
                subject: '🛒 You left something in your cart at Gizmo Junction',
                html: emailHTML,
            }),
        });

        if (resendRes.ok) {
            // Mark as sent so we don't email again
            await supabase
                .from('carts')
                .update({ abandoned_email_sent: true })
                .eq('id', cart.id);
            sentCount++;
        } else {
            const err = await resendRes.json();
            console.error(`Failed to send email to ${cart.email}:`, err);
        }
    }

    return new Response(
        JSON.stringify({ success: true, emailsSent: sentCount, totalAbandoned: abandonedCarts.length }),
        { headers: { 'Content-Type': 'application/json' } }
    );
});
