import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { order_id } = await req.json()

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Fetch order details
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', order_id)
            .single()

        if (orderError || !order) {
            throw new Error('Order not found')
        }

        console.log(`Processing order confirmation for ${order.order_number}`)

        // TODO: Integrate with an email provider (Postmark, Resend, SendGrid)
        // For now, we'll just log the "email" action
        const emailPayload = {
            to: order.shipping_phone, // Or email if we had it in shipping_info
            subject: `Order Confirmation - ${order.order_number}`,
            body: `Hi ${order.shipping_name}, your order of ${order.total} has been received!`
        }

        console.log('Sending confirmation...', emailPayload)

        return new Response(
            JSON.stringify({ message: 'Confirmation processed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
