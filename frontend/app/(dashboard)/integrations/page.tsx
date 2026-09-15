'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

export default function IntegrationsPage() {
    const [copied, setCopied] = useState(false)
    const apiKey = 'tp_live_8823_xh29_9912_ll31'

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight uppercase">
                        Integrations
                    </h1>
                    <p className="text-slate-500 text-lg font-medium mt-1">
                        Connect your forensic data to your own ecosystem.
                    </p>
                    <div className="h-px w-32 bg-gradient-to-r from-indigo-600/50 to-transparent mt-4" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* API Access Card */}
                <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                        <CardTitle className="text-slate-900 text-[10px] font-black uppercase tracking-[0.2em]">
                            Connect Cluster
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">
                            Your personal Tuppli authentication token. Use this to authorize server-side requests to the Forensic Engine.
                        </p>
                        
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                            <code className="text-xs font-mono text-slate-600 truncate mr-4">
                                {apiKey}
                            </code>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleCopy}
                                className="text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status: Active</span>
                            <Button variant="outline" className="text-[10px] h-8 rounded-full font-black uppercase tracking-widest border-slate-200 hover:bg-slate-50">
                                Rotate Key
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Developer Resources Card */}
                <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                        <CardTitle className="text-slate-900 text-[10px] font-black uppercase tracking-[0.2em]">
                            Developer Hub
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-2">
                        {[
                            { title: 'API Documentation', desc: 'Full endpoint reference.' },
                            { title: 'SDK Libraries', desc: 'Python, Node.js, and Go.' },
                            { title: 'Webhooks', desc: 'Real-time leak alerts.' },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                                        {item.title}
                                    </h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Start Guide */}
            <Card className="bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl">
                <CardContent className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1">
                            <h3 className="text-2xl font-black mb-4 tracking-tight uppercase">Quick Implementation</h3>
                            <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                                Our API was built for speed. Integrate automated de-indexing and forensic watermarking into your existing system in less than 50 lines of code.
                            </p>
                            <Button className="bg-white text-slate-900 hover:bg-slate-100 h-12 px-8 rounded-xl font-bold text-xs uppercase tracking-widest">
                                Read the Quickstart
                            </Button>
                        </div>
                        <div className="w-full md:flex-1 bg-black/40 rounded-2xl p-6 font-mono text-[11px] border border-white/5 overflow-x-auto">
                            <div className="space-y-2">
                                <p className="text-emerald-400"># Install the Tuppli CLI</p>
                                <p className="text-slate-300">npm install -g @tuppli/engine</p>
                                <p className="text-slate-300 italic opacity-50"><br/></p>
                                <p className="text-emerald-400"># Authenticate your terminal</p>
                                <p className="text-slate-300">tuppli auth --token tp_live_****</p>
                                <p className="text-slate-300 italic opacity-50"><br/></p>
                                <p className="text-emerald-400"># Initiate forensic audit of all assets</p>
                                <p className="text-slate-300">tuppli scan --all --forensics</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
