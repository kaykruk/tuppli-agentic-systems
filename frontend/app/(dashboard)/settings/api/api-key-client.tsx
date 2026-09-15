'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
    Plus, Trash2, Key, Copy, Check, Eye, EyeOff, AlertTriangle, 
    ShieldAlert, Loader2, Calendar, Activity, Lock
} from 'lucide-react'
import { createApiKey, revokeApiKey } from '../../actions'
import { toast } from 'sonner'

interface ApiKey {
    id: string
    name: string
    key_prefix: string
    created_at: string
    last_used_at: string | null
}

interface ApiKeyClientProps {
    initialKeys: ApiKey[]
}

export function ApiKeyClient({ initialKeys }: ApiKeyClientProps) {
    const [keys, setKeys] = useState(initialKeys)
    const [isCreating, setIsCreating] = useState(false)
    const [newKeyName, setNewKeyName] = useState('')
    const [generatedKey, setGeneratedKey] = useState<string | null>(null)
    const [isRevoking, setIsRevoking] = useState<string | null>(null)

    const handleCreateKey = async () => {
        if (!newKeyName.trim()) {
            toast.error('Please name your API key')
            return
        }

        setIsCreating(true)
        try {
            const result = await createApiKey(newKeyName)
            if (result.success && result.key) {
                setGeneratedKey(result.key)
                toast.success('API Key generated successfully')
            } else {
                toast.error('Failed to generate key: ' + result.error)
            }
        } catch (e) {
            toast.error('An unexpected error occurred')
        } finally {
            setIsCreating(false)
        }
    }

    const handleRevoke = async (id: string) => {
        setIsRevoking(id)
        try {
            const result = await revokeApiKey(id)
            if (result.success) {
                setKeys(prev => prev.filter(k => k.id !== id))
                toast.success('API Key revoked instantly')
            } else {
                toast.error('Failed to revoke key: ' + result.error)
            }
        } catch (e) {
            toast.error('An unexpected error occurred')
        } finally {
            setIsRevoking(null)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard', { icon: <Check className="w-4 h-4" /> })
    }

    return (
        <div className="divide-y divide-slate-100 bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
            {/* New Key Section */}
            <div className={`p-8 transition-all ${generatedKey ? 'bg-indigo-50/50' : 'bg-slate-50/30'}`}>
                {generatedKey ? (
                    <div className="space-y-6 animate-in zoom-in duration-300">
                        <div className="flex items-center gap-3 text-indigo-700">
                            <ShieldAlert className="w-6 h-6 shadow-[0_0_10px_rgba(79,70,229,0.2)]" />
                            <span className="text-sm font-black uppercase tracking-widest">Secure Handshake: Store this key safely!</span>
                        </div>
                        <p className="text-slate-500 text-xs font-medium leading-relaxed">
                            This is a one-time cryptographic reveal. Tuppli does not store your raw keys. If lost, you must invalidate this node and generate a new secure connection.
                        </p>
                        <div className="flex gap-3">
                            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-emerald-400 text-sm break-all shadow-2xl">
                                {generatedKey}
                            </div>
                            <Button 
                                onClick={() => copyToClipboard(generatedKey)} 
                                className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 h-auto px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                            >
                                <Copy className="w-4 h-4 mr-2" /> Copy
                            </Button>
                        </div>
                        <Button 
                            variant="ghost" 
                            className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 hover:bg-white" 
                            onClick={() => { setGeneratedKey(null); setNewKeyName(''); }}
                        >
                            I have securely vaulted this key
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 w-full">
                            <Input 
                                placeholder="e.g. Tuppli Enforcement Hub / Global ROI Audit" 
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                className="bg-white border-slate-200 text-slate-900 h-14 rounded-2xl font-bold placeholder:text-slate-400 focus:ring-indigo-500 shadow-inner"
                            />
                        </div>
                        <Button 
                            onClick={handleCreateKey} 
                            disabled={isCreating}
                            className="bg-slate-900 hover:bg-black text-white h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 transition-all shrink-0"
                        >
                            {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <Plus className="w-4 h-4 mr-3" />}
                            Generate API Key
                        </Button>
                    </div>
                )}
            </div>

            {/* Keys Table / List */}
            <div className="overflow-hidden">
                {keys.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
                            <Lock className="w-8 h-8 text-slate-200" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">No Active Nodes</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Generate a key above to initiate connectivity.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {keys.map((key) => (
                            <div key={key.id} className="p-8 flex items-center justify-between group hover:bg-slate-50/50 transition-all cursor-pointer">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all shadow-sm">
                                        <Key className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-slate-900 font-black text-lg tracking-tight">{key.name}</div>
                                        <div className="flex flex-wrap items-center gap-6 text-[10px] uppercase font-black tracking-widest text-slate-400 mt-2">
                                            <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">{key.key_prefix}••••••••••••••••</span>
                                            <span className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Created {new Date(key.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-8">
                                    <div className="hidden lg:flex flex-col items-end">
                                        <div className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">Last Connectivity</div>
                                        <div className="text-xs text-slate-900 font-bold tabular-nums flex items-center gap-3">
                                            {key.last_used_at ? (
                                                <>
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                    {new Date(key.last_used_at).toLocaleString()}
                                                </>
                                            ) : (
                                                <span className="text-slate-300 italic font-medium uppercase tracking-widest text-[10px]">Never Synchronized</span>
                                            )}
                                        </div>
                                    </div>

                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-12 w-12 rounded-2xl text-slate-300 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-300"
                                        onClick={() => handleRevoke(key.id)}
                                        disabled={isRevoking === key.id}
                                    >
                                        {isRevoking === key.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
