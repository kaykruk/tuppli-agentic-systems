import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
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

            <main className="max-w-3xl mx-auto px-6 pt-40 pb-20">
                <div className="mb-16">
                    <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-6">
                        Terms of <span className="italic font-serif text-[#9FEAE0]">Service.</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-light">Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="space-y-12 text-slate-300 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using Tuppli's platform, APIs, or enforcement engines, you enter into a legally binding contract. If you are accepting these terms on behalf of an agency or corporate entity, you represent that you have the authority to bind that entity to these Terms. If you disagree with any part of the terms, you must not access the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
                        <p className="mb-4">Tuppli is an autonomous forensic content protection and revenue recovery engine. Our services ("Services") include, but are not limited to:</p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-400">
                            <li>Perceptual hashing and digital forensic fingerprinting.</li>
                            <li>Automated issuance of DMCA 512(c) takedown notices.</li>
                            <li>Programmatic de-indexing of infringing content via the Google Search Console (GSC) API and other search engine interfaces.</li>
                            <li>Generation of mission-based "Certificates of Suppression" for global revenue recovery.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">3. Legal Authorization</h2>
                        <p>
                            By submitting content to Tuppli, you electronically authorize Tuppli to act as your authorized legal agent ("Agent") for the sole purpose of submitting Digital Millennium Copyright Act (DMCA) notices, search engine de-indexing requests (including via GSC), and related intellectual property claims.
                        </p>
                        <p className="mt-4 font-semibold text-[#9FEAE0]">
                            Authorized Agent Status: You specifically grant Tuppli the right to represent you in communications with third-party hosting providers and search engines to suppress unauthorized content distribution.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Intellectual Property</h2>
                        <p>
                            You retain 100% of all rights, titles, and interests to your original content. Tuppli claims zero ownership. By using the platform, you grant us a temporary, algorithmic license solely to parse, hash, and represent your media mathematically to execute the Services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Refund Policy & SLA</h2>
                        <p>
                            Protecting content requires vast compute resources. Therefore, all sales are final upon account activation. We offer refunds only under specific conditions: if our automated scanning engine fails to detect surface web links identical to your hashed reference material within the first 14 days of activation. Escalar manual investigations are non-refundable. Contact support@tuppli.com for SLA appeals.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    )
}
