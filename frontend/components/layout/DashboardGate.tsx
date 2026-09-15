'use client'

import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardGateProps {
    isUnverified: boolean
    isUnpaid: boolean
    email?: string
}

export function DashboardGate({ isUnverified, email }: DashboardGateProps) {
    if (isUnverified) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-white/60 backdrop-blur-md">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white border border-slate-200 rounded-[3rem] p-12 shadow-2xl text-center"
                >
                    <div className="w-24 h-24 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Mail className="w-10 h-10 text-blue-600 animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">Verify Your Email</h2>
                    <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                        We've sent a secure link to <span className="text-slate-900 font-bold underline">{email}</span>. Please verify your account to unlock your forensic suite.
                    </p>
                    <div className="space-y-4">
                        <Button 
                            className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
                            onClick={() => window.location.reload()}
                        >
                            I've Verified My Email
                        </Button>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Didn't get the mail? <span className="text-blue-600 cursor-pointer hover:underline">Resend Verification</span>
                        </p>
                    </div>
                </motion.div>
            </div>
        )
    }

    return null
}

