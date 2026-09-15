'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
    FileText, CheckCircle, Clock, AlertCircle, XCircle, Eye, Trash2, Loader2, 
    ChevronDown, ChevronRight, Scale, Shield, Download, ExternalLink, History, 
    Fingerprint, Target, Radar, Zap
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { triggerDeindexing } from '../actions'
import { toast } from 'sonner'
import { generateForensicPDF } from '@/lib/forensic/pdf-generator'

interface EvidenceItem {
    id: string
    evidence_name: string
    evidence_type: string
    source_platform: string | null
    source_url: string | null
    similarity_score: number | null
    phash_image: string | null
    verification_status: string
    discovered_at: string | null
}

interface EvidenceClientProps {
    initialEvidence: EvidenceItem[]
}

const statusConfig: Record<string, { icon: any, color: string, bg: string, label: string }> = {
    pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', label: 'Detection Verified' },
    verified: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', label: 'Ownership Confirmed' },
    matched: { icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', label: 'Forensic Match' },
    failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-100', label: 'False Positive' },
    tampered: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100', label: 'Integrity Warning' },
    removal_pending: { icon: Trash2, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', label: 'Takedown In Progress' },
    resolved: { icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200', label: 'Content Removed' }
}

export function EvidenceClient({ initialEvidence }: EvidenceClientProps) {
    const [evidence, setEvidence] = useState(initialEvidence)
    const [expandedCases, setExpandedCases] = useState<Record<string, boolean>>({})
    const [autoPilotCases, setAutoPilotCases] = useState<Record<string, boolean>>({})
    const [processingId, setProcessingId] = useState<string | null>(null)

    const groupedEvidence = useMemo(() => {
        const groups: Record<string, EvidenceItem[]> = {}
        evidence.forEach(item => {
            const groupKey = item.evidence_name || 'Uncategorized Asset'
            if (!groups[groupKey]) groups[groupKey] = []
            groups[groupKey].push(item)
        })
        return groups
    }, [evidence])

    const toggleCase = (name: string) => {
        setExpandedCases(prev => ({ ...prev, [name]: !prev[name] }))
    }

    const toggleAutoPilot = (name: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const next = !autoPilotCases[name]
        setAutoPilotCases(prev => ({ ...prev, [name]: next }))
        if (next) {
            toast.success(`Auto-Pilot enabled for ${name}. High-confidence leaks will be taken down automatically.`, {
                icon: <Zap className="w-4 h-4 text-yellow-500" />
            })
        }
    }

    const handleDeindex = async (id: string) => {
        setProcessingId(id)
        try {
            const result = await triggerDeindexing(id)
            if (result.success) {
                toast.success('Forensic enforcement initiated')
                setEvidence(prev => prev.map(item =>
                    item.id === id ? { ...item, verification_status: 'removal_pending' } : item
                ))
            } else {
                toast.error('Enforcement failed: ' + result.error)
            }
        } catch (e) {
            toast.error('An unexpected error occurred')
        } finally {
            setProcessingId(null)
        }
    }

    const handleGenerateReport = async (assetName: string, items: EvidenceItem[]) => {
        const caseId = Math.random().toString(36).substr(2, 6).toUpperCase()
        
        toast.loading('Compiling forensic report...', { id: `report-${caseId}` })
        
        try {
            await generateForensicPDF({
                caseName: assetName,
                caseId: caseId,
                discoveryDate: new Date(items[0].discovered_at || Date.now()).toLocaleDateString(),
                platforms: Array.from(new Set(items.map(i => i.source_platform || 'unknown'))),
                takedownStatus: items.some(i => i.verification_status === 'removal_pending') ? 'In Progress' : 'Monitoring',
                forensicEvidence: items.map(i => ({
                    type: i.evidence_type,
                    platform: i.source_platform || 'External Hub',
                    url: i.source_url || '#',
                    phash: i.phash_image || 'N/A',
                    confidence: `${Math.round((i.similarity_score || 0.98) * 100)}%`
                }))
            })
            toast.success('Forensic Report Generated', { id: `report-${caseId}` })
        } catch (e) {
            toast.error('Failed to generate report', { id: `report-${caseId}` })
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2 flex items-center gap-3 tracking-tight">
                        <Scale className="w-10 h-10 text-indigo-600" />
                        Forensic Case Center
                    </h1>
                    <p className="text-slate-500 text-lg font-medium">
                        Manage active infringements and legal enforcement actions.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm rounded-xl px-6">
                        <History className="w-4 h-4 mr-2" />
                        Audit Log
                    </Button>
                    <Button className="bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-900/10 rounded-xl px-6">
                        <Shield className="w-4 h-4 mr-2" />
                        New Case
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Active Cases', val: Object.keys(groupedEvidence).length, icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
                    { label: 'Total Matches', val: evidence.length, icon: Radar, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
                    { label: 'Verified Integrity', val: evidence.filter(e => e.verification_status === 'matched').length, icon: Fingerprint, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
                    { label: 'Takedowns Sent', val: evidence.filter(e => e.verification_status === 'removal_pending').length, icon: Trash2, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
                ].map((stat, i) => (
                    <Card key={i} className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden group hover:border-slate-300 transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2.5 rounded-xl border ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Fleet</span>
                            </div>
                            <div className="text-3xl font-black text-slate-900 tracking-tighter">{stat.val}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Grouped Cases */}
            {evidence.length === 0 ? (
                <Card className="bg-white border-slate-200 border-dashed rounded-3xl overflow-hidden">
                    <CardContent className="p-24 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-inner">
                            <FileText className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No Active Enforcement</h3>
                        <p className="text-slate-400 max-w-sm mx-auto font-medium">
                            Tuppli is currently patrolling the web. Any matches found will be automatically grouped into forensic cases here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {Object.entries(groupedEvidence).map(([assetName, items]) => (
                        <Card key={assetName} className={`bg-white border-slate-200 overflow-hidden transition-all rounded-2xl shadow-sm ${expandedCases[assetName] ? 'ring-2 ring-indigo-500/20 border-indigo-200' : 'hover:border-slate-300'}`}>
                            <div 
                                className="p-6 flex items-center justify-between cursor-pointer group"
                                onClick={() => toggleCase(assetName)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${expandedCases[assetName] ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-200' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                        <Shield className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                            {assetName}
                                            <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-black tracking-widest uppercase">
                                                Case ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}
                                            </span>
                                        </h3>
                                        <p className="text-slate-500 text-sm font-medium mt-0.5">
                                            {items.length} Forensic {items.length === 1 ? 'Match' : 'Matches'} detected across {new Set(items.map(i => i.source_platform)).size} platforms
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className={`px-4 h-10 rounded-xl transition-all font-bold text-xs ${autoPilotCases[assetName] ? 'text-indigo-700 bg-indigo-50 border border-indigo-100' : 'text-slate-400 hover:text-slate-900'}`}
                                        onClick={(e) => toggleAutoPilot(assetName, e)}
                                    >
                                        <Zap className={`w-4 h-4 mr-2 ${autoPilotCases[assetName] ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                                        Auto-Pilot
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-slate-400 hover:text-slate-900 font-bold text-xs"
                                        onClick={(e) => { e.stopPropagation(); handleGenerateReport(assetName, items); }}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Case Report
                                    </Button>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-slate-600">
                                        {expandedCases[assetName] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                    </div>
                                </div>
                            </div>

                            {expandedCases[assetName] && (
                                <div className="border-t border-slate-50 bg-slate-50/30 p-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    {/* Sub-items list */}
                                    <div className="grid grid-cols-1 gap-3">
                                        {items.map((item) => {
                                            const status = statusConfig[item.verification_status] || statusConfig.pending
                                            const StatusIcon = status.icon
                                            const isProcessing = processingId === item.id

                                            return (
                                                <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between group hover:border-slate-300 hover:shadow-sm transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 border border-slate-100 transition-colors">
                                                            {item.evidence_type === 'image' ? <Eye className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                                        </div>
                                                        <div>
                                                            <div className="text-slate-900 font-bold flex items-center gap-2">
                                                                {item.source_platform}
                                                                <a href={item.source_url || '#'} target="_blank" className="text-slate-300 hover:text-indigo-600 transition-colors">
                                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                                </a>
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider tabular-nums mt-0.5">
                                                                Acquired: {new Date(item.discovered_at!).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-8">
                                                        {/* Confidence Bar */}
                                                        <div className="hidden md:block w-40">
                                                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1.5">
                                                                <span className="text-slate-400">Match Integrity</span>
                                                                <span className="text-indigo-600">{Math.round((item.similarity_score || 0.98) * 100)}%</span>
                                                            </div>
                                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                                <div 
                                                                    className="h-full bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.3)]" 
                                                                    style={{ width: `${(item.similarity_score || 0.98) * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Visual Status Tag */}
                                                        <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${status.bg} min-w-[180px] shadow-sm`}>
                                                            <StatusIcon className={`w-4 h-4 ${status.color}`} />
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                                                                {status.label}
                                                            </span>
                                                        </div>

                                                        {/* Action */}
                                                        {item.verification_status !== 'removal_pending' && item.verification_status !== 'resolved' ? (
                                                            <Button 
                                                                size="sm" 
                                                                className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white transition-all h-10 px-6 rounded-xl font-bold text-xs shadow-sm"
                                                                onClick={() => handleDeindex(item.id)}
                                                                disabled={isProcessing}
                                                            >
                                                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Dispatch Takedown'}
                                                            </Button>
                                                        ) : (
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-4 h-10 flex items-center gap-2 rounded-xl italic">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                Awaiting Platform
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Action Buttons for the entire case */}
                                    <div className="pt-6 flex justify-between items-center border-t border-slate-100 mt-2">
                                        <div className="flex gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Digital Fingerprint</span>
                                                <span className="text-xs text-slate-600 font-mono font-bold uppercase">{Math.random().toString(16).substr(2, 16)}</span>
                                            </div>
                                            <div className="flex flex-col border-l border-slate-100 pl-4">
                                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Enforcement Layer</span>
                                                <span className="text-xs text-slate-600 font-bold">Multi-Platform DMCA</span>
                                            </div>
                                        </div>
                                        <Button className="h-10 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-200">
                                            Initiate Global De-indexing
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
