import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getApiKeys } from '../../actions'
import { ApiKeyClient } from './api-key-client'
import { Key, Shield, Code, Zap, Lock, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default async function ApiSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const initialKeys = await getApiKeys()

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                    <Key className="w-10 h-10 text-blue-500" />
                    Connectivity & API
                </h1>
                <p className="text-slate-400 text-lg">
                    Connect Tuppli to legal dashboards, custom crawlers, and management tools.
                </p>
            </div>

            {/* API Status Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">Gateway Status</CardDescription>
                        <CardTitle className="text-xl font-bold text-emerald-500 flex items-center gap-2">
                            <Zap className="w-4 h-4 fill-emerald-500" /> Active
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">Active Keys</CardDescription>
                        <CardTitle className="text-xl font-bold text-white">{initialKeys.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">Scoped Access</CardDescription>
                        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                            <Lock className="w-4 h-4 text-blue-500" /> Granular
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                <CardHeader className="border-b border-slate-800 bg-black/20 pb-6">
                    <div className="flex items-center gap-3 text-blue-500 mb-2">
                        <Shield className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Security Protocol</span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Lysis Connect Gateway</CardTitle>
                    <CardDescription>
                        Generate API keys to grant secure access to your forensic discoveries. These keys are designed for use in your own backend systems or third-party legal management suites.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ApiKeyClient initialKeys={initialKeys} />
                </CardContent>
            </Card>

            {/* Quick Guide Card */}
            <Card className="bg-blue-600/5 border-blue-500/20">
                <CardContent className="p-6 flex items-start gap-4">
                    <Info className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                    <div>
                        <h4 className="text-blue-400 font-bold mb-1 uppercase text-xs tracking-widest">Pro Tip: Headless Enforcement</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            You can automate your entire legal workflow by connecting our <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-400">/v1/enforce</code> endpoint to your case management software. Tuppli will handle the cryptographic verification of the asset before dispatching the notice.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
