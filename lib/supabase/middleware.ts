import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const url = request.nextUrl.clone()

    // Protect Admin Routes
    if (url.pathname.startsWith('/admin')) {
        if (!user) {
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        // Check if user has admin role
        // Fetch user roles
        const { data: userRoles } = await supabase
            .from('user_roles')
            .select('roles(name)')
            .eq('user_id', user.id);

        const isAdmin = userRoles?.some((ur: any) => ur.roles?.name === 'admin');

        if (!isAdmin) {
            // Allow them if they are admin, otherwise redirect to home
            // Note: for now we just redirect to home if not admin
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }

    // Protect customer profile routes
    if (url.pathname.startsWith('/profile') || url.pathname.startsWith('/orders')) {
        if (!user) {
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    }

    // Redirect logged in users away from login page
    if (url.pathname === '/login' && user) {
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
