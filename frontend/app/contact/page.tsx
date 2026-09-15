import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Mail, MessageSquare } from 'lucide-react'

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#061324] text-white selection:bg-[#9FEAE0] selection:text-[#0A111F]">
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

            <main className="max-w-4xl mx-auto px-6 pt-40 pb-20 text-center">
                <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-8">
                    Get in <span className="italic font-serif text-[#9FEAE0]">touch.</span>
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light mb-16">
                    Whether you're facing an active leak, need enterprise API access, or just want to chat about content security, our experts are ready.
                </p>

                <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                    <a href="mailto:support@tuppli.com" className="bg-[#0A111F] p-8 rounded-3xl border border-white/5 hover:border-[#9FEAE0]/30 transition-all group shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-[#9FEAE0]/10 flex items-center justify-center text-[#9FEAE0] mb-6 group-hover:scale-110 transition-transform">
                            <Mail className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">Email Support</h3>
                        <p className="text-slate-400 mb-4">support@tuppli.com</p>
                        <span className="text-sm text-[#9FEAE0] font-semibold">Average response: 2 hours &rarr;</span>
                    </a>

                    <a href="https://twitter.com/tuppli" target="_blank" rel="noreferrer" className="bg-[#0A111F] p-8 rounded-3xl border border-white/5 hover:border-[#9FEAE0]/30 transition-all group shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-[#9FEAE0]/10 flex items-center justify-center text-[#9FEAE0] mb-6 group-hover:scale-110 transition-transform">
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">Sales & Press</h3>
                        <p className="text-slate-400 mb-4">DM us on Twitter</p>
                        <span className="text-sm text-[#9FEAE0] font-semibold">@tuppli &rarr;</span>
                    </a>
                </div>
            </main>
        </div>
    )
}
