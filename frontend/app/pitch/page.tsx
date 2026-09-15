'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft, Download, ShieldCheck, Search, Users, Eye, Lock, Zap, MousePointerClick, TrendingUp, Globe, Sword, DollarSign, Rocket } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function PitchDeck() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isExporting, setIsExporting] = useState(false)
    const deckRef = useRef<HTMLDivElement>(null)

    // Auto-focus container on mount for keyboard navigation
    const containerRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        setTimeout(() => containerRef.current?.focus(), 100)
    }, [])

    const slides = [
        {
            id: 'title',
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center mb-6 ring-4 ring-primary/30 shadow-[0_0_50px_-12px_rgba(var(--primary),0.5)]"
                    >
                        <ShieldCheck className="w-16 h-16 text-primary" />
                    </motion.div>

                    <div className="space-y-4">
                        <h1 className="text-7xl font-bold tracking-tighter bg-gradient-to-r from-primary via-purple-400 to-blue-500 bg-clip-text text-transparent">
                            Tuppli
                        </h1>
                        <p className="text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
                            The Immune System for the Internet
                        </p>
                    </div>

                    <div className="pt-12 flex flex-col items-center space-y-2">
                        <div className="text-sm text-muted-foreground/60 uppercase tracking-widest">
                            Seed Round &bull; Q1 2026
                        </div>
                        <p className="text-xs text-muted-foreground/40 mt-4">Press → or Space to Navigate</p>
                    </div>
                </div>
            )
        },
        {
            id: 'problem',
            content: (
                <div className="flex flex-col h-full justify-center px-24 max-w-7xl mx-auto">
                    <div className="flex items-center space-x-6 mb-16">
                        <div className="p-4 bg-red-500/10 rounded-2xl shadow-inner">
                            <Eye className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-5xl font-bold tracking-tight">Access to Identity is Broken</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-20 items-center">
                        <div className="space-y-10">
                            <p className="text-3xl leading-relaxed font-light text-muted-foreground">
                                <span className="text-foreground font-semibold">Generative AI</span> has democratized identity theft. It now costs $0.00 to clone a face or voice.
                            </p>
                            <ul className="space-y-6 text-xl text-muted-foreground">
                                <li className="flex items-center space-x-4">
                                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                    <span>Deepfake scams targeting families are up 300%</span>
                                </li>
                                <li className="flex items-center space-x-4">
                                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                    <span>Creators lose revenue to unauthorized AI clones</span>
                                </li>
                                <li className="flex items-center space-x-4">
                                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                    <span>Reputation damage is instant & irreversible</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex justify-center">
                            <div className="relative w-full max-w-md aspect-square bg-card/30 backdrop-blur-sm rounded-3xl border border-border/50 overflow-hidden shadow-2xl flex items-center justify-center p-8">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
                                <div className="text-center space-y-4">
                                    <Sword className="w-24 h-24 text-red-500/50 mx-auto" />
                                    <h3 className="text-2xl font-bold">The Reactive Gap</h3>
                                    <p className="text-muted-foreground">Current solution: <br /> "Hire a lawyer after the damage is done."</p>
                                    <div className="inline-block bg-red-500/20 text-red-500 px-4 py-1 rounded-full text-sm font-bold">Too Slow. Too Expensive.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'solution',
            content: (
                <div className="flex flex-col h-full justify-center px-24 max-w-7xl mx-auto">
                    <div className="flex items-center space-x-6 mb-16">
                        <div className="p-4 bg-green-500/10 rounded-2xl shadow-inner">
                            <Lock className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-5xl font-bold tracking-tight">The Solution: Tuppli Vault</h2>
                    </div>

                    <div className="grid grid-cols-3 gap-10">
                        {[
                            { icon: Search, color: "text-blue-500", bg: "bg-blue-500/10", title: "1. Detect", desc: "Our AI agents patrol the surface & dark web 24/7, matching your biometric fingerprint against millions of sources." },
                            { icon: ShieldCheck, color: "text-green-500", bg: "bg-green-500/10", title: "2. Verify", desc: "We use cryptographic pHash technology to mathematically prove ownership of your likeness and content." },
                            { icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10", title: "3. Enforce", desc: "Automated legal takedowns (DMCA) and cease & desist orders issued instantly upon detection." }
                        ].map((item, i) => (
                            <div key={i} className="p-10 bg-card rounded-3xl border border-border/60 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
                                <div className={`h-14 w-14 ${item.bg} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                                    <item.icon className={`w-7 h-7 ${item.color}`} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'technology',
            content: (
                <div className="flex flex-col h-full justify-center px-24 max-w-7xl mx-auto">
                    <div className="flex items-center space-x-6 mb-16">
                        <div className="p-4 bg-purple-500/10 rounded-2xl shadow-inner">
                            <Globe className="w-10 h-10 text-purple-500" />
                        </div>
                        <h2 className="text-5xl font-bold tracking-tight">How It Works</h2>
                    </div>

                    <div className="relative p-12 bg-card/40 border border-border rounded-3xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

                        <div className="grid grid-cols-5 gap-4 items-center text-center">
                            <div className="col-span-1 space-y-4">
                                <div className="w-20 h-20 bg-background rounded-2xl border border-border flex items-center justify-center mx-auto shadow-lg">
                                    <Users className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <p className="font-bold">User Uploads</p>
                                <p className="text-xs text-muted-foreground">Original Content</p>
                            </div>

                            <div className="col-span-1 flex justify-center">
                                <ChevronRight className="w-8 h-8 text-muted-foreground animate-pulse" />
                            </div>

                            <div className="col-span-1 space-y-4 relative">
                                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto border-4 border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.3)]">
                                    <ShieldCheck className="w-12 h-12 text-primary" />
                                </div>
                                <p className="font-bold text-primary">Tuppli Core</p>
                                <p className="text-xs text-muted-foreground">pHash + Vector DB</p>
                            </div>

                            <div className="col-span-1 flex justify-center">
                                <ChevronRight className="w-8 h-8 text-muted-foreground animate-pulse" />
                            </div>

                            <div className="col-span-1 space-y-4">
                                <div className="w-20 h-20 bg-background rounded-2xl border border-border flex items-center justify-center mx-auto shadow-lg">
                                    <Zap className="w-10 h-10 text-amber-500" />
                                </div>
                                <p className="font-bold">Automated Action</p>
                                <p className="text-xs text-muted-foreground">Takedowns & Alerts</p>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-border/50 flex justify-between text-left gap-8">
                            <div className="space-y-2 max-w-xs">
                                <h4 className="font-bold flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full" /> Perceptual Hashing</h4>
                                <p className="text-sm text-muted-foreground">We convert visual data into a unique fingerprint that survives resize, crop, and re-encoding.</p>
                            </div>
                            <div className="space-y-2 max-w-xs">
                                <h4 className="font-bold flex items-center gap-2"><div className="w-2 h-2 bg-purple-500 rounded-full" /> Scanning Agents</h4>
                                <p className="text-sm text-muted-foreground">Autonomous agents crawl social media, marketplaces, and tube sites for fingerprint matches.</p>
                            </div>
                            <div className="space-y-2 max-w-xs">
                                <h4 className="font-bold flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full" /> Legal API</h4>
                                <p className="text-sm text-muted-foreground">Integration with platform abuse forms to auto-submit valid DMCA requests instantly.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'market',
            content: (
                <div className="flex flex-col h-full justify-center px-24 max-w-7xl mx-auto">
                    <div className="flex items-center space-x-6 mb-12">
                        <div className="p-4 bg-amber-500/10 rounded-2xl shadow-inner">
                            <TrendingUp className="w-10 h-10 text-amber-500" />
                        </div>
                        <h2 className="text-5xl font-bold tracking-tight">Market Opportunity</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-16">
                        <div className="space-y-8">
                            <div className="flex flex-col space-y-2">
                                <span className="text-6xl font-black text-foreground">$24B</span>
                                <span className="text-xl text-muted-foreground font-medium">Digital Identity Verification Market (2030)</span>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <span className="text-6xl font-black text-foreground">$250B+</span>
                                <span className="text-xl text-muted-foreground font-medium">Creator Economy Valuation</span>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <span className="text-6xl font-black text-primary">50M+</span>
                                <span className="text-xl text-muted-foreground font-medium">Professional Creators</span>
                            </div>
                        </div>

                        <div className="bg-card/30 p-8 rounded-3xl border border-border flex flex-col justify-center space-y-6">
                            <h3 className="text-2xl font-bold mb-4">Target Audience</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/50">
                                    <span className="font-semibold">Tier 1: High Profile</span>
                                    <span className="text-muted-foreground">Influencers, Actors</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/50">
                                    <span className="font-semibold">Tier 2: Enterprise</span>
                                    <span className="text-muted-foreground">Agencies, Talent Mgmt</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/50">
                                    <span className="font-semibold">Tier 3: Prosumer</span>
                                    <span className="text-muted-foreground">OnlyFans, Streamers</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'competition',
            content: (
                <div className="flex flex-col h-full justify-center px-24 max-w-7xl mx-auto">
                    <div className="flex items-center space-x-6 mb-16">
                        <div className="p-4 bg-orange-500/10 rounded-2xl shadow-inner">
                            <Sword className="w-10 h-10 text-orange-500" />
                        </div>
                        <h2 className="text-5xl font-bold tracking-tight">Competition</h2>
                    </div>

                    <div className="relative h-[500px] w-full bg-card/20 rounded-3xl border border-border p-8">
                        {/* Quadrant Chart */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[80%] h-[1px] bg-border/50" />
                            <div className="h-[80%] w-[1px] bg-border/50 absolute" />
                        </div>

                        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-sm font-bold text-muted-foreground uppercase tracking-widest">Technological (Proactive)</div>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-bold text-muted-foreground uppercase tracking-widest">Service-Based (Reactive)</div>
                        <div className="absolute left-8 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-bold text-muted-foreground uppercase tracking-widest">Expensive</div>
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 rotate-90 text-sm font-bold text-muted-foreground uppercase tracking-widest">Accessible</div>

                        {/* Competitors */}
                        <div className="absolute bottom-[20%] left-[20%] bg-background p-3 rounded-lg shadow border border-border text-sm text-muted-foreground">Law Firms</div>
                        <div className="absolute bottom-[30%] left-[30%] bg-background p-3 rounded-lg shadow border border-border text-sm text-muted-foreground">Reputation Agencies</div>
                        <div className="absolute top-[30%] left-[30%] bg-background p-3 rounded-lg shadow border border-border text-sm text-muted-foreground">Enterprise Security</div>

                        {/* Tuppli */}
                        <div className="absolute top-[20%] right-[20%] bg-primary text-primary-foreground p-4 rounded-xl shadow-lg shadow-primary/30 font-bold flex gap-2 items-center animate-bounce duration-[2s]">
                            <ShieldCheck className="w-5 h-5" /> Tuppli
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'business',
            content: (
                <div className="flex flex-col h-full justify-center px-24 max-w-7xl mx-auto">
                    <div className="flex items-center space-x-6 mb-16">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl shadow-inner">
                            <DollarSign className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h2 className="text-5xl font-bold tracking-tight">Business Model</h2>
                    </div>

                    <div className="grid grid-cols-3 gap-8">
                        <div className="p-8 bg-card rounded-3xl border border-border flex flex-col opacity-75 grayscale hover:grayscale-0 transition-all">
                            <h3 className="text-xl font-bold mb-2">Freemium</h3>
                            <div className="text-4xl font-bold mb-6">$0</div>
                            <ul className="space-y-3 text-muted-foreground mb-8 flex-1">
                                <li>• 1 Verified Profile</li>
                                <li>• Basic Monitoring</li>
                                <li>• Manual Reporting</li>
                            </ul>
                            <Button variant="outline" className="w-full">User Acquisition</Button>
                        </div>

                        <div className="p-8 bg-gradient-to-br from-primary/10 to-card rounded-3xl border-2 border-primary/50 flex flex-col relative transform scale-105 shadow-xl">
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">POPULAR</div>
                            <h3 className="text-xl font-bold mb-2 text-primary">Elite</h3>
                            <div className="text-4xl font-bold mb-6">$29<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
                            <ul className="space-y-3 text-foreground mb-8 flex-1">
                                <li className="flex gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> <b>Identity Vault</b></li>
                                <li className="flex gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> <b>Auto-Takedowns</b></li>
                                <li className="flex gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> <b>$25k Insurance</b></li>
                            </ul>
                            <Button className="w-full">Core Revenue</Button>
                        </div>

                        <div className="p-8 bg-card rounded-3xl border border-border flex flex-col">
                            <h3 className="text-xl font-bold mb-2">Agency</h3>
                            <div className="text-4xl font-bold mb-6">Custom</div>
                            <ul className="space-y-3 text-muted-foreground mb-8 flex-1">
                                <li>• Multi-Account Mgmt</li>
                                <li>• API Access</li>
                                <li>• White-label Reports</li>
                            </ul>
                            <Button variant="outline" className="w-full">B2B Scale</Button>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'gtm',
            content: (
                <div className="flex flex-col h-full justify-center px-24 max-w-7xl mx-auto">
                    <div className="flex items-center space-x-6 mb-16">
                        <div className="p-4 bg-pink-500/10 rounded-2xl shadow-inner">
                            <Rocket className="w-10 h-10 text-pink-500" />
                        </div>
                        <h2 className="text-5xl font-bold tracking-tight">Go-To-Market</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <h3 className="text-3xl font-bold">Strategy: "Trust as a Service"</h3>
                            <ul className="space-y-6 text-xl">
                                <li className="p-6 bg-card rounded-2xl border border-border/60">
                                    <span className="font-bold block mb-2 text-primary">1. Creator Verification</span>
                                    <span className="text-muted-foreground">Partner with talent agencies to bulk-onboard top creators, creating a "Verified on Tuppli" network effect.</span>
                                </li>
                                <li className="p-6 bg-card rounded-2xl border border-border/60">
                                    <span className="font-bold block mb-2 text-primary">2. Platform Integration</span>
                                    <span className="text-muted-foreground">API partnerships with OnlyFans, Patreon, and Twitch for instant identity verification.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="relative bg-card/20 rounded-3xl border border-border/50 p-8 flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <div className="text-6xl font-black">Q2 2026</div>
                                <div className="text-2xl text-muted-foreground">Target: 10,000 Users</div>
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-4">
                                    <div className="h-full bg-primary w-1/4 animate-pulse" />
                                </div>
                                <p className="text-sm text-muted-foreground">Current Status: Alpha Launch</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'ask',
            content: (
                <div className="flex flex-col h-full justify-center px-12 max-w-6xl mx-auto text-center">
                    <h2 className="text-6xl font-bold mb-8">The Ask</h2>
                    <p className="text-3xl text-muted-foreground mb-16 max-w-4xl mx-auto font-light leading-normal">
                        We are launching <span className="text-foreground font-semibold">at the end of this month</span>.
                        <br />
                        We need capital to fuel our initial go-to-market.
                    </p>

                    <div className="grid grid-cols-2 gap-10 text-left max-w-3xl mx-auto w-full mb-16">
                        <div className="p-10 bg-card/50 border border-primary/20 rounded-3xl relative overflow-hidden group hover:border-primary/50 transition-colors">
                            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                            <h3 className="text-sm text-primary uppercase tracking-widest font-bold mb-4">Target Raise</h3>
                            <div className="text-5xl font-bold tabular-nums">$150,000</div>
                            <p className="text-base text-muted-foreground mt-4 font-medium">Pre-Seed / Friends & Family</p>
                        </div>

                        <div className="p-10 bg-card/50 border border-primary/20 rounded-3xl relative overflow-hidden group hover:border-primary/50 transition-colors">
                            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                            <h3 className="text-sm text-primary uppercase tracking-widest font-bold mb-4">Use of Funds</h3>
                            <ul className="space-y-4 text-lg font-medium">
                                <li className="flex items-center"><ChevronRight className="w-4 h-4 text-primary mr-2" /> Launch Marketing & Ads</li>
                                <li className="flex items-center"><ChevronRight className="w-4 h-4 text-primary mr-2" /> Infrastructure Costs</li>
                                <li className="flex items-center"><ChevronRight className="w-4 h-4 text-primary mr-2" /> Initial Legal Setup</li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <Button size="lg" className="px-16 py-8 text-2xl rounded-full shadow-2xl shadow-primary/20 hover:scale-105 transition-transform font-bold" onClick={() => window.open('mailto:invest@tuppli.com')}>
                            Join the Mission
                        </Button>
                    </div>
                </div>
            )
        }
    ]

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowRight' || e.key === ' ') nextSlide()
        if (e.key === 'ArrowLeft') prevSlide()
    }

    const handleExport = async () => {
        setIsExporting(true)

        const container = document.getElementById('export-container')
        if (container) {
            container.style.opacity = '1'
            container.style.zIndex = '9999'

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [1920, 1080]
            })

            const slideElements = container.children

            for (let i = 0; i < slideElements.length; i++) {
                const canvas = await html2canvas(slideElements[i] as HTMLElement, {
                    scale: 1,
                    logging: false,
                    useCORS: true,
                    backgroundColor: '#030712' // Ensure dark background for consistency
                })

                const imgData = canvas.toDataURL('image/png')

                if (i > 0) pdf.addPage()
                pdf.addImage(imgData, 'PNG', 0, 0, 1920, 1080)
            }

            pdf.save('Tuppli_Pitch_Deck.pdf')

            container.style.opacity = '0'
            container.style.zIndex = '-1'
        }
        setIsExporting(false)
    }

    const ExportView = () => (
        <div id="export-container" className="fixed top-0 left-0 z-[-1] w-[1920px] pointer-events-none opacity-0">
            {slides.map((slide) => (
                <div key={slide.id} className="w-[1920px] h-[1080px] bg-background relative overflow-hidden flex flex-col items-center justify-center p-16 border-b-8 border-primary text-foreground">
                    <div className="w-full h-full transform scale-[1.3] origin-center flex items-center justify-center">
                        {slide.content}
                    </div>
                </div>
            ))}
        </div>
    )

    return (
        <div
            ref={containerRef}
            className="w-full h-screen bg-background text-foreground flex flex-col relative overflow-hidden outline-none font-sans selection:bg-primary/30"
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] animate-pulse duration-[10s]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] animate-pulse duration-[15s]" />
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <nav className="relative z-10 p-8 flex justify-between items-center bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm">
                <div className="font-bold text-2xl tracking-tight flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <ShieldCheck className="w-5 h-5 text-primary-foreground" />
                    </div>
                    Tuppli <span className="text-muted-foreground/40 font-normal px-2 border-l border-border/50">Investor Deck</span>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="text-sm font-medium text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full backdrop-blur-md border border-border/50">
                        Slide {currentSlide + 1} of {slides.length}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting} className="gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary">
                        {isExporting ? (
                            <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Exporting...</span>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                Export PDF
                            </>
                        )}
                    </Button>
                </div>
            </nav>

            <div className="flex-1 relative z-10 flex items-center justify-center overflow-hidden w-full h-full" ref={deckRef}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full h-full absolute inset-0"
                    >
                        {slides[currentSlide].content}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="relative z-10 p-10 flex justify-between items-center">
                <Button variant="ghost" size="lg" onClick={prevSlide} disabled={currentSlide === 0} className="text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-6 h-6 mr-2" /> Previous
                </Button>

                <div className="flex space-x-3">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'bg-primary w-12 shadow-[0_0_15px_rgba(var(--primary),0.5)]' : 'bg-primary/20 w-3 hover:bg-primary/40 hover:w-6'}`}
                        />
                    ))}
                </div>

                <Button variant="ghost" size="lg" onClick={nextSlide} disabled={currentSlide === slides.length - 1} className="text-muted-foreground hover:text-foreground">
                    Next <ChevronRight className="w-6 h-6 ml-2" />
                </Button>
            </div>

            {/* Hidden Export View */}
            <ExportView />
        </div>
    )
}
