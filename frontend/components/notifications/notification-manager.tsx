'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function NotificationManager() {
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const setupRealtime = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.user) return

            // Get tenant_id for the current user
            const { data: tenant } = await supabase
                .from('tenants')
                .select('id')
                .eq('user_id', session.user.id)
                .single()

            if (!tenant) return

            // Subscribe to INSERT events on the notifications table for this tenant
            const channel = supabase
                .channel('realtime-notifications')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `tenant_id=eq.${tenant.id}`
                    },
                    (payload) => {
                        const newNotification = payload.new as any

                        // Display toast notification
                        toast(newNotification.title, {
                            description: newNotification.message,
                            duration: 5000,
                            action: {
                                label: 'View',
                                onClick: () => router.push('/notifications')
                            },
                        })
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }

        setupRealtime()
    }, [supabase, router])

    return null
}
