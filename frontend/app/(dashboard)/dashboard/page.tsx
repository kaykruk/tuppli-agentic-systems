import { getDashboardStats, getRecentDetections, getCurrentTenant, getReconTargets, getForensicEvidence } from '../actions'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
    const [stats, recentDetections, tenant, allTargets, allEvidence] = await Promise.all([
        getDashboardStats(),
        getRecentDetections(),
        getCurrentTenant(),
        getReconTargets(),
        getForensicEvidence(),
    ])

    return (
        <DashboardClient
            stats={stats}
            recentDetections={recentDetections}
            tenant={tenant}
            allTargets={allTargets}
            allEvidence={allEvidence}
        />
    )
}
