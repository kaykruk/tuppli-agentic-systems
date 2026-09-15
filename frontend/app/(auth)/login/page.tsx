'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Shield, ArrowRight, Lock, Mail, ChevronRight, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            router.push('/dashboard')
            router.refresh()
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-10 md:p-12 w-full max-w-md relative overflow-hidden"
        >
            {/* Visual Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16" />
            
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
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Log In</h1>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Protect your content</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
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
                            className="h-14 pl-14 bg-slate-50 border-slate-200 text-slate-900 rounded-2xl font-bold focus:ring-blue-500 shadow-inner"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label htmlFor="password" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Password
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                        >
                            Reset
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-14 pl-14 bg-slate-50 border-slate-200 text-slate-900 rounded-2xl font-bold focus:ring-blue-500 shadow-inner"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-50 border border-red-100 rounded-xl p-4"
                    >
                        <p className="text-[11px] font-black text-red-600 uppercase tracking-tight text-center">{error}</p>
                    </motion.div>
                )}

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 transition-all group"
                >
                    {loading ? 'Logging in...' : (
                        <>
                            Log In
                            <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </Button>

                <div className="relative my-10">
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
                        New here? {' '}
                        <Link href="/signup" className="text-blue-600 hover:underline">
                            Create an account
                        </Link>
                    </p>
                </div>
            </form>
        </motion.div>
    )
}
