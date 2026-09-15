'use client'

import { usePathname } from 'next/navigation'
import { UpgradeBanner } from '@/components/layout/UpgradeBanner'

export function DashboardContent({ 
    children, 
    isUnpaid, 
    isUnverified 
}: { 
    children: React.ReactNode, 
    isUnpaid: boolean, 
    isUnverified: boolean 
}) {
    const pathname = usePathname()
    // Only blur for unverified email — unpaid users can now see everything
    const shouldBlur = isUnverified
    
    return (
        <>
            {isUnpaid && pathname !== '/subscription' && <UpgradeBanner />}
            <div className={`p-4 md:p-8 max-w-7xl mx-auto transition-all duration-500 ${shouldBlur ? 'blur-2xl pointer-events-none' : ''}`}>
                {children}
            </div>
        </>
    )
}
