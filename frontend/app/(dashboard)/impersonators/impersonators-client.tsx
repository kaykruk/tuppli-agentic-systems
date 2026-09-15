'use client'

import { useState, useEffect } from 'react'
import {
    AlertTriangle,
    Shield,
    CheckCircle,
    XCircle,
    ExternalLink,
    Flag,
    Plus,
    Clock,
    Eye,
    Ban,
    ThumbsDown,
    Zap,
    ShieldCheck,
    Trash2,
    UserCheck
} from 'lucide-react'
import type { ImpersonatorAlert, AuthorizedAccount } from '../actions'
import { updateImpersonatorStatus, reportImpersonator, createManualImpersonatorAlert, getAuthorizedAccounts, createAuthorizedAccount, deleteAuthorizedAccount } from '../actions'

const PLATFORMS = [
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'onlyfans', label: 'OnlyFans' },
    { value: 'fansly', label: 'Fansly' },
    { value: 'pornhub', label: 'Pornhub' },
    { value: 'reddit', label: 'Reddit' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'other', label: 'Other' },
]

const STATUS_CONFIG = {
    pending: {
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        icon: Clock,
        label: 'Review Pending'
    },
    confirmed: {
        color: 'bg-red-500/20 text-red-400 border-red-500/30',
        icon: AlertTriangle,
        label: 'Confirmed Fake'
    },
    dismissed: {
        color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        icon: XCircle,
        label: 'Dismissed'
    },
    reported: {
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: Flag,
        label: 'Reported to Platform'
    },
    taken_down: {
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        icon: CheckCircle,
        label: 'Taken Down'
    },
}

export function ImpersonatorsClient({ alerts: initialAlerts }: { alerts: ImpersonatorAlert[] }) {
    const [alerts, setAlerts] = useState(initialAlerts)
    const [showAddModal, setShowAddModal] = useState(false)
    const [filter, setFilter] = useState<'all' | ImpersonatorAlert['status']>('all')
    const [selectedAlert, setSelectedAlert] = useState<ImpersonatorAlert | null>(null)
    const [verifiedAccounts, setVerifiedAccounts] = useState<AuthorizedAccount[]>([])
    const [showAddAccount, setShowAddAccount] = useState(false)
    const [newAccountPlatform, setNewAccountPlatform] = useState('twitter')
    const [newAccountUsername, setNewAccountUsername] = useState('')
    const [addingAccount, setAddingAccount] = useState(false)

    useEffect(() => {
        getAuthorizedAccounts().then(setVerifiedAccounts)
    }, [])

    const filteredAlerts = filter === 'all'
        ? alerts
        : alerts.filter(a => a.status === filter)

    const autoEscalatedCount = alerts.filter(a => a.auto_escalated).length

    const stats = {
        total: alerts.length,
        pending: alerts.filter(a => a.status === 'pending').length,
        confirmed: alerts.filter(a => a.status === 'confirmed').length,
        reported: alerts.filter(a => a.status === 'reported').length,
        takenDown: alerts.filter(a => a.status === 'taken_down').length,
    }

    async function handleAddAccount() {
        if (!newAccountUsername.trim()) return
        setAddingAccount(true)
        const result = await createAuthorizedAccount({
            platform: newAccountPlatform,
            username: newAccountUsername.replace('@', ''),
        })
        if (result.success) {
            const updated = await getAuthorizedAccounts()
            setVerifiedAccounts(updated)
            setNewAccountUsername('')
            setShowAddAccount(false)
        }
        setAddingAccount(false)
    }

    async function handleRemoveAccount(id: string) {
        await deleteAuthorizedAccount(id)
        setVerifiedAccounts(prev => prev.filter(a => a.id !== id))
    }

    return (
        <div className="space-y-6">
            {/* Auto-Protection Banner */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-white font-semibold">Auto-Protection Active</p>
                        <p className="text-gray-400 text-sm">
                            {verifiedAccounts.length} verified account{verifiedAccounts.length !== 1 ? 's' : ''} allowlisted
                            {autoEscalatedCount > 0 && ` • ${autoEscalatedCount} auto-escalated`}
                        </p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/30">
                    Real-time scanning
                </span>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Impersonator Detection</h1>
                    <p className="text-gray-400 mt-1">Autonomous detection — backup accounts are protected via allowlist</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Report Manually
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-5 gap-4">
                <StatCard label="Total Alerts" value={stats.total} icon={AlertTriangle} color="purple" />
                <StatCard label="Pending Review" value={stats.pending} icon={Clock} color="yellow" />
                <StatCard label="Confirmed" value={stats.confirmed} icon={Ban} color="red" />
                <StatCard label="Reported" value={stats.reported} icon={Flag} color="blue" />
                <StatCard label="Taken Down" value={stats.takenDown} icon={CheckCircle} color="green" />
            </div>

            {/* Verified Accounts (Allowlist) Section */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-lg font-semibold text-white">Verified Accounts (Allowlist)</h2>
                    </div>
                    <button
                        onClick={() => setShowAddAccount(!showAddAccount)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Backup
                    </button>
                </div>

                {showAddAccount && (
                    <div className="flex gap-2 mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                        <select
                            value={newAccountPlatform}
                            onChange={(e) => setNewAccountPlatform(e.target.value)}
                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        >
                            {PLATFORMS.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={newAccountUsername}
                            onChange={(e) => setNewAccountUsername(e.target.value)}
                            placeholder="@your_backup_username"
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm"
                        />
                        <button
                            onClick={handleAddAccount}
                            disabled={addingAccount || !newAccountUsername.trim()}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm disabled:opacity-50"
                        >
                            {addingAccount ? 'Adding...' : 'Verify & Add'}
                        </button>
                    </div>
                )}

                {verifiedAccounts.length === 0 ? (
                    <p className="text-gray-500 text-sm">No verified accounts yet. Add your backup accounts so they won&apos;t be flagged as impersonators.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {verifiedAccounts.map(acc => (
                            <div key={acc.id} className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                <UserCheck className="w-4 h-4 text-emerald-400" />
                                <span className="text-white text-sm font-medium">@{acc.username}</span>
                                <span className="text-xs text-gray-500 capitalize">{acc.platform}</span>
                                <button
                                    onClick={() => handleRemoveAccount(acc.id)}
                                    className="ml-1 text-gray-500 hover:text-red-400 transition-colors"
                                    title="Remove from allowlist"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-lg w-fit">
                {['all', 'pending', 'confirmed', 'reported', 'taken_down'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as typeof filter)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === f
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Alerts Grid */}
            {filteredAlerts.length === 0 ? (
                <EmptyState onAdd={() => setShowAddModal(true)} />
            ) : (
                <div className="grid gap-4">
                    {filteredAlerts.map((alert) => (
                        <AlertCard
                            key={alert.id}
                            alert={alert}
                            onView={() => setSelectedAlert(alert)}
                            onStatusChange={(status) => {
                                updateImpersonatorStatus(alert.id, status)
                                setAlerts(prev => prev.map(a =>
                                    a.id === alert.id ? { ...a, status } : a
                                ))
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {showAddModal && (
                <AddAlertModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={(newAlert) => {
                        setAlerts(prev => [newAlert, ...prev])
                        setShowAddModal(false)
                    }}
                />
            )}

            {selectedAlert && (
                <AlertDetailModal
                    alert={selectedAlert}
                    onClose={() => setSelectedAlert(null)}
                    onStatusChange={(status) => {
                        updateImpersonatorStatus(selectedAlert.id, status)
                        setAlerts(prev => prev.map(a =>
                            a.id === selectedAlert.id ? { ...a, status } : a
                        ))
                        setSelectedAlert(null)
                    }}
                    onReport={() => {
                        reportImpersonator(selectedAlert.id)
                        setAlerts(prev => prev.map(a =>
                            a.id === selectedAlert.id ? { ...a, status: 'reported', reported_at: new Date().toISOString() } : a
                        ))
                        setSelectedAlert(null)
                    }}
                />
            )}
        </div>
    )
}

function StatCard({ label, value, icon: Icon, color }: {
    label: string
    value: number
    icon: React.ElementType
    color: 'purple' | 'yellow' | 'red' | 'blue' | 'green'
}) {
    const colorClasses = {
        purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400',
        yellow: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/20 text-yellow-400',
        red: 'from-red-500/20 to-red-600/5 border-red-500/20 text-red-400',
        blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
        green: 'from-green-500/20 to-green-600/5 border-green-500/20 text-green-400',
    }

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4`}>
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span className="text-2xl font-bold text-white">{value}</span>
            </div>
            <p className="text-sm mt-1 opacity-80">{label}</p>
        </div>
    )
}

function AlertCard({ alert, onView, onStatusChange }: {
    alert: ImpersonatorAlert
    onView: () => void
    onStatusChange: (status: ImpersonatorAlert['status']) => void
}) {
    const statusConfig = STATUS_CONFIG[alert.status]
    const StatusIcon = statusConfig.icon

    const signalCount = alert.detection_signals
        ? Object.values(alert.detection_signals).filter(Boolean).length
        : 0

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[0.07] transition-all">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    {/* Platform Icon / Avatar */}
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">@{alert.fake_username || 'Unknown'}</span>
                            <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-gray-400 capitalize">
                                {alert.platform}
                            </span>
                        </div>

                        {alert.fake_profile_url && (
                            <a
                                href={alert.fake_profile_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-gray-500 hover:text-purple-400 flex items-center gap-1 mt-1"
                            >
                                View Profile <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Similarity Score */}
                    {alert.similarity_score !== null && (
                        <div className="text-center">
                            <div className="text-lg font-bold text-red-400">
                                {Math.round(alert.similarity_score * 100)}%
                            </div>
                            <div className="text-xs text-gray-500">Match</div>
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${statusConfig.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">{statusConfig.label}</span>
                    </div>
                </div>
            </div>

            {/* Detection Signals */}
            {signalCount > 0 && (
                <div className="mt-4 flex gap-2 flex-wrap">
                    {alert.detection_signals?.username_match && (
                        <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20">
                            Username Match
                        </span>
                    )}
                    {alert.detection_signals?.photo_match && (
                        <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20">
                            Photo Match
                        </span>
                    )}
                    {alert.detection_signals?.bio_match && (
                        <span className="px-2 py-1 bg-orange-500/10 text-orange-400 text-xs rounded border border-orange-500/20">
                            Bio Match
                        </span>
                    )}
                    {alert.detection_signals?.content_match && (
                        <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded border border-yellow-500/20">
                            Content Match
                        </span>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                    Detected {new Date(alert.created_at).toLocaleDateString()}
                    {alert.auto_escalated && (
                        <span className="ml-2 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[10px] font-medium uppercase">Auto ⚡</span>
                    )}
                </span>

                <div className="flex gap-2">
                    <button
                        onClick={onView}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                        <Eye className="w-4 h-4" />
                        Details
                    </button>

                    {alert.status === 'pending' && (
                        <>
                            <button
                                onClick={() => onStatusChange('reported')}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                            >
                                <Flag className="w-4 h-4" />
                                Report Now
                            </button>
                            <button
                                onClick={() => onStatusChange('dismissed')}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 hover:bg-white/5 rounded-lg transition-all"
                            >
                                <ThumbsDown className="w-4 h-4" />
                                Dismiss
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="text-center py-16 bg-white/5 rounded-xl border border-white/10">
            <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">No Impersonators Detected</h3>
            <p className="text-gray-400 mt-2 max-w-sm mx-auto">
                Our AI continuously monitors for fake accounts. You can also manually report suspicious profiles.
            </p>
            <button
                onClick={onAdd}
                className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
            >
                Report Suspicious Account
            </button>
        </div>
    )
}

function AddAlertModal({ onClose, onSuccess }: {
    onClose: () => void
    onSuccess: (alert: ImpersonatorAlert) => void
}) {
    const [platform, setPlatform] = useState('twitter')
    const [username, setUsername] = useState('')
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!username.trim()) return

        setLoading(true)
        setError('')

        const result = await createManualImpersonatorAlert({
            platform,
            fake_username: username.replace('@', ''),
            fake_profile_url: url || undefined
        })

        if (result.success) {
            // Create a temporary alert for immediate UI update
            const tempAlert: ImpersonatorAlert = {
                id: crypto.randomUUID(),
                platform,
                fake_username: username.replace('@', ''),
                fake_profile_url: url || null,
                fake_profile_image_url: null,
                similarity_score: null,
                detection_signals: { username_match: true },
                status: 'pending',
                reported_at: null,
                report_status: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
            onSuccess(tempAlert)
        } else {
            setError(result.error || 'Failed to create alert')
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a2e] rounded-xl border border-white/10 w-full max-w-md">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">Report Suspicious Account</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Manually report an account you believe is impersonating you
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
                        <select
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        >
                            {PLATFORMS.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="@fake_account"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Profile URL (optional)</label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-400">{error}</p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !username.trim()}
                            className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function AlertDetailModal({ alert, onClose, onStatusChange, onReport }: {
    alert: ImpersonatorAlert
    onClose: () => void
    onStatusChange: (status: ImpersonatorAlert['status']) => void
    onReport: () => void
}) {
    const statusConfig = STATUS_CONFIG[alert.status]

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a2e] rounded-xl border border-white/10 w-full max-w-lg">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Alert Details</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                        </span>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Account Info */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white">@{alert.fake_username}</h3>
                            <p className="text-gray-400 capitalize">{alert.platform}</p>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Detected</p>
                            <p className="text-white mt-1">{new Date(alert.created_at).toLocaleString()}</p>
                        </div>
                        {alert.similarity_score !== null && (
                            <div className="bg-white/5 rounded-lg p-4">
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Similarity</p>
                                <p className="text-red-400 text-xl font-bold mt-1">{Math.round(alert.similarity_score * 100)}%</p>
                            </div>
                        )}
                        {alert.reported_at && (
                            <div className="bg-white/5 rounded-lg p-4">
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Reported</p>
                                <p className="text-white mt-1">{new Date(alert.reported_at).toLocaleString()}</p>
                            </div>
                        )}
                        {alert.report_status && (
                            <div className="bg-white/5 rounded-lg p-4">
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Report Status</p>
                                <p className="text-white mt-1 capitalize">{alert.report_status}</p>
                            </div>
                        )}
                    </div>

                    {/* Detection Signals */}
                    {alert.detection_signals && Object.values(alert.detection_signals).some(Boolean) && (
                        <div>
                            <p className="text-sm font-medium text-gray-300 mb-2">Detection Signals</p>
                            <div className="flex gap-2 flex-wrap">
                                {alert.detection_signals.username_match && (
                                    <span className="px-3 py-1.5 bg-red-500/10 text-red-400 text-sm rounded border border-red-500/20">
                                        Username Match
                                    </span>
                                )}
                                {alert.detection_signals.photo_match && (
                                    <span className="px-3 py-1.5 bg-red-500/10 text-red-400 text-sm rounded border border-red-500/20">
                                        Photo Match
                                    </span>
                                )}
                                {alert.detection_signals.bio_match && (
                                    <span className="px-3 py-1.5 bg-orange-500/10 text-orange-400 text-sm rounded border border-orange-500/20">
                                        Bio Match
                                    </span>
                                )}
                                {alert.detection_signals.content_match && (
                                    <span className="px-3 py-1.5 bg-yellow-500/10 text-yellow-400 text-sm rounded border border-yellow-500/20">
                                        Content Match
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Profile Link */}
                    {alert.fake_profile_url && (
                        <a
                            href={alert.fake_profile_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View Fake Profile
                        </a>
                    )}
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-white/10 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 transition-all"
                    >
                        Close
                    </button>

                    {alert.status === 'pending' && (
                        <>
                            <button
                                onClick={() => onStatusChange('dismissed')}
                                className="px-4 py-3 border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 transition-all"
                            >
                                Dismiss
                            </button>
                            <button
                                onClick={onReport}
                                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Flag className="w-4 h-4" />
                                Report to Platform
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
