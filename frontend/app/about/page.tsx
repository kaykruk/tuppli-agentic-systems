import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#061324] text-white selection:bg-[#9FEAE0] selection:text-[#0A111F]">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#061324]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                        <span className="text-sm text-slate-400 group-hover:text-white transition-colors">Back</span>
                    </Link>
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative w-8 h-8">
                            <Image src="/logo.png" alt="Tuppli Logo" fill className="object-contain" />
                        </div>
                        <span className="text-xl font-bold text-white">Tuppli</span>
                    </Link>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 pt-40 pb-20">
                <div className="text-center mb-20">
                    <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-8">
                        We build agents that <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9FEAE0] to-white text-glow">work.</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                        Tuppli started with a belief: autonomous AI agents will reshape every industry, but only if they can be trusted in production. We build the systems and the reliability layer that makes that possible.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 mt-16">
                    <div className="bg-[#0A111F] p-10 rounded-3xl border border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                        <h2 className="text-2xl font-medium mb-4 text-[#9FEAE0]">Our Mission</h2>
                        <p className="text-slate-400 leading-relaxed">
                            To make AI agents production-safe, observable, and accountable. We pioneered Agent Reliability Engineering (ARE) — the discipline of ensuring that autonomous AI systems don&apos;t just demo well, but survive the chaos of real-world deployment.
                        </p>
                    </div>
                    <div className="bg-[#0A111F] p-10 rounded-3xl border border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                        <h2 className="text-2xl font-medium mb-4 text-[#9FEAE0]">The Team</h2>
                        <p className="text-slate-400 leading-relaxed">
                            We are systems engineers, AI builders, and reliability practitioners who have shipped autonomous agents into production and learned what breaks. We build the tooling and practices that prevent those failures from reaching your users.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
