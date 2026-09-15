'use client'

import { useState } from 'react'
import { forgotPassword } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await forgotPassword(email)
            if (result.success) {
                setSuccess(true)
                toast.success('Reset link sent!')
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-8 max-w-md w-full mx-auto mt-20">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                <p className="text-slate-400">Enter your email to receive a reset link</p>
            </div>

            {success ? (
                <div className="text-center space-y-4">
                    <div className="bg-green-500/20 p-4 rounded-lg text-green-400">
                        Check your email for a link to reset your password.
                    </div>
                    <Link href="/login">
                        <Button variant="outline" className="w-full">
                            Back to Login
                        </Button>
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? 'Sending Link...' : 'Send Reset Link'}
                    </Button>

                    <div className="text-center mt-4">
                        <Link href="/login" className="text-sm text-slate-400 hover:text-white">
                            Back to Login
                        </Link>
                    </div>
                </form>
            )}
        </div>
    )
}
