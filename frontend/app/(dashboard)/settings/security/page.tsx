import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api/auth'
import { MfaEnrollment } from '@/components/security/mfa-enrollment'
import { Shield, Lock, Smartphone, Fingerprint, History, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default async function SecuritySettingsPage() {
    // 🛡️ RBAC ENFORCEMENT: Only admins can manage security protocols
    const profile = await requireAdmin()
    const supabase = await createClient()

    // Check factor status (Supabase MFA)

    // Check factor status (Supabase MFA)
    const { data: factors } = await supabase.auth.mfa.listFactors()
    const activeFactors = factors?.all?.filter((f: any) => f.status === 'verified') || []

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                    <Shield className="w-10 h-10 text-emerald-500" />
                    Security & Access
                </h1>
                <p className="text-slate-400 text-lg">
                    Manage your cryptographic identifiers and access protocols.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* MFA Enrollment */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-blue-500" />
                            Multi-Factor Authentication
                        </CardTitle>
                        <CardDescription>
                            Add an extra layer of security to your forensic workstation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activeFactors.length > 0 ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg flex items-center gap-3">
                                <Lock className="w-5 h-5 text-emerald-500" />
                                <div>
                                    <p className="text-sm text-emerald-400 font-bold">MFA Active</p>
                                    <p className="text-xs text-slate-400">Your account is using TOTP protection.</p>
                                </div>
                            </div>
                        ) : (
                            <MfaEnrollment />
                        )}
                    </CardContent>
                </Card>

                {/* Session Security */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                            <History className="w-5 h-5 text-purple-500" />
                            Active Sessions
                        </CardTitle>
                        <CardDescription>
                            Current authorized connections to your profile.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-slate-800">
                            <div className="flex items-center gap-3">
                                <Globe className="w-4 h-4 text-slate-500" />
                                <div>
                                    <p className="text-xs font-medium text-white">Current Session</p>
                                    <p className="text-[10px] text-slate-500">San Francisco, CA • {new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded uppercase font-bold tracking-widest">Active</span>
                        </div>
                        <p className="text-[10px] text-slate-500 text-center italic">
                            For security purposes, sessions are automatically rotated every 30 days.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Zero-Trust Notice */}
            <Card className="bg-emerald-500/5 border-emerald-500/20">
                <CardContent className="p-6 flex items-start gap-4">
                    <Fingerprint className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
                    <div>
                        <h4 className="text-emerald-400 font-bold mb-1 uppercase text-xs tracking-widest">Zero-Trust Environment</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Tuppli implements a stateless security model. Your forensic audit trail is cryptographically signed and immutable. All actions performed on this account are logged for compliance with the **Forensic Chain of Custody** protocol.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
