'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
    Check, ArrowRight, Mail, Cpu, Shield, Eye, Zap, BarChart3, Code2, Bot, AlertTriangle, Activity, Layers
} from 'lucide-react'

export default function LandingClient() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const services = [
        {
            name: 'Build',
            price: 'Custom',
            period: '',
            description: 'We design and build production-grade agentic AI systems tailored to your business workflows.',
            popular: false,
            badge: '',
            features: [
                'Multi-Agent Orchestration',
                'Tool-Use Pipeline Design',
                'Autonomous Workflow Automation',
                'LLM Selection & Fine-Tuning Strategy',
                'Production Deployment & Handoff',
                'Agent Evaluation Suite',
                'Architecture Documentation',
            ],
            cta: 'Start a Project',
        },
        {
            name: 'Reliability',
            price: 'Custom',
            period: '',
            description: 'Agent Reliability Engineering. We make your AI agents production-safe, observable, and accountable.',
            popular: true,
            badge: 'MOST REQUESTED',
            badgeColor: 'bg-black text-white',
            features: [
                'Agent Observability & Tracing',
                'Guardrail Design & Implementation',
                'Failure Recovery Automation',
                'Production Evaluation Pipelines',
                'Silent Drift Detection',
                'Context Poisoning Prevention',
                'Cost & Latency Optimization',
                'Incident Response Playbooks',
            ],
            cta: 'Get Reliable Agents',
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            description: 'Full-stack agentic AI partnership. We embed with your team and own the agent reliability layer.',
            popular: false,
            badge: 'PARTNERSHIP',
            badgeColor: 'bg-slate-200 text-slate-800',
            features: [
                'Everything in Build + Reliability',
                'Dedicated Agent Reliability Engineer',
                'Ongoing Monitoring & Optimization',
                'Custom Agent Tooling',
                'Team Training & Enablement',
                'SLA-Backed Agent Uptime',
            ],
            cta: 'Contact Us',
        },
    ]

    return (
        <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-blue-600 selection:text-white font-sans">
            {/* Minimal Ambient Background */}
            <div className="fixed inset-0 pointer-events-none opacity-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-white" />

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200/50 py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-7 h-7 group-hover:scale-110 transition-transform">
                            <Image src="/logo.png" alt="Tuppli" fill className="object-contain" priority />
                        </div>
                        <span className="text-xl font-black tracking-tight uppercase">Tuppli</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
                        <Link href="/about" className="hover:text-black transition-colors">About Us</Link>
                        <a href="#capabilities" className="hover:text-black transition-colors">Capabilities</a>
                        <a href="#services" className="hover:text-black transition-colors">Services</a>
                        <Link href="/contact" className="px-6 py-2.5 bg-slate-900 text-white rounded-full hover:bg-black transition-all shadow-lg shadow-slate-200 uppercase text-[10px] font-black tracking-widest">
                            Talk to Us
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-24 px-6 overflow-hidden">
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.9] text-slate-900 uppercase">
                            AI agents that<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                survive production.
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium tracking-tight"
                    >
                        We build agentic AI systems and pioneered Agent Reliability Engineering — the discipline of making autonomous AI agents observable, safe, and accountable.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
                    >
                        <Link href="/contact" className="group relative px-12 py-6 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest transition-all hover:scale-105 hover:bg-black shadow-2xl shadow-slate-300 flex items-center gap-4">
                            Start a Project
                            <ArrowRight className="inline-block ml-1 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </Link>
                        <a href="#capabilities" className="group px-12 py-6 text-slate-500 font-black text-xs uppercase tracking-widest transition-all hover:text-slate-900 flex items-center gap-4">
                            See Our Work
                            <ArrowRight className="inline-block ml-1 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Agent Reliability Signal Strip */}
            <section className="py-12 px-6 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: 'ARE', label: 'Agent Reliability Engineering' },
                            { value: '99.9%', label: 'Agent Uptime Target' },
                            { value: '<200ms', label: 'Decision Trace Latency' },
                            { value: '24/7', label: 'Agent Monitoring' },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900">{stat.value}</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Capabilities Bento Grid */}
            <section id="capabilities" className="py-24 px-6 relative z-10 bg-slate-50 mt-12 mb-12 rounded-[4rem] mx-4 max-w-screen-2xl 2xl:mx-auto border border-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-20 md:text-center">
                        <h2 className="text-xs font-black tracking-[0.2em] text-brand-blue uppercase mb-5">What We Build</h2>
                        <h3 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter text-slate-900 uppercase">Agentic systems that don&apos;t break.</h3>
                        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">Most AI agents demo well. Few survive production. We engineer the systems, guardrails, and observability that close the gap.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-6 h-auto">
                        {/* Large Card: Multi-Agent Orchestration */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="bg-white md:col-span-4 p-12 rounded-[3rem] flex flex-col justify-between relative overflow-hidden group border border-slate-200 shadow-xl shadow-slate-200/50"
                        >
                            <div className="grid grid-cols-1 gap-12 h-full relative z-10">
                                <div className="flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <Layers className="w-6 h-6 text-blue-600" />
                                            <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Multi-Agent Systems</h3>
                                        </div>
                                        <p className="text-slate-500 text-lg font-medium leading-relaxed">We design and deploy multi-agent architectures where autonomous agents coordinate, delegate, and recover from failures — without human intervention.</p>
                                    </div>
                                    
                                    <div className="mt-10 space-y-4 border-t border-slate-100 pt-10">
                                        {[
                                            { label: 'Agent Orchestration', status: 'Active', color: 'text-emerald-600' },
                                            { label: 'Decision Tracing', status: 'Recording', color: 'text-emerald-600' },
                                            { label: 'Guardrail Check', status: 'Passing', color: 'text-brand-blue' },
                                            { label: 'System Status', status: 'OPERATIONAL', color: 'text-slate-900' },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-slate-400">{item.label}</span>
                                                </div>
                                                <span className={`${item.color}`}>{item.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="bg-slate-900 md:col-span-2 p-10 rounded-[3rem] relative overflow-hidden group shadow-2xl shadow-slate-300 border-t-4 border-t-emerald-500"
                        >
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <Activity className="w-5 h-5 text-emerald-400" />
                                        <h3 className="text-2xl font-black text-white tracking-tight uppercase">Agent Observability</h3>
                                    </div>
                                    <p className="text-slate-400 font-medium text-sm leading-relaxed">Full decision-chain tracing for every agent action. Know exactly why your agent made each decision, in real-time.</p>
                                </div>
                                <div className="mt-6 flex items-end gap-3">
                                    <div className="text-4xl font-black text-emerald-400 tracking-tighter">100%</div>
                                    <div className="text-[10px] font-black text-white/50 mb-2 uppercase tracking-widest">Traceable</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="bg-white md:col-span-2 p-10 rounded-[3rem] flex flex-col justify-between relative overflow-hidden group border border-slate-200 shadow-xl shadow-slate-200/50"
                        >
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <Shield className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Guardrail Engineering</h3>
                                </div>
                                <p className="text-slate-500 font-medium text-xs leading-relaxed">Safety constraints that protect without killing autonomy. We design guardrails that are robust against prompt injection, tool abuse, and context poisoning.</p>
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-lg shadow-slate-100 hover:border-blue-300 transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Failure Recovery</h3>
                            </div>
                            <p className="text-slate-500 font-medium text-xs leading-relaxed uppercase tracking-wider">Automated failure detection and self-healing patterns. Your agents recover gracefully from API outages, rate limits, and hallucination events.</p>
                        </div>
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-lg shadow-slate-100 hover:border-indigo-300 transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <BarChart3 className="w-5 h-5 text-indigo-500" />
                                <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Production Evals</h3>
                            </div>
                            <p className="text-slate-500 font-medium text-xs leading-relaxed uppercase tracking-wider">Evaluation pipelines that test what production actually throws at your agents — not sanitized benchmark datasets.</p>
                        </div>
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-lg shadow-slate-100 hover:border-emerald-300 transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <Zap className="w-5 h-5 text-emerald-500" />
                                <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Tool-Use Pipelines</h3>
                            </div>
                            <p className="text-slate-500 font-medium text-xs leading-relaxed uppercase tracking-wider">Reliable tool orchestration with rate limiting, retry logic, cost tracking, and safety boundaries built into every call.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Agent Reliability Engineering Section */}
            <section className="py-32 px-6 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="md:text-center mb-20">
                        <h2 className="text-xs font-black tracking-[0.2em] text-blue-600 uppercase mb-5">Agent Reliability Engineering</h2>
                        <h3 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter text-slate-900 uppercase">
                            SRE for the<br />agent era.
                        </h3>
                        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                            Agent Reliability Engineering (ARE) is the practice of building observable, safe, and accountable AI agent systems. We coined it. We practice it. We can teach your team.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            {
                                icon: Eye,
                                title: 'Observability',
                                description: 'Every agent decision traced end-to-end. Know why your agent chose action A over action B, which tools it called, what context it used, and where it deviated from expected behavior.',
                            },
                            {
                                icon: Shield,
                                title: 'Guardrails',
                                description: 'Safety without rigidity. We design constraint systems that catch dangerous behavior — prompt injection, tool abuse, PII leakage — without making your agents useless.',
                            },
                            {
                                icon: Cpu,
                                title: 'Failure Recovery',
                                description: 'Agents fail. The question is whether they fail gracefully. We build self-healing patterns, circuit breakers, and escalation paths so failures don\'t cascade.',
                            },
                            {
                                icon: BarChart3,
                                title: 'Production Evaluation',
                                description: 'Evals that reflect reality, not benchmarks. We build continuous evaluation pipelines that test your agents against real production traffic and edge cases.',
                            },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 hover:border-blue-200 transition-all group"
                            >
                                <item.icon className="w-8 h-8 text-blue-600 mb-6 group-hover:scale-110 transition-transform" />
                                <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-4">{item.title}</h4>
                                <p className="text-slate-500 font-medium leading-relaxed">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-32 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-xs font-black tracking-[0.3em] text-blue-600 uppercase mb-5">Services</h2>
                        <h3 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter text-slate-900 uppercase">How we work with you.</h3>
                        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed tracking-tight">Every engagement is scoped to your exact problem. No templates. No boilerplate. Just production-grade agent systems.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {services.map((tier) => (
                            <div
                                key={tier.name}
                                className={`relative bg-white rounded-[3rem] p-10 flex flex-col transition-all overflow-hidden ${tier.popular ? 'border-4 border-slate-900 shadow-2xl scale-[1.02]' : 'border border-slate-200 shadow-xl'
                                    }`}
                            >
                                {tier.popular && (
                                    <div className="absolute top-0 right-0 bg-blue-600 text-white px-6 py-2 rounded-bl-3xl text-[10px] font-black tracking-widest uppercase">
                                        Most Requested
                                    </div>
                                )}
                                
                                <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight uppercase">{tier.name}</h3>
                                <p className="text-slate-400 text-sm mb-10 font-medium leading-relaxed">{tier.description}</p>
                                
                                <div className="mb-10 flex items-end">
                                    <span className="text-5xl font-black text-slate-900 tracking-tighter">
                                        Custom
                                    </span>
                                    <span className="text-slate-400 text-xs ml-2 mb-2 font-black uppercase tracking-widest">
                                        per project
                                    </span>
                                </div>

                                <Link
                                    href="/contact"
                                    className={`w-full py-5 mb-10 rounded-[2rem] text-center font-black text-[10px] uppercase tracking-widest transition-all block ${tier.popular
                                        ? 'bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-200'
                                        : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200'
                                        }`}
                                >
                                    {tier.cta}
                                </Link>
                                
                                <ul className="space-y-4 flex-1">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom CTA Overlay */}
            <section className="py-32 px-6 relative overflow-hidden bg-slate-900 mt-24 mb-12 rounded-[4rem] mx-4 max-w-screen-2xl 2xl:mx-auto shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-10 blur-3xl bg-blue-500 rounded-full" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter text-white uppercase leading-[0.9]">
                        Your agents deserve<br />
                        <span className="italic font-serif lowercase tracking-normal text-blue-400">reliability.</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-slate-400 mb-12 font-medium tracking-tight">
                        Let&apos;s build agentic AI systems that your team can trust in production.
                    </p>

                    <div className="flex justify-center">
                        <Link href="/contact" className="group px-12 py-6 bg-white text-slate-900 font-black rounded-full hover:scale-105 transition-all shadow-2xl uppercase text-xs tracking-widest flex items-center gap-4">
                            Start a Conversation <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="pt-24 pb-12 px-10 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-20 mb-20">
                    <div className="max-w-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <img src="/logo.png" alt="Tuppli" className="w-8 h-8" />
                            <span className="text-2xl font-black tracking-tight text-slate-900 uppercase">Tuppli</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">
                            Agentic AI systems and Agent Reliability Engineering. We build autonomous AI agents that survive production and make them observable, safe, and accountable.
                        </p>
                        <div className="flex gap-6">
                            <a href="mailto:hello@tuppli.com" className="text-slate-400 hover:text-black transition-colors"><Mail className="w-5 h-5" /></a>
                            <a href="https://www.linkedin.com/company/tuppli" target="_blank" className="text-slate-400 hover:text-black transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
                        <div className="space-y-6">
                            <h4 className="text-slate-900 text-[10px] font-black uppercase tracking-widest">Services</h4>
                            <ul className="space-y-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <li><a href="#capabilities" className="hover:text-black transition-colors">Agentic AI Systems</a></li>
                                <li><a href="#services" className="hover:text-black transition-colors">Agent Reliability</a></li>
                                <li><Link href="/contact" className="hover:text-black transition-colors">Consulting</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-slate-900 text-[10px] font-black uppercase tracking-widest">Company</h4>
                            <ul className="space-y-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <li><Link href="/about" className="hover:text-black transition-colors">About</Link></li>
                                <li><Link href="/blogs" className="hover:text-black transition-colors">Labs</Link></li>
                                <li><Link href="/contact" className="hover:text-black transition-colors">Contact</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-slate-900 text-[10px] font-black uppercase tracking-widest">Legal</h4>
                            <ul className="space-y-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <li><Link href="/terms" className="hover:text-black transition-colors">Terms</Link></li>
                                <li><Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link></li>
                                <li><a href="mailto:hello@tuppli.com" className="hover:text-black transition-colors">Legal</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    <p>© {new Date().getFullYear()} Tuppli Technologies. Agentic AI Systems & Agent Reliability Engineering.</p>
                    <div className="flex gap-10">
                        <span>London</span>
                        <span>Remote</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
