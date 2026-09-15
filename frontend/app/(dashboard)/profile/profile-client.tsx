'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, Check, Clock, AlertCircle, Plus, Trash2, RefreshCw } from 'lucide-react'
import type { ProfileData, AuthorizedAccount } from './actions'
import { addAuthorizedAccount, deleteAuthorizedAccount, verifyAccountWithCode, updateProfile } from './actions'

const PLATFORMS = [
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'onlyfans', label: 'OnlyFans' },
    { value: 'fansly', label: 'Fansly' },
    { value: 'reddit', label: 'Reddit' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'website', label: 'Personal Website' },
    { value: 'other', label: 'Other' },
]

const TIER_COLORS = {
    pro: 'bg-blue-500',
    elite: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    enterprise: 'bg-purple-500',
}

export default function ProfileClient({
    profile,
    accounts
}: {
    profile: ProfileData
    accounts: AuthorizedAccount[]
}) {
    const [displayName, setDisplayName] = useState(profile.display_name || '')
    const [isEditing, setIsEditing] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleUpdateProfile = async () => {
        setLoading(true)
        try {
            await updateProfile(displayName)
            setIsEditing(false)
        } catch (error) {
            console.error('Failed to update profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const tierName = profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-black mb-8 uppercase tracking-tight">Mission Profile</h1>

            {/* Profile Card */}
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 md:p-8 mb-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-6">
                        <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-2xl md:text-3xl font-black text-white">
                                {displayName?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div className="min-w-0">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full text-lg font-bold border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-1.5 bg-transparent focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            ) : (
                                <h2 className="text-xl font-black text-slate-900 truncate">{displayName || 'Agent'}</h2>
                            )}
                            <p className="text-sm text-slate-500 font-medium truncate">{profile.email}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={loading}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 shadow-lg"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full sm:w-auto px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {/* Subscription Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 border-t border-slate-100 dark:border-slate-700">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subscription Tier</p>
                        <div className="flex items-center gap-2">
                            <span className={`px-4 py-1.5 ${TIER_COLORS[profile.tier as keyof typeof TIER_COLORS]} text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm`}>
                                {tierName}
                            </span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Credits Remaining</p>
                        <p className="text-3xl font-black text-slate-900">{profile.credits_remaining.toLocaleString()}</p>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                        <Link 
                            href="/subscription"
                            className="w-full px-6 py-3 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-100 transition-all text-center flex items-center justify-center gap-2"
                        >
                            <Shield className="w-4 h-4" />
                            Manage Subscription
                        </Link>
                    </div>
                </div>
            </div>

            {/* Authorized Accounts */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold mb-1">Authorized Accounts</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Verify your social media accounts to enable accurate leak detection
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Account
                    </button>
                </div>

                {accounts.length === 0 ? (
                    <div className="text-center py-12 text-slate-600 dark:text-slate-400">
                        <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No accounts added yet</p>
                        <p className="text-sm">Add your social media accounts to get started</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {accounts.map((account) => (
                            <AccountCard key={account.id} account={account} />
                        ))}
                    </div>
                )}
            </div>

            {showAddModal && (
                <AddAccountModal onClose={() => setShowAddModal(false)} />
            )}
        </div>
    )
}

function AccountCard({ account }: { account: AuthorizedAccount }) {
    const [verifying, setVerifying] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const handleVerify = async () => {
        setVerifying(true)
        try {
            await verifyAccountWithCode(account.id)
            window.location.reload()
        } catch (error) {
            console.error('Verification failed:', error)
        } finally {
            setVerifying(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Remove this account?')) return
        setDeleting(true)
        try {
            await deleteAuthorizedAccount(account.id)
            window.location.reload()
        } catch (error) {
            console.error('Delete failed:', error)
        } finally {
            setDeleting(false)
        }
    }

    const statusIcon = {
        verified: <Check className="w-5 h-5 text-green-500" />,
        pending: <Clock className="w-5 h-5 text-yellow-500" />,
        failed: <AlertCircle className="w-5 h-5 text-red-500" />
    }[account.verification_status]

    return (
        <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="flex items-center gap-4">
                {statusIcon}
                <div>
                    <div className="font-medium">
                        {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)} - @{account.username}
                    </div>
                    {account.verification_status === 'pending' && account.verification_code && (
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Add <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">{account.verification_code}</code> to your bio
                        </div>
                    )}
                    {account.verification_status === 'verified' && account.verified_at && (
                        <div className="text-sm text-green-600 dark:text-green-400">
                            Verified {new Date(account.verified_at).toLocaleDateString()}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {account.verification_status === 'pending' && (
                    <button
                        onClick={handleVerify}
                        disabled={verifying}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
                        Verify
                    </button>
                )}
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

function AddAccountModal({ onClose }: { onClose: () => void }) {
    const [platform, setPlatform] = useState('')
    const [username, setUsername] = useState('')
    const [profileUrl, setProfileUrl] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await addAuthorizedAccount(platform, username, profileUrl)
            window.location.reload()
        } catch (error) {
            console.error('Failed to add account:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Add Social Account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Platform</label>
                        <select
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent"
                        >
                            <option value="">Select platform...</option>
                            {PLATFORMS.map((p) => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="your_username"
                            required
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Profile URL</label>
                        <input
                            type="url"
                            value={profileUrl}
                            onChange={(e) => setProfileUrl(e.target.value)}
                            placeholder="https://platform.com/your_username"
                            required
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
