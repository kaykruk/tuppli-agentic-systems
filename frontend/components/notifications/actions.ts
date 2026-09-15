'use server'

import { createClient } from '@/lib/supabase/server'

export interface Notification {
    id: string
    created_at: string
    title: string
    message: string
    type: 'info' | 'warning' | 'success' | 'error'
    read: boolean
    link?: string
}

export async function getNotifications(limit = 10) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching notifications:', error)
        return []
    }

    return data as Notification[]
}

export async function markNotificationAsRead(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

    return { success: !error, error: error?.message }
}

export async function markAllNotificationsAsRead() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('tenant_id', user.id)
        .eq('read', false)

    return { success: !error, error: error?.message }
}

export async function getUnreadCount() {
    const supabase = await createClient()
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('read', false)

    if (error) return 0
    return count || 0
}
