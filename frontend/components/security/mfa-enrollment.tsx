'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
// MFA Enrollment Component
import { Shield, Smartphone, Key, AlertCircle, CheckCircle2 } from 'lucide-react'

// Standard button/input might be in /components/ui/ but I'll use raw tags if unsure, 
// however the codebase uses shadcn-like components.

export function MfaEnrollment() {
    const [step, setStep] = useState<'initial' | 'enrolling' | 'verifying' | 'complete'>('initial')
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [factorId, setFactorId] = useState<string | null>(null)
    const [verifyCode, setVerifyCode] = useState('')
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    async function startEnrollment() {
        setError(null)
        try {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp'
            })
            if (error) throw error

            setFactorId(data.id)
            setQrCode(data.totp.qr_code)
            setStep('verifying')
        } catch (err: any) {
            setError(err.message)
        }
    }

    async function verifyEnrollment() {
        if (!factorId) return
        setError(null)
        try {
            const { error } = await supabase.auth.mfa.challengeAndVerify({
                factorId,
                code: verifyCode
            })
            if (error) throw error
            setStep('complete')
        } catch (err: any) {
            setError(err.message)
        }
    }

    if (step === 'complete') {
        return (
            <div className="text-center p-8 space-y-4 animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Forensic Identity Secured</h3>
                <p className="text-slate-400 max-w-xs mx-auto text-sm">
                    Multi-Factor Authentication is now active. Your account is protected by an additional cryptographic layer.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {step === 'initial' && (
                <div className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex gap-3">
                        <Smartphone className="w-5 h-5 text-blue-500 shrink-0" />
                        <div>
                            <p className="text-sm text-blue-400 font-bold mb-1">Standard Security Protocol</p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Deploy a TOTP-based secondary factor (Google Authenticator, 1Password, etc) to prevent unauthorized access even if your password is compromised.
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={startEnrollment}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 group"
                    >
                        <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Init MFA Enrollment
                    </button>
                </div>
            )}

            {step === 'verifying' && qrCode && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center space-y-2">
                        <p className="text-sm text-slate-400">Scan this code with your authenticator app</p>
                        <div className="bg-white p-2 inline-block rounded-lg mx-auto">
                            <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Verification Code</label>
                        <input 
                            type="text"
                            placeholder="000000"
                            value={verifyCode}
                            onChange={(e) => setVerifyCode(e.target.value)}
                            className="w-full bg-black border border-slate-800 rounded-lg py-3 px-4 text-center text-2xl font-mono tracking-[0.5em] text-white focus:border-blue-500 outline-none transition-all"
                            maxLength={6}
                        />
                        {error && (
                            <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-2 rounded text-xs border border-red-500/20">
                                <AlertCircle className="w-3 h-3" />
                                {error}
                            </div>
                        )}
                        <button 
                            onClick={verifyEnrollment}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all"
                        >
                            Finalize Secure Tunnel
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
