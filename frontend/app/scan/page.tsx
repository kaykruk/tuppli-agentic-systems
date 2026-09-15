'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, ShieldAlert, Lock, ArrowRight, Loader2, Play } from 'lucide-react'
import Link from 'next/link'

export default function ThreatScanner() {
    const [handle, setHandle] = useState('')
    const [stage, setStage] = useState<'idle' | 'scanning' | 'results'>('idle')
    const [logs, setLogs] = useState<string[]>([])
    const [threatCount, setThreatCount] = useState(0)
    const [platforms, setPlatforms] = useState<string[]>([])
    const [specificThreats, setSpecificThreats] = useState<string[]>([])
    const logsEndRef = useRef<HTMLDivElement>(null)

    // Auto-scroll terminal
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [logs])

    const startScan = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!handle) return

        setStage('scanning')
        setLogs([`> initializing forensic scrape for target: @${handle}`])
        setThreatCount(0)
        setPlatforms([])
        setSpecificThreats([])

        // Simulated scanning sequence for dramatic effect
        const scanSteps = [
            `> connecting to global proxy network... [OK]`,
            `> extracting perceptual hashes for @${handle}... [OK]`,
            `> querying surface web (Reddit, Twitter, Google Images)...`,
            `> querying dark web forums (.onion)...`,
            `> aggregating threat intelligence...`,
            `> generating impact report...`
        ]

        let totalThreats = 0;
        for (let i = 0; i < scanSteps.length; i++) {
            await new Promise(r => setTimeout(r, 400 + Math.random() * 600))
            setLogs(prev => [...prev, scanSteps[i]])
            // We no longer add fake threats in the logs here; we wait for the API data.
        }

        try {
            const res = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ handle }),
            })

            const data = await res.json()

            if (res.ok && data.success) {
                setThreatCount(data.threats_found)
                setPlatforms(data.platforms || [])
                setSpecificThreats(data.specific_threats || [])
            }
        } catch (e) {
            console.error(e)
        }

        setTimeout(() => {
            setStage('results')
        }, 1200)
    }

    return (
        <div className="min-h-screen bg-[#061324] text-white flex flex-col items-center pt-24 px-6 relative overflow-hidden selection:bg-[#95E9EC] selection:text-[#061324]">
            {/* Background Glow */}
            <div className="fixed inset-0 pointer-events-none opacity-30">
                <div className="absolute top-[-20%] left-[20%] w-[50vw] h-[50vw] bg-red-500/10 rounded-full blur-[150px]" />
                <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-[#95E9EC]/5 rounded-full blur-[150px]" />
            </div>

            <div className="w-full max-w-3xl relative z-10 flex flex-col pt-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Is your content being <span className="text-red-400">stolen?</span>
                    </h1>
                    <p className="text-xl text-slate-400">
                        Enter your creator handle. We'll run a free forensic surface scrape across the web to find leaked premium content.
                    </p>
                </div>

                {/* Main Interaction Area */}
                <div className="glass-card rounded-[2rem] p-8 md:p-12 border-t border-white/10 shadow-2xl relative overflow-hidden min-h-[400px]">

                    {/* Idle State (Input Form) */}
                    {stage === 'idle' && (
                        <div className="animate-fade-in flex flex-col items-center justify-center h-full py-12">
                            <form onSubmit={startScan} className="w-full max-w-md">
                                <div className="relative flex items-center mb-6 text-2xl">
                                    <span className="absolute left-6 text-slate-500 font-bold">@</span>
                                    <input
                                        type="text"
                                        value={handle}
                                        onChange={(e) => setHandle(e.target.value)}
                                        placeholder="your_handle"
                                        className="w-full bg-[#030914] border border-white/10 rounded-full py-5 pl-14 pr-6 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#95E9EC]/50 focus:ring-1 focus:ring-[#95E9EC]/50 font-mono transition-all"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-[#95E9EC] text-[#061324] font-bold text-lg py-5 rounded-full hover:bg-white transition-all shadow-[0_0_30px_rgba(149,233,236,0.15)] flex items-center justify-center gap-2 group"
                                >
                                    <Search className="w-5 h-5" />
                                    Run Vulnerability Scan
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                            <p className="mt-6 text-xs text-slate-500 flex items-center gap-2">
                                <Lock className="w-3 h-3" /> Anonymous & secure. Not logged.
                            </p>
                        </div>
                    )}

                    {/* Scanning State (Terminal UI) */}
                    {stage === 'scanning' && (
                        <div className="animate-fade-in flex flex-col h-full font-mono">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <Loader2 className="w-5 h-5 text-[#95E9EC] animate-spin" />
                                    <span className="text-[#95E9EC] font-semibold tracking-wider text-sm">RECON IN PROGRESS</span>
                                </div>
                                <div className="text-red-400 font-bold">
                                    {threatCount} LEAKS DETECTED
                                </div>
                            </div>

                            <div className="flex-1 bg-black/40 rounded-xl p-6 overflow-y-auto max-h-[300px] border border-white/5 shadow-inner">
                                {logs.map((log, i) => (
                                    <div key={i} className={`mb-2 text-sm ${log.includes('!') ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                                        {log}
                                    </div>
                                ))}
                                <div ref={logsEndRef} />
                            </div>
                        </div>
                    )}

                    {/* Results State (The Hook) */}
                    {stage === 'results' && (
                        <div className="animate-fade-in flex flex-col items-center text-center py-6">
                            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                                <ShieldAlert className="w-10 h-10 text-red-500" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2 text-white">
                                {threatCount > 0 ? 'Critical Vulnerability Found' : 'Deep Scan Required'}
                            </h2>
                            <p className="text-slate-400 mb-8 max-w-md">
                                {threatCount > 0
                                    ? <>Tuppli detected <span className="text-red-400 font-bold">{threatCount} instances</span> of @{handle}'s premium content hosted on {platforms.length > 0 ? platforms.join(', ') : 'unauthorized forums'}.</>
                                    : `No immediate surface leaks found for @${handle}. However, deep-web and protected Telegram archives require an authenticated scan.`
                                }
                            </p>

                            {/* Simulated Blurred Evidence */}
                            {threatCount > 0 && (
                                <div className="w-full bg-[#030914] border border-white/5 rounded-2xl p-6 mb-8 relative overflow-hidden group text-left font-mono text-sm max-w-md">
                                    <div className="absolute inset-0 backdrop-blur-md bg-[#061324]/60 z-10 flex flex-col items-center justify-center transition-all duration-300">
                                        <Lock className="w-8 h-8 text-[#95E9EC] mb-3" />
                                        <span className="text-sm font-semibold text-white tracking-widest uppercase">Encrypted Evidence View</span>
                                    </div>

                                    <div className="opacity-40 blur-sm pointer-events-none space-y-4">
                                        {specificThreats.length > 0 ? (
                                            specificThreats.map((threat, idx) => (
                                                <div key={idx} className="bg-red-900/20 p-3 rounded border border-red-500/10 text-red-400 truncate">
                                                    ! {threat}
                                                </div>
                                            ))
                                        ) : (
                                            <>
                                                <div className="h-4 w-3/4 bg-red-900/40 rounded"></div>
                                                <div className="h-4 w-1/2 bg-red-900/40 rounded"></div>
                                                <div className="h-16 w-full bg-slate-800 rounded"></div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            <Link href={`/login?intent=scan&handle=${handle}`} className="w-full max-w-md bg-red-500 text-white font-bold text-xl py-5 rounded-full hover:bg-red-400 transition-all shadow-[0_0_30px_rgba(239,68,68,0.2)] flex items-center justify-center gap-2 group">
                                {threatCount > 0 ? 'Unlock Report & Auto-DMCA' : 'Start Free Deep Scan'}
                                <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                            </Link>

                            <p className="mt-6 text-sm text-slate-500">
                                Free users can issue 5 immediate takedown notices upon signup.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
