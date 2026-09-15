'use client'

import { useState, useCallback } from 'react'
import { Upload, Image, Video, Lock, CheckCircle, Clock, AlertCircle, X, Fingerprint, Trash2, Mic, UserCheck } from 'lucide-react'
import { generatePHash, type PHashResult } from '@/lib/phash'
import { createVaultItem, deleteVaultItem } from '../actions'

interface VaultItem {
    id: string
    item_name: string
    item_type: string
    category: string | null
    sync_status: string
    created_at: string
    phash?: string
}

const typeConfig = {
    master_image: { icon: Image, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    master_video: { icon: Video, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    master_audio: { icon: Mic, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    voice_signature: { icon: Fingerprint, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    likeness_map: { icon: UserCheck, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    other: { icon: Lock, color: 'text-slate-400', bg: 'bg-slate-500/10' },
}

const syncConfig = {
    synced: { icon: CheckCircle, color: 'text-green-400' },
    pending: { icon: Clock, color: 'text-yellow-400' },
    failed: { icon: AlertCircle, color: 'text-red-400' },
}

interface UploadingFile {
    file: File
    preview: string
    status: 'hashing' | 'uploading' | 'done' | 'error'
    progress: number
    phash?: PHashResult
    error?: string
}

export function VaultClient({ items: initialItems }: { items: VaultItem[] }) {
    const [items, setItems] = useState(initialItems)
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
    const [isDragging, setIsDragging] = useState(false)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const processFile = async (file: File) => {
        // Create preview
        const preview = URL.createObjectURL(file)

        const uploadFile: UploadingFile = {
            file,
            preview,
            status: 'hashing',
            progress: 0
        }

        setUploadingFiles(prev => [...prev, uploadFile])

        try {
            // Generate pHash
            const phash = await generatePHash(file)

            setUploadingFiles(prev => prev.map(f =>
                f.file === file ? { ...f, phash, status: 'uploading', progress: 50 } : f
            ))

            // Create vault item
            const result = await createVaultItem({
                item_name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
                item_type: file.type.startsWith('video/') ? 'master_video' : 'master_image',
                phash: phash.hash,
                phash_variants: { original: phash.hash },
                original_filename: file.name,
                original_mime_type: file.type,
            })

            if (result.success) {
                setUploadingFiles(prev => prev.map(f =>
                    f.file === file ? { ...f, status: 'done', progress: 100 } : f
                ))

                // Add to items list
                setItems(prev => [{
                    id: result.id!,
                    item_name: file.name.replace(/\.[^/.]+$/, ''),
                    item_type: file.type.startsWith('video/') ? 'master_video' : 'master_image',
                    category: null,
                    sync_status: 'synced',
                    created_at: new Date().toISOString(),
                    phash: phash.hash
                }, ...prev])

                // Remove from uploading after delay
                setTimeout(() => {
                    setUploadingFiles(prev => prev.filter(f => f.file !== file))
                }, 2000)
            } else {
                throw new Error(result.error)
            }
        } catch (error) {
            setUploadingFiles(prev => prev.map(f =>
                f.file === file ? { ...f, status: 'error', error: (error as Error).message } : f
            ))
        }
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const files = Array.from(e.dataTransfer.files).filter(
            file => file.type.startsWith('image/') || file.type.startsWith('video/')
        )

        files.forEach(processFile)
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        files.forEach(processFile)
    }

    const handleDelete = async (id: string) => {
        const result = await deleteVaultItem(id)
        if (result.success) {
            setItems(prev => prev.filter(item => item.id !== id))
        }
    }

    const removeUploadingFile = (file: File) => {
        setUploadingFiles(prev => prev.filter(f => f.file !== file))
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Master Vault</h1>
                    <p className="text-gray-400">Upload media to generate fingerprints for content protection</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <Fingerprint className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-300">{items.length} fingerprints</span>
                    </div>
                </div>
            </div>

            {/* Upload Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all mb-8 ${isDragging
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                    }`}
            >
                <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4">
                    <Upload className={`w-8 h-8 ${isDragging ? 'text-purple-400' : 'text-gray-400'}`} />
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">
                    {isDragging ? 'Drop files here' : 'Upload Master Media'}
                </h3>
                <p className="text-gray-400 text-sm">
                    Drag & drop images or videos, or click to browse
                </p>
                <p className="text-gray-500 text-xs mt-2">
                    Files are fingerprinted locally — originals are never stored
                </p>
            </div>

            {/* Uploading Files */}
            {uploadingFiles.length > 0 && (
                <div className="mb-8 space-y-3">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Processing</h3>
                    {uploadingFiles.map((uf, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-4">
                                <img
                                    src={uf.phash?.thumbnail || uf.preview}
                                    alt=""
                                    className="w-12 h-12 rounded-lg object-cover bg-black/50"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">{uf.file.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {uf.status === 'hashing' && (
                                            <span className="text-xs text-yellow-400">Generating fingerprint...</span>
                                        )}
                                        {uf.status === 'uploading' && (
                                            <span className="text-xs text-blue-400">Saving to vault...</span>
                                        )}
                                        {uf.status === 'done' && (
                                            <span className="text-xs text-green-400 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Complete
                                            </span>
                                        )}
                                        {uf.status === 'error' && (
                                            <span className="text-xs text-red-400">{uf.error}</span>
                                        )}
                                    </div>
                                    {uf.phash && (
                                        <p className="text-xs text-gray-500 font-mono mt-1">
                                            pHash: {uf.phash.hash}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => removeUploadingFile(uf.file)}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            {uf.status !== 'done' && uf.status !== 'error' && (
                                <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                                        style={{ width: `${uf.progress}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Vault Items Grid */}
            {items.length === 0 ? (
                <div className="text-center py-16 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-16 h-16 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Vault is empty</h3>
                    <p className="text-gray-400 max-w-sm mx-auto">
                        Upload your master media to generate fingerprints for protection
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(item => {
                        const config = typeConfig[item.item_type as keyof typeof typeConfig] || typeConfig.other
                        const sync = syncConfig[item.sync_status as keyof typeof syncConfig] || syncConfig.pending
                        const ItemIcon = config.icon
                        const SyncIcon = sync.icon

                        return (
                            <div
                                key={item.id}
                                className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[0.07] transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center`}>
                                        <ItemIcon className={`w-6 h-6 ${config.color}`} />
                                    </div>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <h3 className="text-white font-medium mb-1 truncate">{item.item_name}</h3>
                                <p className="text-gray-500 text-sm capitalize mb-3">
                                    {item.item_type.replace('_', ' ')}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className={`flex items-center gap-1.5 text-xs ${sync.color}`}>
                                        <SyncIcon className="w-3.5 h-3.5" />
                                        <span className="capitalize">{item.sync_status}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                {item.phash && (
                                    <div className="mt-3 pt-3 border-t border-white/5">
                                        <p className="text-xs text-gray-500 font-mono truncate">
                                            {item.phash}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
