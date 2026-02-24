import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // Check for Vercel Cron Authorization or secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const supabaseUrl = process.env.SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const response = await fetch(
            `${supabaseUrl}/functions/v1/send-abandoned-cart`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${serviceRoleKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = await response.json();

        return NextResponse.json({
            success: true,
            message: 'Cron triggered successfully',
            supabaseResponse: data
        });
    } catch (error: any) {
        console.error('Cron Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
