'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
    Brain, Globe, Moon, Users, ShoppingBag, MessageSquare, AlertTriangle, 
    Sparkles, Loader2, Radar, Shield, Target, Eye, ExternalLink, RefreshCw,
    BarChart3, Fingerprint, Search, Send, Hash, Zap
} from 'lucide-react'
import { useState, useTransition } from 'react'
import { analyzeIntelligenceItem, bulkAnalyzeIntelligence } from '../actions'
import type { IntelligenceData } from '../actions'

const typeConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    surface_web: { icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', label: 'Surface Scan' },
    dark_web: { icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', label: 'Deep Web' },
    social_media: { icon: Users, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-100', label: 'Social Audit' },
    forum: { icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', label: 'Forum Hunt' },
    marketplace: { icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100', label: 'Asset Sale' },
    telegram: { icon: Send, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100', label: 'Telegram Node' },
    discord: { icon: Hash, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', label: 'Discord Intel' },
    other: { icon: Brain, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-100', label: 'Intel Node' },
}

const threatColors: Record<string, { color: string, bg: string, border: string, level: number }> = {
    none: { color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100', level: 0 },
    low: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', level: 25 },
    medium: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', level: 50 },
    high: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', level: 75 },
    critical: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', level: 100 },
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

interface IntelligenceClientProps {
    initialData: IntelligenceData[]
}

export function IntelligenceClient({ initialData }: IntelligenceClientProps) {
    const [items, setItems] = useState(initialData)
    const [analyzingId, setAnalyzingId] = useState<string | null>(null)
    const [isBulkAnalyzing, startBulkTransition] = useTransition()

    const handleAnalyze = async (id: string) => {
        setAnalyzingId(id)
        const result = await analyzeIntelligenceItem(id)
        if (result.success && result.analysis) {
            setItems(prev =>
                prev.map(item =>
                    item.id === id
                        ? { 
                            ...item, 
                            ai_summary: result.analysis!.summary, 
                            threat_level: result.analysis!.threat_level as IntelligenceData['threat_level'] 
                          }
                        : item
                )
            )
        }
        setAnalyzingId(null)
    }

    const handleBulkAnalyze = () => {
        startBulkTransition(async () => {
            const result = await bulkAnalyzeIntelligence()
            if (result.success && result.analyzed > 0) {
                window.location.reload()
            }
        })
    }

    const unanalyzedCount = items.filter(i => !i.ai_summary).length
    
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Recon Hub Status */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2 flex items-center gap-3 tracking-tight">
                        <Radar className="w-10 h-10 text-indigo-600" />
                        Reconnaissance Hub
                    </h1>
                    <p className="text-slate-500 text-lg font-medium">
                        Real-time intelligence gathered from global surface and deep web patrolling.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm rounded-xl px-6 h-12 font-bold text-sm">
                        <Search className="w-4 h-4 mr-2" />
                        Refine Search
                    </Button>
                    {unanalyzedCount > 0 && (
                        <Button
                            onClick={handleBulkAnalyze}
                            disabled={isBulkAnalyzing}
                            className="bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-900/10 rounded-xl px-6 h-12 font-bold text-sm"
                        >
                            {isBulkAnalyzing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4 mr-2" />
                            )}
                            Decode All Signal ({unanalyzedCount})
                        </Button>
                    )}
                </div>
            </div>

            {/* Live Monitoring Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 border-b border-slate-50 bg-slate-50/50">
                        <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Fleet Scan</CardTitle>
                        <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin-slow" />
                    </CardHeader>
                    <CardContent className="p-5">
                        <div className="space-y-3">
                            {[
                                { label: 'Surface Crawlers', status: 'Active', color: 'text-blue-600' },
                                { label: 'Dark Web Nodes', status: 'Infiltrating', color: 'text-indigo-600' },
                                { label: 'Social Scrapers', status: 'Listening', color: 'text-pink-600' },
                            ].map((s, i) => (
                                <div key={i} className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-bold">{s.label}</span>
                                    <span className={`text-[10px] uppercase font-black tracking-widest ${s.color}`}>{s.status}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden col-span-2 relative group flex flex-col justify-center border-l-4 border-l-indigo-600">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Network Integrity</div>
                            <div className="text-3xl font-black text-slate-900 tracking-tighter">99.4% Global Coverage</div>
                            <div className="flex gap-1.5 mt-4 w-full max-w-sm">
                                {[1,2,3,4,5,6,7,8,9,10].map(v => (
                                    <div key={v} className={`h-1.5 w-full rounded-full transition-all duration-1000 ${v < 8 ? 'bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.3)]' : 'bg-slate-100'}`} />
                                ))}
                            </div>
                        </div>
                        <BarChart3 className="w-14 h-14 text-indigo-50 group-hover:text-indigo-100 transition-colors" />
                    </CardContent>
                </Card>
            </div>

            {/* New: Visual Intelligence Recon Pulse */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden relative group">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50">
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Eye className="w-6 h-6 text-blue-600" />
                                Visual Reconnaissance Hub
                            </CardTitle>
                            <CardDescription className="font-medium text-slate-400">AI Pattern matching against Global Social & Marketplace crawlers.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Patrolling</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
                            {[
                                { platform: 'Discord 23', similarity: 99, date: 'Historical', type: 'Archival Leak', color: 'indigo' },
                                { platform: 'Instagram', similarity: 98, date: '1h ago', type: 'Profile Pic', color: 'indigo' },
                                { platform: 'Amazon', similarity: 85, date: '4h ago', type: 'Merch Item', color: 'orange' },
                                { platform: 'Twitter', similarity: 92, date: '12h ago', type: 'Forensic Banner', color: 'blue' },
                                { platform: 'TikTok', similarity: 78, date: '1d ago', type: 'Video Stem', color: 'pink' },
                            ].map((match, i) => (
                                <div key={i} className="min-w-[180px] bg-white border border-slate-100 rounded-2xl p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group/item shadow-sm">
                                    <div className="aspect-square bg-slate-50 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden border border-slate-50 shadow-inner">
                                        <Fingerprint className="w-10 h-10 text-slate-200 group-hover/item:text-blue-600 transition-colors" />
                                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-slate-900 border border-slate-200 shadow-sm">
                                            {match.similarity}% MATCH
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-slate-900 font-black text-xs uppercase tracking-tight">{match.platform}</div>
                                        <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">{match.type} • {match.date}</div>
                                        <div className="h-1.5 bg-slate-50 rounded-full mt-3 overflow-hidden shadow-inner">
                                            <div className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]" style={{ width: `${match.similarity}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm rounded-3xl flex flex-col justify-center p-8 border-dashed hover:border-blue-400 hover:bg-slate-50/50 transition-all cursor-pointer group">
                    <div className="text-center space-y-5">
                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto border border-blue-100 group-hover:scale-110 transition-transform shadow-sm">
                            <Zap className="w-10 h-10 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-slate-900 font-black tracking-tight text-lg">Initiate Visual Hunt</h3>
                            <p className="text-slate-500 text-sm font-medium mt-1">Upload a master forensic asset to scan the global host markets.</p>
                        </div>
                        <Button className="w-full bg-slate-900 hover:bg-black text-white px-6 h-12 rounded-xl font-bold text-sm shadow-lg shadow-slate-900/10">Upload Forensic Master</Button>
                    </div>
                </Card>
            </div>

            {/* Intelligence grouped by source or type */}
            {items.length === 0 ? (
                <Card className="bg-white border-slate-200 border-dashed rounded-3xl">
                    <CardContent className="p-32 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-inner">
                            <Brain className="w-12 h-12 text-slate-200" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 mb-2">Awaiting Intelligence Signals</h3>
                        <p className="text-slate-400 max-w-sm mx-auto font-medium">
                            Our crawlers are currently analyzing global networks.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => {
                        const config = typeConfig[item.intel_type] || typeConfig.other
                        const Icon = config.icon
                        const threat = threatColors[item.threat_level || 'none']
                        const isAnalyzing = analyzingId === item.id

                        return (
                            <Card key={item.id} className="bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden group">
                                <CardContent className="p-8">
                                    <div className="flex flex-col md:flex-row gap-8">
                                        {/* Side Meta */}
                                        <div className="flex flex-col items-center justify-center md:border-r border-slate-100 pr-8 min-w-[140px]">
                                            <div className={`w-16 h-16 rounded-3xl border flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform ${config.bg} ${config.color}`}>
                                                <Icon className="w-8 h-8" />
                                            </div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">{config.label}</div>
                                            <div className="text-[10px] text-slate-500 font-bold mt-1 bg-slate-50 px-2 py-0.5 rounded-full">{formatDate(item.discovered_at)}</div>
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex-1 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                                                    {item.intel_name}
                                                </h3>
                                                {item.source_url && (
                                                    <a href={item.source_url} target="_blank" className="text-slate-300 hover:text-indigo-600 transition-colors p-2 bg-slate-50 rounded-xl border border-slate-100">
                                                        <ExternalLink className="w-5 h-5" />
                                                    </a>
                                                )}
                                            </div>

                                            {/* Threat Info */}
                                            <div className="flex items-center gap-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                                                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-3 shadow-sm ${threat.color} ${threat.bg} ${threat.border}`}>
                                                    <AlertTriangle className="w-4 h-4 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                                                    Threat Spectrum: {item.threat_level}
                                                </div>
                                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner relative">
                                                    <div 
                                                        className={`h-full transition-all duration-1000 ${item.threat_level === 'critical' ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]' : 'bg-indigo-500 shadow-[0_0_12px_rgba(79,70,229,0.4)]'}`} 
                                                        style={{ width: `${threat.level}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* AI Intelligence Block */}
                                            <div className={`relative rounded-3xl p-6 border transition-all ${item.ai_summary ? 'bg-indigo-50/30 border-indigo-100 shadow-sm' : 'bg-white border-slate-100 border-dashed'}`}>
                                                {item.ai_summary ? (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-3 text-indigo-700">
                                                            <Fingerprint className="w-5 h-5" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Decoded Forensic Signal</span>
                                                        </div>
                                                        <p className="text-slate-600 text-sm leading-relaxed font-bold italic pl-4 border-l-2 border-indigo-200">
                                                            "{item.ai_summary}"
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 bg-slate-300 rounded-full animate-pulse" />
                                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider italic">Raw encrypted signal detected. Requires deeper audit.</p>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleAnalyze(item.id)}
                                                            disabled={isAnalyzing}
                                                            className="bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-600 hover:text-white h-10 px-6 rounded-xl font-bold text-xs shadow-sm transition-all"
                                                        >
                                                            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                                            Decode Discovery
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Sidebar */}
                                        <div className="flex flex-row md:flex-col gap-3 justify-center border-l border-slate-50 pl-8">
                                            <Button size="icon" variant="outline" className="w-12 h-12 rounded-2xl border-slate-100 hover:border-blue-400 hover:bg-blue-50 text-slate-400 hover:text-blue-600 shadow-sm">
                                                <Target className="w-6 h-6" />
                                            </Button>
                                            <Button size="icon" variant="outline" className="w-12 h-12 rounded-2xl border-slate-100 hover:border-indigo-400 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 shadow-sm">
                                                <Eye className="w-6 h-6" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
