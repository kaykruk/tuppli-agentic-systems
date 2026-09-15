'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
    Shield, ArrowRight, Mail, Lock, CheckCircle2, 
    ChevronRight, Fingerprint
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters')
            setLoading(false)
            return
        }

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: email.split('@')[0],
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (signUpError) throw signUpError

            setSuccess(true)
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white px-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-slate-200 rounded-[3rem] shadow-2xl p-12 text-center w-full max-w-md"
                >
                    <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">Verify your email</h2>
                    <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                        A confirmation link has been sent to <span className="text-slate-900 font-bold underline">{email}</span>. Please click the link to finish setting up your account.
                    </p>
                    <Button 
                        variant="outline" 
                        className="w-full h-14 rounded-2xl border-slate-200 font-black text-xs uppercase tracking-widest text-slate-900 hover:bg-slate-50"
                        onClick={() => router.push('/login')}
                    >
                        Return to Mission Hub
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 px-6 py-20">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-[3rem] shadow-2xl shadow-slate-200/50 p-10 md:p-12 w-full max-w-lg relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16" />

                <div className="text-center mb-10 relative z-10">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-3 shadow-inner">
                            <Image
                                src="/logo.png"
                                alt="Tuppli Logo"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Create your account</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Start protecting your content today</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-14 pl-14 bg-slate-50 border-slate-200 text-slate-900 rounded-2xl font-bold focus:ring-indigo-500 shadow-inner"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block h-4">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-14 pl-14 bg-slate-50 border-slate-200 text-slate-900 rounded-2xl font-bold focus:ring-indigo-500 shadow-inner"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block h-4">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="h-14 pl-14 bg-slate-50 border-slate-200 text-slate-900 rounded-2xl font-bold focus:ring-indigo-500 shadow-inner"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                            <p className="text-[11px] font-black text-red-600 uppercase tracking-tight text-center">{error}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-indigo-600 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 transition-all group"
                    >
                        {loading ? 'Creating account...' : (
                            <>
                                Sign Up
                                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                            <span className="px-4 bg-white text-slate-300">Sign in with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    const { error } = await supabase.auth.signInWithOAuth({
                                        provider: 'google',
                                        options: { redirectTo: `${window.location.origin}/auth/callback` }
                                    });
                                    if (error) throw error;
                                } catch (error: any) {
                                    setError(error.message);
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                            className="h-12 border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50"
                        >
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Google
                        </Button>
                        
                        <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    const { error } = await supabase.auth.signInWithOAuth({
                                        provider: 'x',
                                        options: { redirectTo: `${window.location.origin}/auth/callback` }
                                    });
                                    if (error) throw error;
                                } catch (error: any) {
                                    setError(error.message);
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                            className="h-12 border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50"
                        >
                            <span className="text-lg font-bold leading-none">𝕏</span>
                        </Button>
                    </div>

                    <div className="text-center mt-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Already have an account? {' '}
                            <Link href="/login" className="text-indigo-600 hover:underline">
                                Log In
                            </Link>
                        </p>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
