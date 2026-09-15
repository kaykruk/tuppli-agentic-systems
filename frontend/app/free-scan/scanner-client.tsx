'use client'

import { useState, useEffect, useRef } from 'react'
import { Shield, Search, AlertTriangle, ShieldCheck, ChevronRight, Check } from 'lucide-react'
import Link from 'next/link'

type ScanStep = 'idle' | 'scanning' | 'results'

export default function FreeScannerClient() {
    const [step, setStep] = useState<ScanStep>('idle')
    const [handle, setHandle] = useState('')
    const [email, setEmail] = useState('')
    const [foundCount, setFoundCount] = useState(0)
    const [scanText, setScanText] = useState('Initializing Tuppli Recon Engine...')
    const [logs, setLogs] = useState<string[]>([])
    const logsEndRef = useRef<HTMLDivElement>(null)

    // Simulated scary results — in a real app this would come from the backend or be purely random for the marketing hook
    const [leaks, setLeaks] = useState<any[]>([])
    const [totalLeaks, setTotalLeaks] = useState(0)

    const startScan = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!handle || !email) return

        setStep('scanning')

        // Simulated scanning sequence for dramatic effect
        const sequence = [
            { text: 'Bypassing basic Google filters...', delay: 1000 },
            { text: 'Connecting to Tor relay network...', delay: 1500 },
            { text: 'Scanning Reddit data dumps...', delay: 2000 },
            { text: `Cross-referencing @${handle} against 4.2M known leak URLs...`, delay: 2500 },
            { text: 'Infiltrating Russian tube sites...', delay: 1800 },
            { text: 'Extracting Telegram group media hashes...', delay: 2200 },
            { text: 'Compiling threat intelligence report...', delay: 1500 },
        ]

        let currentDelay = 0;
        sequence.forEach((item, index) => {
            currentDelay += item.delay;
            setTimeout(() => {
                setScanText(item.text)
                setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${item.text}`])
                // Add some fake 'hits' during the scan
                if (index > 2) {
                    setFoundCount(prev => prev + Math.floor(Math.random() * 3) + 1)
                }
            }, currentDelay)
        })

        try {
            const res = await fetch('/api/free-scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ handle, email, source: 'free_scanner' }),
            })
            const data = await res.json()

            if (data.success && data.results) {
                setLeaks(data.results.breakdown || [])
                setTotalLeaks(data.results.threats_found || 0)
            }
        } catch (e) {
            console.error("Scan failed", e)
        }

        setTimeout(() => {
            setStep('results')
        }, Math.max(currentDelay + 1000, 5000))
    }

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    return (
        <div className="min-h-screen bg-[#061324] text-white flex flex-col selection:bg-[#95E9EC] selection:text-[#061324] pt-24 px-6 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] bg-[#95E9EC]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[50vw] h-[50vw] bg-red-500/10 rounded-full blur-[120px]" />
            </div>

            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <Shield className="w-5 h-5" />
                <span className="font-bold tracking-tight">Tuppli</span>
            </Link>

            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center py-12 relative z-10">

                {step === 'idle' && (
                    <div className="text-center animate-fade-in max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#95E9EC]/20 bg-[#95E9EC]/5 text-[#95E9EC] text-sm font-medium mb-8">
                            <Search className="w-4 h-4" />
                            Free Deep Web Recon
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
                            Find out who is stealing your content.
                        </h1>
                        <p className="text-xl text-slate-400 mb-10 leading-relaxed font-light">
                            Enter your creator handle. We'll scan the surface web, Reddit, and dark web forums to see where your premium content is being given away for free.
                        </p>

                        <form onSubmit={startScan} className="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl shadow-2xl backdrop-blur-xl text-left">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Creator Handle (OF, Fansly, etc)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">@</span>
                                        <input
                                            type="text"
                                            required
                                            value={handle}
                                            onChange={(e) => setHandle(e.target.value)}
                                            placeholder="your_username"
                                            className="w-full bg-[#061324] border border-slate-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#95E9EC] transition-colors"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Where should we send the report?</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Secure email address"
                                        className="w-full bg-[#061324] border border-slate-600 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#95E9EC] transition-colors"
                                    />
                                </div>
                                <button type="submit" className="w-full py-4 bg-[#95E9EC] text-[#061324] font-bold rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2 group text-lg">
                                    Initiate Recon Scan
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <p className="text-xs text-center text-slate-500 font-medium">Takes ~15 seconds. Activation required.</p>
                            </div>
                        </form>
                    </div>
                )}

                {step === 'scanning' && (
                    <div className="text-center animate-fade-in max-w-3xl mx-auto w-full">
                        <div className="mb-12 relative">
                            {/* Scanning Radar Animation */}
                            <div className="w-32 h-32 mx-auto rounded-full border-2 border-[#95E9EC]/20 relative flex items-center justify-center">
                                <Search className="w-8 h-8 text-[#95E9EC] z-10" />
                                <div className="absolute inset-0 rounded-full border border-[#95E9EC] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75" />
                                <div className="absolute inset-0 rounded-full border border-[#95E9EC] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s] opacity-50" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold mb-4">{scanText}</h2>

                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-8 text-left font-mono text-sm h-64 overflow-y-auto relative">
                            {logs.map((log, i) => (
                                <div key={i} className="text-green-400/80 mb-2">{log}</div>
                            ))}
                            <div ref={logsEndRef} />

                            {/* Overlay threat counter */}
                            {foundCount > 0 && (
                                <div className="absolute top-4 right-4 bg-red-500/10 border border-red-500/30 text-red-500 px-3 py-1 rounded-full animate-pulse flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    {foundCount} threats found
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 'results' && (
                    <div className="animate-fade-in max-w-3xl mx-auto w-full">
                        <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-8 mb-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />
                            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6 animate-pulse" />
                            <h2 className="text-4xl font-bold mb-4 text-white">Scan Complete: Critical Exposure Detected</h2>
                            <p className="text-xl text-slate-300">
                                We found <strong className="text-red-400 font-bold text-2xl">{totalLeaks}</strong> instances of your content hosted on piracy sites.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-12">
                            {leaks.map((leak, i) => (
                                <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${leak.severity === 'critical' ? 'bg-red-500 animate-pulse' : leak.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                                        <span className="font-medium text-slate-300">{leak.source}</span>
                                    </div>
                                    <span className="text-2xl font-bold text-white">{leak.count}</span>
                                </div>
                            ))}
                        </div>

                        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 text-center">
                            <h3 className="text-2xl font-bold mb-4">Don't let them profit off your work.</h3>
                            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                                Tuppli's AI can automatically issue legal DMCA takedowns to all {totalLeaks} of these hosts and un-index them from Google while you sleep.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/signup" className="px-8 py-4 bg-[#95E9EC] text-[#061324] font-bold rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2">
                                    <ShieldCheck className="w-5 h-5" />
                                    Nuke These Leaks Now
                                </Link>
                                <button
                                    onClick={() => {
                                        const text = encodeURIComponent(`🛡️ Tuppli forensic scan found ${totalLeaks} public leaks and impersonators of my brand in 0.4s. Creators, check your exposure here:`);
                                        const url = encodeURIComponent(window.location.origin);
                                        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
                                    }}
                                    className="px-8 py-4 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    Share Damage Report
                                </button>
                                <button
                                    onClick={() => {
                                        window.open(`/api/free-scan/report?handle=${handle}`, '_blank');
                                    }}
                                    className="px-8 py-4 bg-white text-[#061324] font-bold rounded-xl hover:bg-[#95E9EC] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Search className="w-5 h-5 text-red-500" />
                                    Download Forensic Audit
                                </button>
                                <button onClick={() => setStep('idle')} className="px-8 py-4 bg-transparent border border-slate-700 text-slate-400 font-medium rounded-xl hover:text-white transition-colors">
                                    Scan Another Target
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
