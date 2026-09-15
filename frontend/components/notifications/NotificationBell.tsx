'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { NotificationItem } from './NotificationItem'
import { getNotifications, getUnreadCount, markNotificationAsRead, markAllNotificationsAsRead, type Notification } from './actions'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const supabase = createClient()

    const fetchNotifications = async () => {
        const data = await getNotifications()
        setNotifications(data || [])
        const count = await getUnreadCount()
        setUnreadCount(count)
    }

    useEffect(() => {
        fetchNotifications()

        // Subscribe to realtime changes
        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                },
                (payload) => {
                    const newNotification = payload.new as Notification
                    setNotifications((prev) => [newNotification, ...prev])
                    setUnreadCount((prev) => prev + 1)
                    toast(newNotification.title, {
                        description: newNotification.message,
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleMarkAsRead = async (id: string) => {
        await markNotificationAsRead(id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    const handleMarkAllRead = async () => {
        await markAllNotificationsAsRead()
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 border border-black" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-black border-gray-800" align="end">
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h4 className="font-semibold text-white">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-auto px-2 text-xs text-blue-400 hover:text-blue-300">
                            Mark all read
                        </Button>
                    )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onRead={handleMarkAsRead}
                            />
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
