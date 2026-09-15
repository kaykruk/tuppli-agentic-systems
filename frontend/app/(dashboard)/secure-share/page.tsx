'use client'

import { useState } from 'react'
import { Upload, ShieldCheck, Lock, Download, AlertCircle, CheckCircle, Loader2, Sparkles, Share2, Globe, FileVideo, FileImage, FileMusic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { secureAndDistribute } from '../forensic-actions'

export default function SecureSharePage() {
    const [file, setFile] = useState<File | null>(null)
    const [recipientId, setRecipientId] = useState('')
    const [platform, setPlatform] = useState('of')
    const [isProcessing, setIsProcessing] = useState(false)
    const [downloadData, setDownloadData] = useState<{ filename: string; base64: string; mimeType: string } | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setDownloadData(null)
            toast.success('Media loaded for forensic scan')
        }
    }

    const handleHarden = async () => {
        if (!file) return
        setIsProcessing(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('recipientId', recipientId || 'anonymous_viewer')
        formData.append('platform', platform)

        try {
            const result = await secureAndDistribute(formData)
            if (result.success && result.base64) {
                setDownloadData({
                    filename: result.filename!,
                    base64: result.base64,
                    mimeType: result.mimeType!
                })
                toast.success('Forensic hardening complete!')
            } else {
                toast.error(result.error || 'Hardening failed')
            }
        } catch (e) {
            toast.error('Connection failed to forensic service')
        } finally {
            setIsProcessing(false)
        }
    }

    const downloadFile = () => {
        if (!downloadData) return
        const link = document.createElement('a')
        link.href = `data:${downloadData.mimeType};base64,${downloadData.base64}`
        link.download = downloadData.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setFile(null)
        setDownloadData(null)
        setRecipientId('')
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                    <ShieldCheck className="w-10 h-10 text-blue-500" />
                    Secure Distribution Portal
                </h1>
                <p className="text-slate-400 text-lg">
                    Harden your images, videos, or audio tracks with invisible forensic watermarking.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs font-medium text-green-400">
                    <Sparkles className="w-3 h-3" />
                    ZERO-STORAGE: Original files are automatically purged after processing
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload & Configure */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">1. Configure Forensic ID</CardTitle>
                        <CardDescription className="text-slate-500">
                            Identify the specific distribution target for this copy.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Dropzone */}
                        <div className="relative border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-blue-500 transition-all cursor-pointer bg-slate-900/50">
                            <input
                                type="file"
                                accept="image/*,video/*,audio/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {file ? (
                                <div className="space-y-2">
                                    {file.type.startsWith('video/') ? (
                                        <FileVideo className="w-10 h-10 mx-auto text-blue-400" />
                                    ) : file.type.startsWith('audio/') ? (
                                        <FileMusic className="w-10 h-10 mx-auto text-purple-400" />
                                    ) : (
                                        <FileImage className="w-10 h-10 mx-auto text-blue-400" />
                                    )}
                                    <div className="text-white font-medium truncate">{file.name}</div>
                                    <div className="text-slate-500 text-xs uppercase">Target: {(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                                </div>
                            ) : (
                                <div className="text-slate-400">
                                    <Upload className="w-10 h-10 mx-auto mb-3 text-slate-500" />
                                    <p className="font-medium">Click or Drag & Drop Media</p>
                                    <p className="text-xs mt-2 text-slate-600 uppercase">Resilient to Platform Re-encoding</p>
                                </div>
                            )}
                        </div>

                        {/* Recipient ID */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Recipient ID / Subscriber Name (Optional)</label>
                            <input
                                type="text"
                                value={recipientId}
                                onChange={(e) => setRecipientId(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-700"
                                placeholder="e.g. subscriber_123 or track_release_v1"
                            />
                            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                                For musicians: Use a unique ID for each record label or distribution partner.
                            </p>
                        </div>

                        {/* Platform Presets */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Target Platform</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['OnlyFans', 'Patreon', 'SoundCloud', 'Spotify', 'Direct', 'Other'].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPlatform(p.toLowerCase())}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${platform === p.toLowerCase() ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button 
                            className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 disabled:bg-slate-700"
                            disabled={!file || isProcessing || !!downloadData}
                            onClick={handleHarden}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                    INJECTING FORENSIC ID...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5 mr-3" />
                                    HARDEN FILE FOR SHARE
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Status & Download */}
                <div className="space-y-6">
                    {/* Security Logic Explanation */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white text-md flex items-center gap-2">
                                <Share2 className="w-4 h-4" />
                                Why use Secure Share?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <Globe className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-white text-sm font-medium">Platform Resilience</h4>
                                    <p className="text-slate-500 text-xs">Our IDs are embedded in pixel and PCM data, surviving the re-encoding meat grinder of OnlyFans and SoundCloud.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-4 h-4 text-purple-400" />
                                </div>
                                <div>
                                    <h4 className="text-white text-sm font-medium">Legal Traitor Tracing</h4>
                                    <p className="text-slate-500 text-xs">If a pirate leaks a track, Tuppli identifies the exact source, providing court-ready proof of breach of contract.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Download Card */}
                    {downloadData && (
                        <Card className="bg-green-500/5 border-green-500/20 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl shadow-green-500/10">
                            <CardHeader>
                                <CardTitle className="text-green-400 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Forensic Copy Ready
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-slate-300 text-sm">
                                    Download your hardened file. Upload this specific copy to <strong>{platform}</strong> for maximum protection.
                                </p>
                                <Button 
                                    className="w-full py-8 text-xl bg-green-600 hover:bg-green-700 shadow-xl shadow-green-600/20"
                                    onClick={downloadFile}
                                >
                                    <Download className="w-6 h-6 mr-3" />
                                    DOWNLOAD PROTECTED COPY
                                </Button>
                                <p className="text-[10px] text-slate-500 text-center uppercase">
                                    The original file has been deleted from Tuppli's secure memory.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
