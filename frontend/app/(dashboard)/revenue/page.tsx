'use client'

import { useState, useMemo } from 'react'
import { 
    ArrowUpRight, 
    Info,
    TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'

export default function RevenueRecoveryPage() {
    const [avgAssetPrice, setAvgAssetPrice] = useState(49)
    const [monthlyLeaks, setMonthlyLeaks] = useState(12)
    const [conversionRate, setConversionRate] = useState(0.5) // % of people who would've bought if it wasn't leaked

    const stats = useMemo(() => {
        const potentialLoss = avgAssetPrice * monthlyLeaks * 10 
        const recoveredMonthly = (avgAssetPrice * monthlyLeaks * (conversionRate / 100)) * 30 // Rough estimation
        const annualROI = recoveredMonthly * 12
        return {
            potentialLoss,
            recoveredMonthly,
            annualROI,
            savingsRate: 88 // Simulated takedown success rate
        }
    }, [avgAssetPrice, monthlyLeaks, conversionRate])

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in mt-2 fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight uppercase">
                        Revenue Recovery
                    </h1>
                    <p className="text-slate-500 text-lg font-medium">
                        Quantifying the financial impact of your forensic protection assets.
                    </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-6 shadow-sm">
                    <div>
                        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Global Forensic ROI</div>
                        <div className="text-2xl font-black text-slate-900">+1,240%</div>
                    </div>
                </div>
            </div>

            {/* Top Cards: Financial Impact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-slate-200 shadow-sm rounded-2xl relative overflow-hidden group hover:border-emerald-300 transition-all border-l-4 border-l-emerald-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-400 uppercase text-[10px] font-black tracking-widest">Monthly Saved Revenue</CardDescription>
                        <CardTitle className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2 tracking-tighter">
                            {stats.recoveredMonthly.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            <span className="text-sm font-medium text-slate-400 tracking-normal">/mo</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                            <ArrowUpRight className="w-4 h-4" />
                            +12% vs Manual Monitoring
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-indigo-300 transition-all border-l-4 border-l-indigo-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-400 uppercase text-[10px] font-black tracking-widest">Enforcement Efficiency</CardDescription>
                        <CardTitle className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">
                            {stats.savingsRate}%
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Progress value={stats.savingsRate} className="h-2 bg-slate-100" indicatorClassName="bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.3)]" />
                        <div className="text-[10px] font-black text-slate-400 flex justify-between uppercase tracking-widest">
                            <span>Target: 95%</span>
                            <span className="text-indigo-600">Enterprise Tier Active</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm rounded-2xl group hover:border-blue-300 transition-all border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-400 uppercase text-[10px] font-black tracking-widest">Discovery Velocity</CardDescription>
                        <CardTitle className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2 tracking-tighter">
                            1.2h
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-widest">14.2x Faster</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider italic">Avg. Time to Case Neutralization</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Interactive Calculator */}
                <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-slate-900 font-black flex items-center gap-3 uppercase text-xs tracking-widest">
                            Forensic Recovery Calculator
                        </CardTitle>
                        <CardDescription className="font-medium text-slate-500">
                            Quantify how Tuppli's takedown engine converts infringements back into authorized revenue.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-10 p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    Asset Unit Value ($)
                                    <Info className="w-3.5 h-3.5 text-slate-300" />
                                </label>
                                <Input 
                                    type="number" 
                                    value={avgAssetPrice} 
                                    onChange={(e) => setAvgAssetPrice(Number(e.target.value))}
                                    className="bg-white border-slate-200 text-slate-900 h-12 rounded-xl text-lg font-bold shadow-inner"
                                />
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider italic">Subscription or Package Price</p>
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    Monthly Leak Volume
                                    <Info className="w-3.5 h-3.5 text-slate-300" />
                                </label>
                                <Input 
                                    type="number" 
                                    value={monthlyLeaks} 
                                    onChange={(e) => setMonthlyLeaks(Number(e.target.value))}
                                    className="bg-white border-slate-200 text-slate-900 h-12 rounded-xl text-lg font-bold shadow-inner"
                                />
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider italic">Historical average of active discoveries</p>
                            </div>
                        </div>

                        <div className="space-y-6 pt-10 border-t border-slate-100">
                            <h4 className="text-slate-900 font-black flex items-center gap-3 uppercase text-[10px] tracking-[0.2em]">
                                Recovery Delta Analysis
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-8 rounded-3xl bg-red-50 border border-red-100 shadow-sm">
                                    <div className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Passive Exposure Loss</div>
                                    <div className="text-3xl font-black text-slate-900 mb-3 tracking-tighter">
                                        ${stats.potentialLoss.toLocaleString()}
                                        <span className="text-sm font-medium text-slate-400 tracking-normal"> /year</span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed font-bold italic">
                                        Calculated value of content distributed freely across infringing platforms without Forensic IDs.
                                    </p>
                                </div>
                                <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-100 shadow-sm relative overflow-hidden group">
                                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Realized Recovery Yield</div>
                                    <div className="text-3xl font-black text-slate-900 mb-3 tracking-tighter">
                                        ${stats.annualROI.toLocaleString()}
                                        <span className="text-sm font-medium text-slate-400 tracking-normal"> /year</span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed font-bold italic">
                                        Projected revenue gain from pirates converting back to authorized platforms once links are neutralized.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl flex items-start gap-5 shadow-xl shadow-slate-200">
                            <div>
                                <h5 className="text-white font-black text-sm uppercase tracking-widest">The Forensic Advantage</h5>
                                <p className="text-indigo-50 text-xs leading-relaxed font-medium mt-1">
                                    Forensic Bit-Level watermarking survivors platform compression, ensuring **100% accurate traitor tracking** and forced conversion for infringing users.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Proof & Strategy */}
                <div className="space-y-6">
                    <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-900 px-8 py-6">
                            <CardTitle className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                Enforcement Playbook
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            {[
                                { title: 'High-Velocity Takedowns', desc: 'Neutralizing links within 60 minutes creates a feedback loop forcing legitimate purchases.', color: 'text-emerald-600' },
                                { title: 'Global Recon Alpha', desc: 'Removing indices from major search engines cuts 94% of pirate traffic streams.', color: 'text-blue-600' },
                                { title: 'Traitor Invalidation', desc: 'Auto-ban subscribers linked to Forensic DNA leaks to stop piracy at the root.', color: 'text-indigo-600' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-2 shrink-0" />
                                    <div>
                                        <h6 className="text-slate-900 text-sm font-black tracking-tight uppercase leading-tight">{item.title}</h6>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 shadow-2xl shadow-slate-200 rounded-3xl group">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-black uppercase tracking-widest">Efficiency Metric</div>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Recovered in 4.2 days.</h3>
                            <p className="text-sm font-medium text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                                Based on discovery volume, Tuppli typically recovers its entire annual cost via revenue recovery in less than 5 days.
                            </p>
                            <Button className="w-full mt-6 bg-white text-slate-900 hover:bg-slate-100 font-black text-xs uppercase tracking-widest h-12 rounded-xl transition-all">
                                Download Audit Log
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
