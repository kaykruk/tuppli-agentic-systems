'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, Zap } from 'lucide-react'

export function UpgradeBanner() {
    const [dismissed, setDismissed] = useState(false)

    if (dismissed) return null

    return (
        <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white px-4 py-3 flex items-center justify-center gap-3 text-sm shadow-lg">
            <Zap className="w-4 h-4 text-yellow-400 shrink-0 animate-pulse" />
            <span className="font-medium">
                You&apos;re on the <span className="font-black">Free Plan</span> — upgrade to unlock full forensic protection
            </span>
            <Link
                href="/subscription"
                className="ml-2 bg-white text-slate-900 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider hover:bg-blue-100 transition-colors shrink-0"
            >
                Upgrade Now
            </Link>
            <button
                onClick={() => setDismissed(true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                aria-label="Dismiss"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}
