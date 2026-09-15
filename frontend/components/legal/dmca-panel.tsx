'use client'

import { useState, useEffect, useTransition } from 'react'
import {
    submitDmcaNotice,
    getDmcaTemplates,
    checkEscalation,
    updateCaseStatus,
    getDmcaTimeline,
    triggerDeindexing,
} from '@/app/(dashboard)/actions'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DmcaTemplate {
    id: string
    platform: string
    method: string
    submission_url: string
    response_time_days: number
}

interface CaseMilestone {
    date: string
    action: string
    details: string
    actor: string
}

// ---------------------------------------------------------------------------
// Platform icons (inline SVG for minimal deps)
// ---------------------------------------------------------------------------

const PLATFORM_ICONS: Record<string, string> = {
    google: '🔍',
    instagram: '📸',
    twitter: '🐦',
    tiktok: '🎵',
    reddit: '🤖',
    onlyfans: '💎',
    filehosting: '📁',
}

const METHOD_LABELS: Record<string, { label: string; color: string }> = {
    webform: { label: 'Web Form', color: '#3b82f6' },
    email: { label: 'Email', color: '#a855f7' },
    api: { label: 'API', color: '#22c55e' },
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    open: { bg: '#1e3a5f', text: '#60a5fa', label: 'Open' },
    notice_sent: { bg: '#3b2f0a', text: '#fbbf24', label: 'Notice Sent' },
    pending_response: { bg: '#2e1065', text: '#a78bfa', label: 'Pending Response' },
    escalated: { bg: '#450a0a', text: '#f87171', label: 'Escalated' },
    resolved: { bg: '#052e16', text: '#4ade80', label: 'Resolved' },
    closed: { bg: '#1f2937', text: '#9ca3af', label: 'Closed' },
}

// ---------------------------------------------------------------------------
// Component: DMCA Submission Panel
// ---------------------------------------------------------------------------

interface DmcaPanelProps {
    evidenceId: string
    evidenceName: string
    sourceUrl: string
    /** If a case already exists, show timeline instead of submission form */
    existingCaseId?: string
    /** Current user tier — non-Pro users see an upgrade prompt */
    userTier?: 'pro' | 'elite' | 'enterprise'
}

export function DmcaPanel({ evidenceId, evidenceName, sourceUrl, existingCaseId, userTier = 'elite' }: DmcaPanelProps) {
    const isElite = userTier === 'elite' || userTier === 'pro' || userTier === 'enterprise'
    const [templates, setTemplates] = useState<DmcaTemplate[]>([])
    const [selectedPlatform, setSelectedPlatform] = useState('')
    const [copyrightOwner, setCopyrightOwner] = useState('')
    const [originalUrl, setOriginalUrl] = useState('')
    const [noticePreview, setNoticePreview] = useState('')
    const [submissionResult, setSubmissionResult] = useState<{
        success: boolean
        case_id?: string
        message?: string
    } | null>(null)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState('')

    // Timeline state (for existing cases)
    const [milestones, setMilestones] = useState<CaseMilestone[]>([])
    const [escalation, setEscalation] = useState<{
        needs_escalation: boolean
        recommended_action?: { label: string; action: string }
        days_since_notice: number
    } | null>(null)
    const [caseId, setCaseId] = useState(existingCaseId || '')

    // Load templates on mount
    useEffect(() => {
        startTransition(async () => {
            const result = await getDmcaTemplates()
            if (result.templates.length > 0) {
                setTemplates(result.templates)
            }
        })
    }, [])

    // Load timeline for existing cases
    useEffect(() => {
        if (caseId) {
            startTransition(async () => {
                const [timelineResult, escalationResult] = await Promise.all([
                    getDmcaTimeline(caseId),
                    checkEscalation(caseId),
                ])
                setMilestones(timelineResult.milestones)
                if (escalationResult.escalation) {
                    setEscalation({
                        needs_escalation: escalationResult.escalation.needs_escalation,
                        recommended_action: escalationResult.escalation.recommended_action || undefined,
                        days_since_notice: escalationResult.escalation.days_since_notice,
                    })
                }
            })
        }
    }, [caseId])

    // Handle submission
    const handleSubmit = () => {
        if (!selectedPlatform) {
            setError('Select a platform')
            return
        }
        setError('')
        startTransition(async () => {
            const result = await submitDmcaNotice(
                evidenceId,
                selectedPlatform,
                copyrightOwner || undefined,
                originalUrl || undefined
            )
            if (result.success) {
                setSubmissionResult({
                    success: true,
                    case_id: result.case_id,
                    message: result.submission?.message,
                })
                setCaseId(result.case_id || '')
                setNoticePreview(result.submission?.notice_text || '')
            } else {
                setError(result.error || 'Failed to submit notice')
            }
        })
    }

    // Handle de-indexing
    const handleDeindex = (engine: string) => {
        startTransition(async () => {
            const result = await triggerDeindexing(evidenceId, engine)
            if (!result.success) {
                setError(result.error || 'De-indexing failed')
            }
        })
    }

    // Handle inline status update
    const handleStatusUpdate = (newStatus: string) => {
        if (!caseId) return
        startTransition(async () => {
            const result = await updateCaseStatus(caseId, newStatus)
            if (result.success) {
                // Reload timeline
                const timeline = await getDmcaTimeline(caseId)
                setMilestones(timeline.milestones)
            }
        })
    }

    return (
        <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div>
                    <h3 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 700, margin: 0 }}>
                        ⚖️ DMCA Enforcement
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0' }}>
                        {evidenceName} — <span style={{ color: '#818cf8' }}>{sourceUrl}</span>
                    </p>
                </div>
                {escalation?.needs_escalation && (
                    <div style={{
                        background: '#450a0a',
                        color: '#f87171',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        animation: 'pulse 2s infinite',
                    }}>
                        ⚠️ Escalation Needed ({escalation.days_since_notice}d)
                    </div>
                )}
            </div>

            {/* Elite-only gate */}
            {!isElite && (
                <div style={{
                    padding: '32px 24px',
                    textAlign: 'center',
                    background: 'rgba(139, 92, 246, 0.04)',
                }}>
                    <div style={{
                        fontSize: '48px',
                        marginBottom: '12px',
                    }}>🔒</div>
                    <h4 style={{
                        color: '#e2e8f0',
                        fontSize: '16px',
                        fontWeight: 700,
                        margin: '0 0 8px',
                    }}>
                        Elite Feature
                    </h4>
                    <p style={{
                        color: '#94a3b8',
                        fontSize: '13px',
                        margin: '0 0 16px',
                        maxWidth: '360px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        lineHeight: 1.5,
                    }}>
                        DMCA automation, search engine de-indexing, and escalation tracking require an Elite subscription.
                    </p>
                    <a
                        href="/subscription"
                        style={{
                            display: 'inline-block',
                            background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 24px',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '14px',
                            textDecoration: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Upgrade to Elite →
                    </a>
                </div>
            )}

            {/* Submission Form (if no case yet) */}
            {isElite && !caseId && !submissionResult && (
                <div style={{ padding: '20px 24px' }}>
                    {/* Platform Selector */}
                    <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Target Platform
                    </label>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                        gap: '8px',
                        margin: '8px 0 16px',
                    }}>
                        {templates.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedPlatform(t.id)}
                                style={{
                                    background: selectedPlatform === t.id
                                        ? 'rgba(139, 92, 246, 0.3)'
                                        : 'rgba(255,255,255,0.04)',
                                    border: selectedPlatform === t.id
                                        ? '1px solid #8b5cf6'
                                        : '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '10px',
                                    padding: '10px 12px',
                                    color: '#e2e8f0',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'all 0.2s ease',
                                    fontSize: '13px',
                                }}
                            >
                                <span style={{ fontSize: '20px' }}>{PLATFORM_ICONS[t.id] || '📋'}</span>
                                <span style={{ fontWeight: 500, fontSize: '12px' }}>{t.platform.split(' / ')[0]}</span>
                                <span style={{
                                    fontSize: '10px',
                                    color: METHOD_LABELS[t.method]?.color || '#94a3b8',
                                    fontWeight: 600,
                                }}>
                                    {METHOD_LABELS[t.method]?.label || t.method} · ~{t.response_time_days}d
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Optional fields */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>
                                Copyright Owner (optional)
                            </label>
                            <input
                                value={copyrightOwner}
                                onChange={(e) => setCopyrightOwner(e.target.value)}
                                placeholder="Your legal name"
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    color: '#e2e8f0',
                                    fontSize: '13px',
                                    outline: 'none',
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>
                                Original Content URL (optional)
                            </label>
                            <input
                                value={originalUrl}
                                onChange={(e) => setOriginalUrl(e.target.value)}
                                placeholder="https://..."
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    color: '#e2e8f0',
                                    fontSize: '13px',
                                    outline: 'none',
                                }}
                            />
                        </div>
                    </div>

                    {/* Error display */}
                    {error && (
                        <div style={{
                            background: '#450a0a', color: '#f87171', padding: '8px 12px',
                            borderRadius: '8px', fontSize: '13px', marginBottom: '12px',
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={handleSubmit}
                            disabled={isPending || !selectedPlatform}
                            style={{
                                flex: 1,
                                background: isPending ? '#4338ca' : 'linear-gradient(135deg, #7c3aed, #6366f1)',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '10px 16px',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '14px',
                                cursor: isPending ? 'wait' : 'pointer',
                                opacity: !selectedPlatform ? 0.5 : 1,
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {isPending ? '⏳ Generating Notice...' : '⚖️ Submit DMCA Notice'}
                        </button>

                        <button
                            onClick={() => handleDeindex('google')}
                            disabled={isPending}
                            style={{
                                background: 'rgba(59, 130, 246, 0.15)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '10px',
                                padding: '10px 16px',
                                color: '#60a5fa',
                                fontWeight: 500,
                                fontSize: '13px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            🔍 De-index (Google)
                        </button>

                        <button
                            onClick={() => handleDeindex('bing')}
                            disabled={isPending}
                            style={{
                                background: 'rgba(34, 197, 94, 0.1)',
                                border: '1px solid rgba(34, 197, 94, 0.25)',
                                borderRadius: '10px',
                                padding: '10px 16px',
                                color: '#4ade80',
                                fontWeight: 500,
                                fontSize: '13px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            🌐 De-index (Bing)
                        </button>
                    </div>
                </div>
            )}

            {/* Submission Result / Notice Preview */}
            {(submissionResult || noticePreview) && !caseId && (
                <div style={{ padding: '20px 24px' }}>
                    <div style={{
                        background: 'rgba(34, 197, 94, 0.08)',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        marginBottom: '12px',
                    }}>
                        <p style={{ color: '#4ade80', fontSize: '14px', fontWeight: 600, margin: 0 }}>
                            ✅ DMCA Notice Generated
                        </p>
                        <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0' }}>
                            {submissionResult?.message}
                        </p>
                    </div>
                    {noticePreview && (
                        <pre style={{
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '8px',
                            padding: '12px',
                            color: '#cbd5e1',
                            fontSize: '11px',
                            lineHeight: 1.5,
                            overflow: 'auto',
                            maxHeight: '200px',
                            whiteSpace: 'pre-wrap',
                        }}>
                            {noticePreview}
                        </pre>
                    )}
                </div>
            )}

            {/* Case Timeline (for existing cases) */}
            {caseId && milestones.length > 0 && (
                <div style={{ padding: '20px 24px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px',
                    }}>
                        <h4 style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 600, margin: 0 }}>
                            📋 Case Timeline
                        </h4>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {['pending_response', 'escalated', 'resolved', 'closed'].map((s) => {
                                const style = STATUS_STYLES[s]
                                return (
                                    <button
                                        key={s}
                                        onClick={() => handleStatusUpdate(s)}
                                        disabled={isPending}
                                        style={{
                                            background: style.bg,
                                            color: style.text,
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '4px 8px',
                                            fontSize: '11px',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {style.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Timeline entries */}
                    <div style={{ position: 'relative', paddingLeft: '24px' }}>
                        {/* Vertical line */}
                        <div style={{
                            position: 'absolute',
                            left: '7px',
                            top: 0,
                            bottom: 0,
                            width: '2px',
                            background: 'rgba(139, 92, 246, 0.2)',
                        }} />

                        {milestones.map((m, i) => (
                            <div key={i} style={{ position: 'relative', marginBottom: '16px' }}>
                                {/* Timeline dot */}
                                <div style={{
                                    position: 'absolute',
                                    left: '-20px',
                                    top: '4px',
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: i === milestones.length - 1 ? '#8b5cf6' : '#475569',
                                    border: '2px solid #0f172a',
                                }} />
                                <div>
                                    <p style={{
                                        color: '#e2e8f0',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        margin: 0,
                                    }}>
                                        {m.details}
                                    </p>
                                    <p style={{
                                        color: '#64748b',
                                        fontSize: '11px',
                                        margin: '2px 0 0',
                                    }}>
                                        {new Date(m.date).toLocaleString()} · {m.action}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Escalation recommendation */}
                    {escalation?.recommended_action && escalation.needs_escalation && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '10px',
                            padding: '12px 16px',
                            marginTop: '8px',
                        }}>
                            <p style={{ color: '#f87171', fontSize: '13px', fontWeight: 600, margin: 0 }}>
                                🚨 Recommended: {escalation.recommended_action.label}
                            </p>
                            <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0' }}>
                                {escalation.days_since_notice} days since notice was sent. Action: {escalation.recommended_action.action}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
