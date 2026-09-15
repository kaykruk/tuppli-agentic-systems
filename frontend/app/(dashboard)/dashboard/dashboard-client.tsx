'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
    FileText, Plus, 
    Loader2, 
    ArrowRight,
    Lock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { DashboardStats, RecentDetection, Tenant, ReconTarget, ForensicEvidence } from '../actions'
import { createReconTarget } from '../actions'
import { useRouter } from 'next/navigation'
import { UpgradeModal } from '@/components/layout/UpgradeModal'

interface DashboardClientProps {
    stats: DashboardStats
    recentDetections: RecentDetection[]
    tenant: Tenant | null
    allTargets: ReconTarget[]
    allEvidence: ForensicEvidence[]
}



const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    scanning: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    completed: 'bg-green-500/10 text-green-400 border-green-500/30',
    failed: 'bg-red-500/10 text-red-400 border-red-500/30',
}

function formatRelativeTime(dateStr?: string | null): string {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
}

export function DashboardClient({ stats, recentDetections, tenant, allTargets, allEvidence }: DashboardClientProps) {
    const [activeTab, setActiveTab] = useState('overview')
    const [isAddTargetOpen, setIsAddTargetOpen] = useState(false)
    const [loadingTarget, setLoadingTarget] = useState(false)
    const [targetError, setTargetError] = useState('')
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const router = useRouter()
    const isUnpaid = tenant?.tier === 'unpaid'

    const handleAddTarget = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoadingTarget(true)
        setTargetError('')

        const formData = new FormData(e.currentTarget)
        const result = await createReconTarget({
            target_name: formData.get('name') as string,
            target_type: formData.get('type') as string,
            target_value: formData.get('value') as string,
            priority: parseInt(formData.get('priority') as string) || 5,
        })

        setLoadingTarget(false)

        if (result.success) {
            setIsAddTargetOpen(false)
            router.refresh()
        } else if ((result as any).upgradeRequired) {
            setIsAddTargetOpen(false)
            setShowUpgradeModal(true)
        } else {
            setTargetError(result.error || 'Failed to create target')
        }
    }

    const threatData = recentDetections.length > 0
        ? recentDetections.slice(0, 7).reverse().map((d, i) => ({
            date: `Day ${i + 1}`,
            threats: 1,
        }))
        : [
            { date: 'Day 1', threats: 10 },
            { date: 'Day 2', threats: 25 },
            { date: 'Day 3', threats: 15 },
            { date: 'Day 4', threats: 40 },
            { date: 'Day 5', threats: 30 },
            { date: 'Day 6', threats: 55 },
            { date: 'Day 7', threats: 45 },
        ]

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-[0.8] mb-2">
                        Mission<br/>Control
                    </h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                        Live Forensic Cluster Monitoring
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Dialog open={isAddTargetOpen} onOpenChange={setIsAddTargetOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-slate-900 hover:bg-black text-white h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Protected Profile
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white border-slate-200 rounded-[2.5rem] p-10 max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black tracking-tight uppercase">New Target Profile</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddTarget} className="space-y-6 mt-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Profile Name</Label>
                                    <Input name="name" required placeholder="e.g., Main Identity" className="h-12 rounded-xl bg-slate-50 border-slate-200 shadow-inner" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Handle / URL</Label>
                                    <Input name="value" required placeholder="@username or site.com" className="h-12 rounded-xl bg-slate-50 border-slate-200 shadow-inner" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Type</Label>
                                        <Select name="type" defaultValue="creator_name">
                                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 shadow-inner font-bold text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                                                <SelectItem value="creator_name">Creator</SelectItem>
                                                <SelectItem value="domain">Domain</SelectItem>
                                                <SelectItem value="brand">Brand</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Priority</Label>
                                        <Input name="priority" type="number" min="1" max="10" defaultValue="5" className="h-12 rounded-xl bg-slate-50 border-slate-200 shadow-inner font-bold" />
                                    </div>
                                </div>
                                {targetError && <p className="text-red-500 text-[10px] font-black uppercase tracking-tight text-center">{targetError}</p>}
                                <Button type="submit" disabled={loadingTarget} className="w-full h-14 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl mt-4">
                                    {loadingTarget ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Activate Protection'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Main Tabs Navigation */}
            <Tabs defaultValue="overview" className="space-y-6 md:space-y-8" onValueChange={setActiveTab}>
                <TabsList className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200 h-12 md:h-14 w-full md:w-auto">
                    <TabsTrigger value="overview" className="rounded-xl px-8 h-12 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-slate-900 text-slate-500 font-black text-[10px] uppercase tracking-widest transition-all">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="targets" className="rounded-xl px-8 h-12 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-slate-900 text-slate-500 font-black text-[10px] uppercase tracking-widest transition-all">
                        Targets ({allTargets.length})
                    </TabsTrigger>
                    <TabsTrigger value="evidence" className="rounded-xl px-8 h-12 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-slate-900 text-slate-500 font-black text-[10px] uppercase tracking-widest transition-all">
                        Evidence ({allEvidence.length})
                    </TabsTrigger>
                </TabsList>

                {/* OVERVIEW CONTENT */}
                <TabsContent value="overview" className="space-y-8 animate-in fade-in zoom-in-95 duration-500 outline-none">
                    {/* Priority Alert (Top) */}
                    {stats.activeThreats > 0 && (
                        <motion.div 
                            initial={{ x: -20, opacity: 0 }} 
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-red-50 border border-red-200 rounded-[2rem] p-6 flex items-center justify-between shadow-sm relative overflow-hidden"
                        >
                            <div className="flex items-center gap-4 md:gap-6 relative z-10">
                                <div>
                                    <h4 className="text-lg md:text-xl font-black text-red-900 tracking-tight uppercase">Critical Alerts: {stats.activeThreats} Threats Found</h4>
                                    <p className="text-red-600/70 text-[9px] md:text-xs font-bold uppercase tracking-widest mt-1">
                                        Immediate action required on verification cluster. Last check: {formatRelativeTime(stats.lastScanTime)}
                                    </p>
                                </div>
                            </div>
                            <Button className="bg-red-600 hover:bg-red-700 text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest rounded-xl h-9 md:h-10 px-4 md:px-6 shadow-lg shadow-red-200 shrink-0" onClick={() => setActiveTab('evidence')}>
                                Resolve
                            </Button>
                        </motion.div>
                    )}

                    {/* Stat Dashboard */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        <StatCard title="Leaks Blocked" value={stats.activeThreats.toString()} />
                        <StatCard title="Monitored Profiles" value={allTargets.length.toString()} />
                        <StatCard title="Forensic Assets" value={allEvidence.length.toString()} />
                        <StatCard title="Uptime Score" value="99.9%" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Timeline */}
                        <div className="lg:col-span-2">
                             <Card className="bg-white border-slate-200 shadow-sm rounded-[3rem] overflow-hidden border-b-4 border-b-indigo-500/20">
                                <CardHeader className="p-6 md:p-10 border-b border-slate-50 flex flex-row items-center justify-between">
                                    <CardTitle className="text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                        Leak Timeline
                                    </CardTitle>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">7 Day Trend</div>
                                </CardHeader>
                                <CardContent className="p-6 md:p-10">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={threatData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                                            <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: '900' }}
                                                labelStyle={{ color: '#64748b', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="threats"
                                                stroke="#4f46e5"
                                                strokeWidth={4}
                                                dot={{ fill: '#4f46e5', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                                activeDot={{ r: 8, strokeWidth: 0 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Discoveries Mini-List */}
                        <Card className="bg-white border-slate-200 shadow-sm rounded-[3rem] overflow-hidden">
                            <CardHeader className="p-10 border-b border-slate-50">
                                <CardTitle className="text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                    Latest Assets
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <ul className="space-y-4">
                                    {recentDetections.slice(0, 5).map((d, i) => {
                                        const isRedacted = isUnpaid && i >= 2;
                                        return (
                                        <li key={d.id} className="flex items-center justify-between group relative">
                                            <div className={`flex items-center gap-4 ${isRedacted ? 'blur-[4px] select-none pointer-events-none' : ''} transition-all`}>
                                                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                    <FileText className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 tracking-tight uppercase truncate max-w-[120px]">{d.media}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{d.platform}</p>
                                                </div>
                                            </div>
                                            <div className={`text-right ${isRedacted ? 'blur-[4px] select-none pointer-events-none' : ''}`}>
                                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-lg">{d.confidence}% Match</span>
                                            </div>
                                            {isRedacted && (
                                                <div className="absolute inset-0 flex items-center justify-center cursor-pointer z-10" onClick={() => setShowUpgradeModal(true)}>
                                                    <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 hover:bg-black transition-colors">
                                                        <Lock className="w-3 h-3" /> Upgrade to View
                                                    </span>
                                                </div>
                                            )}
                                        </li>
                                    )})}
                                </ul>
                                <Button variant="ghost" className="w-full text-blue-600 font-black text-[10px] uppercase tracking-widest mt-4" onClick={() => setActiveTab('evidence')}>
                                    View Repository Hub
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* AI Briefing (Pinned to bottom of overview) */}
                    <AiThreatSummary stats={stats} detections={recentDetections} />
                </TabsContent>

                {/* TARGETS CONTENT */}
                <TabsContent value="targets" className="space-y-6 animate-in slide-in-from-right-4 duration-500 outline-none">
                    <Card className="bg-white border-slate-200 shadow-sm rounded-[3rem] overflow-hidden">
                        <CardHeader className="p-6 md:p-10 border-b border-slate-50">
                            <CardTitle className="text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                Protected Identity Profiles
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="border-slate-100">
                                        <TableHead className="text-slate-500 text-[10px] font-black uppercase tracking-widest px-10 h-16">Profile Name</TableHead>
                                        <TableHead className="text-slate-500 text-[10px] font-black uppercase tracking-widest h-16">Type</TableHead>
                                        <TableHead className="text-slate-500 text-[10px] font-black uppercase tracking-widest h-16">Status</TableHead>
                                        <TableHead className="text-slate-500 text-[10px] font-black uppercase tracking-widest h-16">Last Sync</TableHead>
                                        <TableHead className="text-slate-500 text-[10px] font-black uppercase tracking-widest h-16 text-right px-10">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allTargets.map((target) => (
                                        <TableRow key={target.id} className="border-slate-50 hover:bg-slate-50/50 transition-all group">
                                            <TableCell className="px-10 py-6">
                                                <div>
                                                    <p className="text-slate-900 font-black tracking-tight uppercase text-xs">{target.target_name}</p>
                                                    <p className="text-slate-400 font-medium text-[10px] mt-1">{target.target_value}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                                                    {target.target_type.replace('_', ' ')}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[target.status as keyof typeof statusColors] || statusColors.pending}`}>
                                                    {target.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                                                {formatRelativeTime(target.last_scanned_at)}
                                            </TableCell>
                                            <TableCell className="text-right px-10">
                                                <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl hover:bg-white hover:shadow-lg transition-all text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                                                    Sync
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* EVIDENCE CONTENT */}
                <TabsContent value="evidence" className="space-y-6 animate-in slide-in-from-right-4 duration-500 outline-none">
                    <Card className="bg-white border-slate-200 shadow-sm rounded-[3rem] overflow-hidden">
                        <CardHeader className="p-6 md:p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle className="text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                Forensic Analysis Vault
                            </CardTitle>
                            <Button variant="outline" className="h-10 border-slate-200 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest shadow-sm">
                                Export PDF Report
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="border-slate-100">
                                        <TableHead className="text-slate-500 text-[10px] font-black uppercase tracking-widest px-10 h-16">Evidence Tag</TableHead>
                                        <TableHead className="text-slate-500 text-[10px] font-black uppercase tracking-widest h-16">Platform</TableHead>
                                        <TableHead className="text-slate-500 text-[10px] font-black uppercase tracking-widest h-16">Match Score</TableHead>
                                        <TableHead className="text-slate-500 text-[10px] font-black uppercase tracking-widest h-16">Discovered</TableHead>
                                        <TableHead className="text-slate-500 text-[10px] font-black uppercase tracking-widest h-16 text-right px-10">Resolution</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allEvidence.map((item, i) => {
                                        const isRedacted = isUnpaid && i >= 2;
                                        return (
                                        <TableRow key={item.id} className="border-slate-50 hover:bg-slate-50/50 transition-all group relative">
                                            <TableCell className={`px-10 py-8 ${isRedacted ? 'blur-sm select-none pointer-events-none' : ''}`}>
                                                <div className="flex items-center gap-4">
                                                    <div>
                                                        <p className="text-slate-900 font-black tracking-tight uppercase text-xs">{item.evidence_name}</p>
                                                        <p className="text-slate-400 font-bold text-[10px] uppercase mt-1">{item.evidence_type}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className={isRedacted ? 'blur-sm select-none pointer-events-none' : ''}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{item.source_platform || 'Undisc.'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className={isRedacted ? 'blur-sm select-none pointer-events-none' : ''}>
                                                <div className="inline-flex flex-col">
                                                    <div className="text-[10px] font-black text-slate-900 uppercase">{(item.similarity_score || 0) * 100}% Confidence</div>
                                                    <div className="w-24 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                                        <div className="h-full bg-indigo-600 transition-all" style={{ width: `${(item.similarity_score || 0.5) * 100}%` }} />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className={`text-slate-400 font-bold text-[10px] uppercase tracking-wider ${isRedacted ? 'blur-sm select-none pointer-events-none' : ''}`}>
                                                {formatRelativeTime(item.discovered_at)}
                                            </TableCell>
                                            <TableCell className={`text-right px-10 ${isRedacted ? 'blur-sm select-none pointer-events-none' : ''}`}>
                                                <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl hover:bg-white hover:shadow-lg transition-all text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest"
                                                    onClick={(e) => {
                                                        if (isUnpaid) {
                                                            e.preventDefault();
                                                            setShowUpgradeModal(true);
                                                        }
                                                    }}
                                                >
                                                    Take Action
                                                </Button>
                                            </TableCell>
                                            {isRedacted && (
                                                <div className="absolute inset-0 flex items-center justify-center cursor-pointer z-10 bg-white/20" onClick={() => setShowUpgradeModal(true)}>
                                                    <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-black transition-colors">
                                                        <Lock className="w-3 h-3" /> Subscribe to Unlock Evidence
                                                    </span>
                                                </div>
                                            )}
                                        </TableRow>
                                    )})}
                                    {allEvidence.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-20 text-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                                                </div>
                                                <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Clear Horizon</h3>
                                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">No active leaks detected in this cluster.</p>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            
            <UpgradeModal 
                open={showUpgradeModal} 
                onClose={() => setShowUpgradeModal(false)}
                feature="Content Scanning & DMCA Takedowns"
            />
        </div>
    )
}

function AiThreatSummary({ stats, detections }: { stats: DashboardStats; detections: RecentDetection[] }) {
    const [summary, setSummary] = useState<string | null>(null)
    const [threatLevel, setThreatLevel] = useState<string>('unknown')
    const [recommendations, setRecommendations] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const analyze = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'search_results',
                    data: { stats, detections: detections.slice(0, 10) },
                }),
            })
            const data = await res.json()
            if (data.analysis) {
                setSummary(data.analysis.summary || data.analysis.threat_assessment || 'Analysis complete.')
                setThreatLevel(data.analysis.threat_level || 'low')
                setRecommendations(data.analysis.recommendations || [])
            }
        } catch {
            setError('AI analysis unavailable')
        } finally {
            setLoading(false)
        }
    }

    const threatColors: Record<string, { bg: string; text: string }> = {
        critical: { bg: 'bg-red-50 text-red-700 border-red-100', text: 'text-red-700' },
        high: { bg: 'bg-orange-50 text-orange-700 border-orange-100', text: 'text-orange-700' },
        medium: { bg: 'bg-yellow-50 text-yellow-700 border-yellow-100', text: 'text-yellow-700' },
        low: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', text: 'text-emerald-700' },
        unknown: { bg: 'bg-slate-50 text-slate-700 border-slate-200', text: 'text-slate-600' },
    }

    const tc = threatColors[threatLevel] || threatColors.unknown

    return (
        <Card className="bg-white border-slate-200 shadow-sm rounded-[3rem] overflow-hidden border-l-8 border-l-slate-900 border-t-8 border-t-slate-50">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-10 border-b border-slate-50 gap-4">
                <CardTitle className="text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                    Security Briefing
                </CardTitle>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-indigo-600 hover:bg-indigo-50 font-black text-[10px] uppercase tracking-widest"
                    onClick={analyze}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {loading ? 'Synthesizing...' : 'Synthesize Briefing'}
                </Button>
            </CardHeader>
            <CardContent className="p-6 md:p-10">
                {!summary && !loading && !error && (
                    <div className="text-center py-10">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                        </div>
                        <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.2em]">Briefing Ready</p>
                        <p className="text-slate-400 font-bold text-[10px] uppercase mt-2">Activate AI synthesis for cluster insights.</p>
                    </div>
                )}
                {summary && (
                    <div className="space-y-8 animate-in slide-in-from-top-2 duration-500">
                        <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${tc.bg}`}>
                            <span className={tc.text}>{threatLevel} Risk Assessment</span>
                        </div>
                        <p className="text-slate-700 text-sm font-bold leading-relaxed border-l-4 border-slate-900 pl-8">{summary}</p>
                        {recommendations.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recommendations.map((r, i) => (
                                    <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-start gap-4">
                                        <div className="w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 mt-1">
                                            {i + 1}
                                        </div>
                                        <p className="text-[11px] text-slate-600 font-black uppercase leading-relaxed">{r}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function StatCard({ title, value }: { title: string; value: string }) {
    return (
        <Card className="bg-white border-slate-200 shadow-sm rounded-[2rem] overflow-hidden group hover:border-slate-300 transition-all border-b-4 border-b-slate-100">
            <CardContent className="p-5 md:p-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">{title}</span>
                </div>
                <p className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
            </CardContent>
        </Card>
    )
}
