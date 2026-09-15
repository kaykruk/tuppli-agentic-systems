import { Terminal, Book, Code, Globe, Shield, Scale, Copy, ChevronRight, Zap, Info, Lock, Target, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DevelopersPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in mt-2 fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section */}
            <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100 mb-2 shadow-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Connect v1.0 Live</span>
                </div>
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase">
                    Forensic <span className="text-blue-600">Connectivity</span>
                </h1>
                <p className="text-slate-500 text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                    Integrate Tuppli's absolute truth engine into your law firm's workflow, case management suite, or private monitoring nodes.
                </p>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'API Reference', desc: 'Forensic endpoint specifications and response schemas.', icon: Terminal, color: 'text-blue-600', bg: 'bg-blue-50', hover: 'hover:border-blue-300' },
                    { title: 'Security & Auth', desc: 'Managing your X-Tuppli-Key credentials.', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50', hover: 'hover:border-emerald-300' },
                    { title: 'Legal Workflows', desc: 'Automating enforcement and evidence audit logs.', icon: Scale, color: 'text-indigo-600', bg: 'bg-indigo-50', hover: 'hover:border-indigo-300' },
                ].map((item, i) => (
                    <Card key={i} className={`bg-white border-slate-200 transition-all group cursor-pointer rounded-3xl shadow-sm ${item.hover}`}>
                        <CardHeader className="p-8">
                            <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-6 border border-transparent group-hover:scale-110 transition-transform`}>
                                <item.icon className={`w-7 h-7 ${item.color}`} />
                            </div>
                            <CardTitle className="text-slate-900 font-black tracking-tight text-xl">{item.title}</CardTitle>
                            <CardDescription className="font-medium text-slate-500 mt-2">{item.desc}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            {/* Content Section: Authentication */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-200">
                        <Lock className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Authentication Protocol</h2>
                </div>
                <Card className="bg-white border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-10 space-y-6">
                        <p className="text-slate-500 leading-relaxed font-medium text-lg">
                            To maintain forensic integrity, all requests must be signed with a valid <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded-lg font-bold">X-Tuppli-Key</code>.
                        </p>
                        <div className="bg-slate-900 rounded-[2rem] p-8 font-mono text-sm group relative shadow-2xl border-t-4 border-t-blue-500">
                            <div className="text-slate-500 mb-4 font-bold uppercase tracking-widest text-[10px]"># Initialize SDK</div>
                            <div className="text-blue-200 text-base leading-relaxed">
                                curl -X GET "https://api.tuppli.com/v1/discoveries" \<br />
                                &nbsp;&nbsp;-H "<span className="text-blue-400">X-Tuppli-Key</span>: <span className="text-emerald-400 italic">tp_forensic_key_xxx</span>"
                            </div>
                            <Button variant="ghost" size="icon" className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                                <Copy className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Content Section: Discoveries */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                        <Globe className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Retrieving Discoveries</h2>
                </div>
                <Card className="bg-white border-slate-200 overflow-hidden rounded-[2.5rem] shadow-sm">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-mono text-emerald-600 flex items-center gap-4">
                                <span className="bg-emerald-600 text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">GET</span>
                                <span className="text-slate-900 font-black">/v1/discoveries</span>
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 space-y-10">
                        <p className="text-slate-500 text-lg font-medium">
                            Returns a comprehensive list of all verified forensic matches found across surface, social, and shadow networks.
                        </p>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hydrated Response Fields</h4>
                                <ul className="space-y-4">
                                    {[
                                        { name: 'discovery_id', desc: 'The unique forensic identifier for this specific node match.' },
                                        { name: 'origin_hub', desc: 'The verified platform source (Telegram, Discord, Market).' },
                                        { name: 'match_confidence', desc: 'DNA similarity score against your original catalog asset.' },
                                        { name: 'enforcement_stage', desc: 'Current legal state: Dispatched, Neutralized, or Verified.' },
                                    ].map((f, i) => (
                                        <li key={i} className="flex items-start gap-4">
                                            <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                                                <ChevronRight className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <div>
                                                <div className="text-slate-900 font-bold text-sm tracking-tight">{f.name}</div>
                                                <div className="text-slate-400 text-[11px] font-bold mt-1 uppercase tracking-wider">{f.desc}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-slate-50 rounded-[2.5rem] p-10 font-mono text-xs text-slate-600 leading-relaxed border border-slate-100 shadow-inner">
                                <pre>{`{
  "object": "list",
  "count": 1,
  "node_id": "tp_node_992",
  "discoveries": [
    {
      "discovery_id": "ev_882jK",
      "asset_identity": "Main Stage Master",
      "origin_hub": "Telegram",
      "match_confidence": 98.4,
      "enforcement_stage": "Neutralized"
    }
  ]
}`}</pre>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Enforcement Guide Section */}
            <div className="bg-blue-600 shadow-2xl shadow-blue-200 rounded-[3rem] p-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                    <Scale className="w-48 h-48 text-white" />
                </div>
                <div className="relative space-y-8 max-w-2xl">
                    <div className="flex items-center gap-3 text-white/80">
                        <Zap className="w-6 h-6 fill-white" />
                        <span className="text-xs font-black uppercase tracking-widest">Lethal Infrastructure</span>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tight uppercase">Headless Takedown Engine</h2>
                    <p className="text-blue-50 text-xl font-medium leading-relaxed">
                        Trigger enforcement actions directly from your case management suite. No dashboard required. POST to <code className="text-white bg-blue-700/50 px-3 py-1 rounded-xl font-bold">/v1/enforce</code> and Tuppli does the rest.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                        <Button className="bg-white text-blue-600 hover:bg-blue-50 h-auto py-5 px-10 text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all">
                            Explore Specs
                        </Button>
                        <Button variant="ghost" className="text-white hover:text-blue-100 font-black text-xs uppercase tracking-widest px-0">
                            Download Legal Metadata Template <ExternalLink className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Final Callout */}
            <div className="text-center py-16">
                <p className="text-slate-400 font-bold italic mb-6 uppercase tracking-widest text-[10px]">
                    Enterprise connectivity requiring custom VPC peering? <a href="mailto:support@tuppli.com" className="text-blue-600 hover:underline">Secure an Engineer Call</a>.
                </p>
            </div>
        </div>
    )
}
