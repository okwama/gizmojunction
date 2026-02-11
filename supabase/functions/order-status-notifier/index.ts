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
        const { record, old_record } = await req.json()

        if (record.status === old_record.status) {
            return new Response(JSON.stringify({ message: 'No status change' }), { status: 200 })
        }

        console.log(`Order ${record.order_number} status changed: ${old_record.status} -> ${record.status}`)

        // Email/SMS logic here based on new status
        // For 'shipped' -> Send tracking link
        // For 'delivered' -> Send review request

        return new Response(
            JSON.stringify({ message: `Status update notification processed for ${record.order_number}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
