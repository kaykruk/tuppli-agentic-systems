'use client'

import { formatDistanceToNow } from 'date-fns'
import { Bell, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Notification } from './actions'

interface NotificationItemProps {
    notification: Notification
    onRead: (id: string) => void
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
    const Icon = () => {
        switch (notification.type) {
            case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />
            case 'error': return <XCircle className="h-4 w-4 text-red-500" />
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
            default: return <Info className="h-4 w-4 text-blue-500" />
        }
    }

    return (
        <div
            className={cn(
                "p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer",
                !notification.read && "bg-gray-800/20"
            )}
            onClick={() => onRead(notification.id)}
        >
            <div className="flex gap-3">
                <div className="mt-1">
                    <Icon />
                </div>
                <div className="flex-1 space-y-1">
                    <p className={cn("text-sm font-medium leading-none", !notification.read && "text-white")}>
                        {notification.title}
                    </p>
                    <p className="text-xs text-gray-400">
                        {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                </div>
                {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                )}
            </div>
        </div>
    )
}
