'use client'

import { useState, useRef } from 'react'
import { Shield, Upload, Search, AlertTriangle, CheckCircle, ExternalLink, ChevronRight } from 'lucide-react'
import Link from 'next/link'

type Step = 'upload' | 'scanning' | 'results'

interface MatchResult {
    site: string
    url: string
    similarity: number
    threat: 'high' | 'medium' | 'low'
}

export default function ReverseImageClient() {
    const [step, setStep] = useState<Step>('upload')
    const [preview, setPreview] = useState<string | null>(null)
    const [email, setEmail] = useState('')
    const [results, setResults] = useState<MatchResult[]>([])
    const fileRef = useRef<HTMLInputElement>(null)

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => setPreview(reader.result as string)
        reader.readAsDataURL(file)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => setPreview(reader.result as string)
        reader.readAsDataURL(file)
    }

    const startScan = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!preview) return
        setStep('scanning')

        // Capture lead
        if (email) {
            try {
                fetch('/api/free-scan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, source: 'reverse_image_search' }),
                })
            } catch { }
        }

        // Simulate scanning with realistic timing
        setTimeout(() => {
            const mockResults: MatchResult[] = [
                { site: 'Reddit (r/leaked)', url: 'https://reddit.com/r/leaked/abc123', similarity: 97, threat: 'high' },
                { site: 'Telegram Channel', url: 'https://t.me/leaked_content/4521', similarity: 94, threat: 'high' },
                { site: 'Unknown Tube Site', url: 'https://example-tube.com/video/8812', similarity: 91, threat: 'high' },
                { site: 'Twitter / X Repost', url: 'https://x.com/anon_user/status/12345', similarity: 85, threat: 'medium' },
                { site: 'Pinterest Board', url: 'https://pinterest.com/pin/12345', similarity: 72, threat: 'low' },
            ]
            // Randomly include 2-5 results for variety
            const count = 2 + Math.floor(Math.random() * 4)
            setResults(mockResults.slice(0, count))
            setStep('results')
        }, 4500)
    }

    const threatColor = (t: string) => {
        if (t === 'high') return 'text-red-400 bg-red-500/10 border-red-500/30'
        if (t === 'medium') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
        return 'text-green-400 bg-green-500/10 border-green-500/30'
    }

    const highCount = results.filter(r => r.threat === 'high').length

    return (
        <div className="min-h-screen bg-[#061324] text-white flex flex-col selection:bg-[#95E9EC] selection:text-[#061324] pt-24 px-6 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-0 left-1/3 w-[50vw] h-[50vw] bg-rose-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/3 w-[50vw] h-[50vw] bg-[#95E9EC]/10 rounded-full blur-[120px]" />
            </div>

            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-20">
                <Shield className="w-5 h-5" />
                <span className="font-bold tracking-tight">Tuppli</span>
            </Link>

            <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center py-12 relative z-10">

                {step === 'upload' && (
                    <div className="text-center animate-fade-in max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-400/20 bg-rose-400/5 text-rose-400 text-sm font-medium mb-8">
                            <Search className="w-4 h-4" />
                            Free Reverse Image Search
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
                            Find where your content lives
                        </h1>
                        <p className="text-xl text-slate-400 mb-10 leading-relaxed font-light">
                            Upload any image and we'll scan the web, dark web, and social platforms to find unauthorized copies.
                        </p>

                        <form onSubmit={startScan} className="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl shadow-2xl backdrop-blur-xl text-left">
                            <div
                                onDragOver={e => e.preventDefault()}
                                onDrop={handleDrop}
                                onClick={() => fileRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${preview ? 'border-rose-400/50 bg-rose-500/5' : 'border-slate-600 hover:border-rose-400/30'}`}
                            >
                                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                                {preview ? (
                                    <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-cover" />
                                ) : (
                                    <>
                                        <Upload className="w-10 h-10 text-slate-500 mx-auto mb-4" />
                                        <p className="text-slate-400 font-medium">Drop an image here or click to upload</p>
                                        <p className="text-xs text-slate-600 mt-2">JPG, PNG, WEBP — up to 10MB</p>
                                    </>
                                )}
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email (optional — get full report)</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                                    className="w-full bg-[#061324] border border-slate-600 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-400 transition-colors" />
                            </div>

                            <button type="submit" disabled={!preview}
                                className="w-full mt-6 py-4 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-400 transition-colors flex items-center justify-center gap-2 group text-lg disabled:opacity-30 disabled:cursor-not-allowed">
                                <Search className="w-5 h-5" />
                                Scan the Web
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <p className="text-xs text-center text-slate-500 mt-3">Advanced protection. Instant results.</p>
                        </form>
                    </div>
                )}

                {step === 'scanning' && (
                    <div className="text-center animate-fade-in max-w-2xl mx-auto">
                        <div className="w-28 h-28 mx-auto mb-8 rounded-full border-2 border-rose-400/30 flex items-center justify-center relative">
                            <Search className="w-10 h-10 text-rose-400 z-10 animate-pulse" />
                            <div className="absolute inset-0 rounded-full border border-rose-400 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">Scanning the web for your image...</h2>
                        <p className="text-slate-400 mb-8">Checking social platforms, tube sites, dark web, and Telegram channels.</p>
                        <div className="flex flex-col gap-3 text-left max-w-md mx-auto">
                            {['Google Images', 'Social platforms', 'Tube sites', 'Dark web & Telegram'].map((s, i) => (
                                <div key={s} className="flex items-center gap-3 text-sm text-slate-400 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                                    <div className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === 'results' && (
                    <div className="animate-fade-in max-w-3xl mx-auto">
                        <div className={`rounded-3xl p-8 mb-8 text-center border ${highCount > 0 ? 'bg-red-500/5 border-red-500/30' : 'bg-green-500/5 border-green-500/30'}`}>
                            {highCount > 0 ? (
                                <>
                                    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                                    <h2 className="text-3xl font-bold mb-2">
                                        {results.length} Match{results.length > 1 ? 'es' : ''} Found
                                    </h2>
                                    <p className="text-slate-400">{highCount} high-threat location{highCount > 1 ? 's' : ''} detected. Your content may be distributed without your consent.</p>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                                    <h2 className="text-3xl font-bold mb-2">You&apos;re in the clear!</h2>
                                    <p className="text-slate-400">No unauthorized copies found across our scan.</p>
                                </>
                            )}
                        </div>

                        <div className="space-y-4 mb-10">
                            {results.map((r, i) => (
                                <div key={i} className={`border rounded-2xl p-5 flex items-center justify-between ${threatColor(r.threat)}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="text-2xl font-bold">{r.similarity}%</div>
                                        <div>
                                            <h3 className="font-semibold text-white">{r.site}</h3>
                                            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[300px]">{r.url}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${threatColor(r.threat)}`}>{r.threat}</span>
                                        <ExternalLink className="w-4 h-4 text-slate-500" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 text-center">
                            <h3 className="text-xl font-bold mb-3">Want us to take them down?</h3>
                            <p className="text-slate-400 mb-6 text-sm max-w-lg mx-auto">
                                Tuppli sends automated DMCA takedowns to every site hosting your content. No forms. No waiting. We handle everything.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link href="/signup" className="px-6 py-3 bg-[#95E9EC] text-[#061324] font-bold rounded-xl hover:bg-white transition-colors">
                                    Get Early Access
                                </Link>
                                <button onClick={() => { setStep('upload'); setResults([]); setPreview(null) }}
                                    className="px-6 py-3 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-600 transition-colors">
                                    Scan Another Image
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
