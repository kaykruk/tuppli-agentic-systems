'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Lock, ArrowRight, Shield } from 'lucide-react'
import Link from 'next/link'

interface UpgradeModalProps {
    open: boolean
    onClose: () => void
    feature?: string
    description?: string
}

export function UpgradeModal({ open, onClose, feature, description }: UpgradeModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md rounded-3xl border-0 shadow-2xl p-0 overflow-hidden">
                {/* Header gradient */}
                <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 px-8 py-10 text-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-5 border border-white/20">
                        <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                        Upgrade Required
                    </h2>
                    {feature && (
                        <p className="text-blue-200 text-sm mt-2 font-medium">
                            {feature}
                        </p>
                    )}
                </div>
                
                {/* Body */}
                <div className="px-8 py-8 text-center">
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        {description || 'This feature is available on a paid plan. Upgrade to unlock full forensic protection, automated scanning, and DMCA enforcement.'}
                    </p>
                    <div className="space-y-3">
                        <Link href="/subscription" className="block">
                            <Button className="w-full py-6 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl">
                                View Plans
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                        <button
                            onClick={onClose}
                            className="text-xs text-slate-400 font-bold uppercase tracking-wider hover:text-slate-600 transition-colors"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
