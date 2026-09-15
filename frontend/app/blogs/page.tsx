import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight } from 'lucide-react'

const BLOG_POSTS = [
    {
        id: 1,
        title: "The Anatomy of a Content Leak",
        date: "March 12, 2026",
        category: "Threat Intel",
        excerpt: "How threat actors bypass paywalls and distribute premium content via hidden Telegram channels and Tor nodes."
    },
    {
        id: 2,
        title: "Why Traditional DMCA is Dead",
        date: "February 28, 2026",
        category: "Legal Auth",
        excerpt: "Polite emails don't work anymore. Why automated, legally-binding escalation is the only way to enforce IP rights in 2026."
    },
    {
        id: 3,
        title: "Perceptual Hashing 101",
        date: "February 15, 2026",
        category: "Engineering",
        excerpt: "How our neural hashes track the original pixel DNA of your images, even if pirates crop, filter, or blur the watermark."
    }
]

export default function BlogsPage() {
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

            <main className="max-w-5xl mx-auto px-6 pt-40 pb-20">
                <div className="mb-16">
                    <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-6">
                        Latest <span className="italic font-serif text-[#9FEAE0]">Intel.</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-light">Thoughts on content security, deep web intelligence, and creator rights.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {BLOG_POSTS.map(post => (
                        <Link href={`/blogs/${post.id}`} key={post.id} className="bg-[#0A111F] border border-white/5 rounded-3xl p-8 hover:border-[#9FEAE0]/30 transition-all flex flex-col justify-between group shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-xs font-bold text-[#9FEAE0] uppercase tracking-wider bg-[#9FEAE0]/10 px-3 py-1 rounded-full">{post.category}</span>
                                    <span className="text-sm text-slate-500">{post.date}</span>
                                </div>
                                <h2 className="text-2xl font-medium mb-4 group-hover:text-[#9FEAE0] transition-colors">{post.title}</h2>
                                <p className="text-slate-400 text-sm leading-relaxed mb-8">{post.excerpt}</p>
                            </div>
                            <div className="flex items-center gap-2 text-white font-medium text-sm group-hover:translate-x-2 transition-transform">
                                Read Article <ArrowRight className="w-4 h-4" />
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    )
}
