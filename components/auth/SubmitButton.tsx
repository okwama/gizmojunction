'use client';

import { useFormStatus } from 'react-dom';
import { ArrowRight, Loader2 } from 'lucide-react';

interface SubmitButtonProps {
    isSignUp: boolean;
    signInAction: (formData: FormData) => Promise<void>;
    signUpAction: (formData: FormData) => Promise<void>;
}

export default function SubmitButton({ isSignUp, signInAction, signUpAction }: SubmitButtonProps) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            formAction={isSignUp ? signUpAction : signInAction}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 group transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20"
        >
            {pending ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                </>
            ) : (
                <>
                    {isSignUp ? 'Create Workspace' : 'Continue to Dashboard'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
            )}
        </button>
    );
}
