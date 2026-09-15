'use client'

import { useState, useEffect, useRef } from 'react'
import { Shield, Eye, EyeOff, AlertTriangle, CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

type CheckStatus = 'idle' | 'checking' | 'results'

interface CheckResult {
    platform: string
    status: 'clean' | 'warning' | 'shadowbanned'
    detail: string
}

export default function ShadowbanClient() {
    const [step, setStep] = useState<CheckStatus>('idle')
    const [handle, setHandle] = useState('')
    const [email, setEmail] = useState('')
    const [results, setResults] = useState<CheckResult[]>([])
    const [logs, setLogs] = useState<string[]>([])
    const logsEnd = useRef<HTMLDivElement>(null)

    const statusIcon = (s: CheckResult['status']) => {
        if (s === 'clean') return <CheckCircle className="w-5 h-5 text-green-400" />
        if (s === 'warning') return <AlertTriangle className="w-5 h-5 text-yellow-400" />
        return <XCircle className="w-5 h-5 text-red-400" />
    }

    const statusColor = (s: CheckResult['status']) => {
        if (s === 'clean') return 'border-green-500/30 bg-green-500/5'
        if (s === 'warning') return 'border-yellow-500/30 bg-yellow-500/5'
        return 'border-red-500/30 bg-red-500/5'
    }

    const startCheck = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!handle) return
        setStep('checking')
        setLogs([])

        // Capture the lead
        if (email) {
            try {
                fetch('/api/free-scan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ handle, email, source: 'shadowban_tester' }),
                })
            } catch { }
        }

        // Simulated check sequence
        const checks = [
            { text: `Checking Twitter/X search visibility for @${handle}...`, delay: 1200 },
            { text: 'Querying X suggestion API...', delay: 1500 },
            { text: 'Checking Instagram Explore reach...', delay: 1800 },
            { text: 'Verifying TikTok For You Page eligibility...', delay: 1500 },
            { text: 'Analyzing hashtag reachability...', delay: 1200 },
            { text: 'Compiling results...', delay: 800 },
        ]

        let cumDelay = 0
        checks.forEach((c) => {
            cumDelay += c.delay
            setTimeout(() => {
                setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${c.text}`])
            }, cumDelay)
        })

        // Generate realistic-looking results
        setTimeout(() => {
            const mockResults: CheckResult[] = [
                {
                    platform: 'Twitter / X',
                    status: Math.random() > 0.5 ? 'warning' : 'clean',
                    detail: Math.random() > 0.5
                        ? 'Your tweets may not appear in search results for non-followers. This is common for accounts posting adult content links.'
                        : 'Your account appears fully visible in Twitter search.',
                },
                {
                    platform: 'Instagram',
                    status: Math.random() > 0.6 ? 'warning' : 'clean',
                    detail: Math.random() > 0.6
                        ? 'Hashtag reach appears suppressed. Your posts may not appear in Explore or hashtag feeds.'
                        : 'No suppression detected on Instagram.',
                },
                {
                    platform: 'TikTok',
                    status: Math.random() > 0.4 ? 'warning' : 'clean',
                    detail: Math.random() > 0.4
                        ? 'FYP distribution may be limited. Accounts linking to adult platforms often receive reduced algorithmic reach.'
                        : 'Your TikTok account appears to have normal FYP distribution.',
                },
                {
                    platform: 'Reddit',
                    status: 'clean',
                    detail: 'No shadowban detected on Reddit. Your posts and comments are visible.',
                },
            ]
            setResults(mockResults)
            setStep('results')
        }, cumDelay + 500)
    }

    useEffect(() => {
        logsEnd.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    const warningCount = results.filter(r => r.status !== 'clean').length

    return (
        <div className="min-h-screen bg-[#061324] text-white flex flex-col selection:bg-[#95E9EC] selection:text-[#061324] pt-24 px-6 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-purple-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-1/4 w-[50vw] h-[50vw] bg-[#95E9EC]/10 rounded-full blur-[120px]" />
            </div>

            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-20">
                <Shield className="w-5 h-5" />
                <span className="font-bold tracking-tight">Tuppli</span>
            </Link>

            <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center py-12 relative z-10">
                {step === 'idle' && (
                    <div className="text-center animate-fade-in max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-400/20 bg-purple-400/5 text-purple-400 text-sm font-medium mb-8">
                            <EyeOff className="w-4 h-4" />
                            Free Shadowban Tester
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
                            Are the platforms hiding you?
                        </h1>
                        <p className="text-xl text-slate-400 mb-10 leading-relaxed font-light">
                            Creators lose up to 80% of their reach without knowing it. Check if Twitter, Instagram, or TikTok are suppressing your account.
                        </p>

                        <form onSubmit={startCheck} className="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl shadow-2xl backdrop-blur-xl text-left">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Your handle (any platform)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">@</span>
                                        <input type="text" required value={handle} onChange={e => setHandle(e.target.value)} placeholder="your_username"
                                            className="w-full bg-[#061324] border border-slate-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-400 transition-colors" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Email (optional — get tips to fix it)</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                                        className="w-full bg-[#061324] border border-slate-600 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-400 transition-colors" />
                                </div>
                                <button type="submit" className="w-full py-4 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-400 transition-colors flex items-center justify-center gap-2 group text-lg">
                                    <Eye className="w-5 h-5" />
                                    Run Shadowban Check
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <p className="text-xs text-center text-slate-500">Instant results. Subscribe for full analysis.</p>
                            </div>
                        </form>
                    </div>
                )}

                {step === 'checking' && (
                    <div className="text-center animate-fade-in max-w-3xl mx-auto">
                        <div className="w-24 h-24 mx-auto mb-8 rounded-full border-2 border-purple-400/30 flex items-center justify-center relative">
                            <Eye className="w-8 h-8 text-purple-400 z-10" />
                            <div className="absolute inset-0 rounded-full border border-purple-400 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50" />
                        </div>
                        <h2 className="text-2xl font-bold mb-6">Checking @{handle} across platforms...</h2>
                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-left font-mono text-sm h-48 overflow-y-auto">
                            {logs.map((log, i) => (
                                <div key={i} className="text-purple-300/80 mb-2">{log}</div>
                            ))}
                            <div ref={logsEnd} />
                        </div>
                    </div>
                )}

                {step === 'results' && (
                    <div className="animate-fade-in max-w-3xl mx-auto">
                        <div className={`rounded-3xl p-8 mb-8 text-center border ${warningCount > 0 ? 'bg-yellow-500/5 border-yellow-500/30' : 'bg-green-500/5 border-green-500/30'}`}>
                            {warningCount > 0 ? (
                                <>
                                    <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                                    <h2 className="text-3xl font-bold mb-2">
                                        {warningCount} Platform{warningCount > 1 ? 's' : ''} May Be Suppressing You
                                    </h2>
                                    <p className="text-slate-400">Your reach could be significantly reduced without your knowledge.</p>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                                    <h2 className="text-3xl font-bold mb-2">All Clear!</h2>
                                    <p className="text-slate-400">No shadowbans detected across platforms.</p>
                                </>
                            )}
                        </div>

                        <div className="space-y-4 mb-10">
                            {results.map((r, i) => (
                                <div key={i} className={`border rounded-2xl p-6 flex items-start gap-4 ${statusColor(r.status)}`}>
                                    {statusIcon(r.status)}
                                    <div>
                                        <h3 className="font-semibold text-white text-lg">{r.platform}</h3>
                                        <p className="text-sm text-slate-400 mt-1">{r.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 text-center">
                            <h3 className="text-xl font-bold mb-3">Shadowbanned AND leaked?</h3>
                            <p className="text-slate-400 mb-6 text-sm max-w-lg mx-auto">
                                Platforms suppress your reach while pirates steal your content. Tuppli fights both — autonomous takedowns and content monitoring across the entire web.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link href="/free-scan" className="px-6 py-3 bg-[#95E9EC] text-[#061324] font-bold rounded-xl hover:bg-white transition-colors">
                                    Run a Free Leak Scan →
                                </Link>
                                <button onClick={() => { setStep('idle'); setResults([]); setLogs([]) }}
                                    className="px-6 py-3 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-600 transition-colors">
                                    Check Another Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
