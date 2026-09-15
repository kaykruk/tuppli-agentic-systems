import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTrademarkStatus } from '../actions'
import { 
    ShieldCheck, AlertTriangle, Globe, Users, Target, Search, 
    ArrowRight, CheckCircle, ExternalLink, ShieldAlert, Zap,
    FileSearch, Scale, Fingerprint, BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function TrademarkPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const trademark = await getTrademarkStatus()

    return (
        <div className="space-y-8 animate-in mt-2 fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2 flex items-center gap-3 tracking-tight">
                        <Scale className="w-10 h-10 text-emerald-600" />
                        Brand Protection
                    </h1>
                    <p className="text-slate-500 text-lg font-medium">
                        Monitoring trademark integrity, typosquatting, and impersonation across global markets.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm rounded-xl px-6 h-12 font-bold text-sm">
                        <FileSearch className="w-4 h-4 mr-2" />
                        Export Trademark Audit
                    </Button>
                    <Button className="bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-900/10 rounded-xl px-6 h-12 font-bold text-sm">
                        <Zap className="w-4 h-4 mr-2" />
                        Disrupt Target
                    </Button>
                </div>
            </div>

            {/* Brand Pulse Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden border-l-4 border-l-emerald-500">
                    <CardHeader className="pb-3">
                        <CardDescription className="text-slate-400 uppercase text-[10px] font-black tracking-widest">Brand Integrity Score</CardDescription>
                        <CardTitle className="text-5xl font-black text-slate-900 flex items-end gap-3 tracking-tighter">
                            {trademark.brandScore}%
                            <span className="text-xs font-black text-emerald-600 mb-2 flex items-center bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">
                                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Elite Status
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-emerald-500 w-[88%] shadow-[0_0_12px_rgba(16,185,129,0.3)] rounded-full" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm rounded-2xl border-l-4 border-l-orange-500">
                    <CardHeader>
                        <CardDescription className="text-slate-400 uppercase text-[10px] font-black tracking-widest">Active Infringements</CardDescription>
                        <CardTitle className="text-4xl font-black text-slate-900 tracking-tighter">
                            {trademark.activeInfringements}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            2 High-Risk Domains Flagged
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm rounded-2xl border-l-4 border-l-blue-500">
                    <CardHeader>
                        <CardDescription className="text-slate-400 uppercase text-[10px] font-black tracking-widest">Global Surveillance</CardDescription>
                        <CardTitle className="text-4xl font-black text-slate-900 tracking-tighter">
                            Active
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                            <Globe className="w-4 h-4 text-blue-500" />
                            1.2M Domain Nodes Patrolled
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Typosquatting Detective */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/30 p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <Globe className="w-6 h-6 text-blue-600" />
                                    Typosquatting Detective
                                </CardTitle>
                                <CardDescription className="font-medium text-slate-500 mt-1">Deceptive domains identified using your forensic identity.</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 h-8 rounded-lg">View All</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {trademark.monitoredDomains.map((domain, i) => (
                                <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all group cursor-pointer">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-[10px] font-black shadow-sm ${
                                            domain.risk === 'high' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                                        }`}>
                                            {domain.risk.toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-slate-900 font-bold flex items-center gap-2 text-base">
                                                {domain.domain}
                                                <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Registrar: Digital Ocean Node (Privacy Shield)</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm ${
                                            domain.status === 'Deindexed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                        }`}>
                                            {domain.status}
                                        </span>
                                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-slate-300 hover:text-red-600 transition-all hover:bg-red-50 border border-transparent hover:border-red-100">
                                            <Target className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/30 p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <Users className="w-6 h-6 text-indigo-600" />
                                    Identity Impersonation Hub
                                </CardTitle>
                                <CardDescription className="font-medium text-slate-500 mt-1">Social media nodes deceptively using your trademarked handle.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {trademark.socialImpersonators.map((social, i) => (
                                <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all group cursor-pointer">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shadow-inner">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-slate-900 font-bold text-base">{social.handle}</div>
                                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 italic">{social.platform} • {social.followers.toLocaleString()} Global Followers</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-[9px] font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 uppercase tracking-widest shadow-sm">
                                            High Traffic Node
                                        </div>
                                        <Button size="sm" variant="outline" className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-slate-200 hover:bg-slate-900 hover:text-white transition-all h-9 rounded-xl px-4 shadow-sm">
                                            Flag Audit
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Trademark Audit Log Overlay */}
            <Card className="bg-white border-slate-200 shadow-xl rounded-3xl overflow-hidden relative group border-t-4 border-t-indigo-600">
                <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm group-hover:scale-105 transition-transform duration-500">
                            <ShieldAlert className="w-10 h-10 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Forensic IP Audit</h3>
                            <p className="text-slate-500 max-w-md font-medium mt-1">
                                Generate a cryptographically signed digital report of all active brand infringements for prioritized legal enforcement.
                            </p>
                        </div>
                    </div>
                    <Button className="bg-slate-900 hover:bg-black text-white px-10 py-7 h-auto rounded-3xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-slate-300 group">
                        Run Global Audit
                        <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
