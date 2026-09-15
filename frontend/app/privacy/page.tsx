import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
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
                        Privacy <span className="italic font-serif text-[#9FEAE0]">Policy.</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-light">Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="space-y-12 text-slate-300 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Data We Collect</h2>
                        <p className="mb-4">Tuppli is a forensic security platform. We collect only the data necessary to protect your intellectual property and execute revenue recovery missions:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-400">
                            <li><strong className="text-white">Authentication Data:</strong> We use Google and X (Twitter) OAuth. We only collect your email address and basic profile info to create your secure vault. We never see your social media passwords.</li>
                            <li><strong className="text-white">Forensic Assets:</strong> Fingerprints of the content you protect. We store perceptual hashes, not the original files, to ensure your privacy.</li>
                            <li><strong className="text-white">Enforcement Intelligence:</strong> We collect URLs of infringing content to facilitate de-indexing and takedowns via the Google Search Console API and other legal gateways.</li>
                        </ul>
                    </section>

                    <section className="bg-[#0A111F] p-8 rounded-3xl border border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                        <h2 className="text-xl font-medium text-[#9FEAE0] mb-3">Google API Disclosure</h2>
                        <p className="text-sm">
                            Tuppli's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes" className="text-blue-400 hover:underline">Google API Service User Data Policy</a>, including the Limited Use requirements. We use your data solely for mission-based suppression and never for advertising.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Data</h2>
                        <p className="mb-4">Your data is used exclusively for:</p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-400">
                            <li>Verifying your identity during secure login.</li>
                            <li>Executing automated DMCA takedowns and search engine de-indexing.</li>
                            <li>Generating "Certificates of Suppression" as proof of enforcement for your legal records or managers.</li>
                            <li>Recovering lost revenue by eliminating pirate competition.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">3. Data Retention and Deletion</h2>
                        <p>
                            You have the right to be forgotten. If you delete your Tuppli account, all forensic hashes, mission logs, and OAuth tokens are permanently purged within 72 hours.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    )
}
