import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, Github, Chrome, ShieldCheck, User } from 'lucide-react';
import SubmitButton from '@/components/auth/SubmitButton';

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string; mode?: string }>;
}) {
    const params = await searchParams;
    const isSignUp = params.mode === 'signup';

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If already logged in, redirect based on role
    if (user) {
        const { data: userRoles } = await supabase
            .from('user_roles')
            .select('roles(name)')
            .eq('user_id', user.id);

        const isAdmin = userRoles?.some((ur: any) =>
            ['admin', 'operations', 'inventory_manager', 'customer_support'].includes(ur.roles?.name)
        );

        if (isAdmin) {
            return redirect('/admin/dashboard');
        }
        return redirect('/');
    }

    const signIn = async (formData: FormData) => {
        'use server';

        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const supabase = await createClient();

        const { error, data } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return redirect('/login?message=Invalid credentials');
        }

        // Fetch user roles for redirection
        const { data: userRoles } = await supabase
            .from('user_roles')
            .select('roles(name)')
            .eq('user_id', data.user.id);

        const isAdmin = userRoles?.some((ur: any) =>
            ['admin', 'operations', 'inventory_manager', 'customer_support'].includes(ur.roles?.name)
        );

        if (isAdmin) {
            return redirect('/admin/dashboard');
        }
        return redirect('/');
    };

    const signUp = async (formData: FormData) => {
        'use server';

        const origin = (await headers()).get('origin');
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const fullName = formData.get('fullName') as string;
        const supabase = await createClient();

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
                emailRedirectTo: `${origin}/auth/callback`,
            },
        });

        if (error) {
            return redirect(`/login?mode=signup&message=${encodeURIComponent(error.message)}`);
        }

        return redirect('/login?message=Check your email to verify your account');
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-4">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="w-full max-w-md relative">
                {/* Brand */}
                <div className="text-center mb-10">
                    <Link href="/" className="text-3xl font-black tracking-tighter text-blue-600 inline-block">
                        GIZMO<span className="text-neutral-900 dark:text-white">JUNCTION</span>
                    </Link>
                    <p className="text-neutral-500 mt-2 text-sm">
                        {isSignUp ? 'Create your professional account' : 'Welcome back to your workspace'}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-neutral-900 shadow-2xl rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
                    {/* Header Tabs */}
                    <div className="flex border-b border-neutral-100 dark:border-neutral-800">
                        <Link
                            href="/login"
                            className={`flex-1 py-4 text-center text-sm font-bold transition-all ${!isSignUp ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'}`}
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/login?mode=signup"
                            className={`flex-1 py-4 text-center text-sm font-bold transition-all ${isSignUp ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'}`}
                        >
                            Create Account
                        </Link>
                    </div>

                    <div className="p-8">
                        <form className="space-y-6">
                            {isSignUp && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-blue-600 transition-colors" />
                                        <input
                                            name="fullName"
                                            required
                                            placeholder="John Doe"
                                            className="w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-blue-600 dark:focus:border-blue-600 rounded-xl outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="you@work.com"
                                        className="w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-blue-600 dark:focus:border-blue-600 rounded-xl outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Password</label>
                                    {!isSignUp && (
                                        <Link href="#" className="text-xs font-bold text-blue-600 hover:underline">
                                            Forgot?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent focus:border-blue-600 dark:focus:border-blue-600 rounded-xl outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <SubmitButton
                                isSignUp={isSignUp}
                                signInAction={signIn}
                                signUpAction={signUp}
                            />
                        </form>

                        <div className="mt-8">
                            <div className="relative flex items-center justify-center">
                                <span className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-neutral-100 dark:border-neutral-800"></span>
                                </span>
                                <span className="relative bg-white dark:bg-neutral-900 px-4 text-xs font-bold uppercase text-neutral-400">
                                    or continue with
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <button className="flex items-center justify-center gap-2 py-3 border-2 border-neutral-100 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition text-sm font-bold">
                                    <Chrome className="w-4 h-4" />
                                    Google
                                </button>
                                <button className="flex items-center justify-center gap-2 py-3 border-2 border-neutral-100 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition text-sm font-bold">
                                    <Github className="w-4 h-4" />
                                    GitHub
                                </button>
                            </div>
                        </div>

                        {params?.message && (
                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                                <p className="text-xs text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
                                    {params.message}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Link */}
                <p className="mt-8 text-center text-sm text-neutral-500">
                    Just browsing? <Link href="/" className="text-blue-600 font-bold hover:underline">Return to Store</Link>
                </p>
            </div>
        </div>
    );
}
