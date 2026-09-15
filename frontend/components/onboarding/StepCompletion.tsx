'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function StepCompletion() {
    return (
        <div className="text-center py-12 space-y-6">
            <div className="flex justify-center">
                <div className="bg-green-500/20 p-4 rounded-full">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
            </div>

            <h2 className="text-3xl font-bold">You're All Set!</h2>
            <p className="text-gray-400 max-w-md mx-auto">
                Your account is configured and ready to go. Welcome to Tuppli.
            </p>

            <div className="pt-6">
                <Link href="/dashboard">
                    <Button size="lg" className="px-8">Go to Dashboard</Button>
                </Link>
            </div>
        </div>
    )
}
