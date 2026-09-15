'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import type { ReconTarget } from '../actions'
import { createReconTarget } from '../actions'
import { useRouter } from 'next/navigation'

interface TargetsClientProps {
    targets: ReconTarget[]
}

const statusIcons = {
    pending: <Clock className="w-4 h-4 text-yellow-400" />,
    scanning: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
    completed: <CheckCircle className="w-4 h-4 text-green-400" />,
    failed: <AlertCircle className="w-4 h-4 text-red-400" />,
}

const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    scanning: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    completed: 'bg-green-500/10 text-green-400 border-green-500/30',
    failed: 'bg-red-500/10 text-red-400 border-red-500/30',
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Never'
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function TargetsClient({ targets }: TargetsClientProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const result = await createReconTarget({
            target_name: formData.get('name') as string,
            target_type: formData.get('type') as string,
            target_value: formData.get('value') as string,
            priority: parseInt(formData.get('priority') as string) || 5,
        })

        setLoading(false)

        if (result.success) {
            setOpen(false)
            router.refresh()
        } else {
            setError(result.error || 'Failed to create target')
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Recon Targets</h1>
                    <p className="text-slate-400">Manage your reconnaissance targets</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Target
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700">
                        <DialogHeader>
                            <DialogTitle className="text-white">Add Recon Target</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div>
                                <Label htmlFor="name" className="text-slate-300">Target Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="e.g., My Creator Name"
                                    className="bg-slate-900/50 border-slate-600 text-white mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="type" className="text-slate-300">Target Type</Label>
                                <Select name="type" defaultValue="creator_name">
                                    <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        <SelectItem value="creator_name">Creator Name</SelectItem>
                                        <SelectItem value="domain">Domain</SelectItem>
                                        <SelectItem value="ip">IP Address</SelectItem>
                                        <SelectItem value="organization">Organization</SelectItem>
                                        <SelectItem value="person">Person</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="value" className="text-slate-300">Target Value</Label>
                                <Input
                                    id="value"
                                    name="value"
                                    required
                                    placeholder="e.g., @username or example.com"
                                    className="bg-slate-900/50 border-slate-600 text-white mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="priority" className="text-slate-300">Priority (1-10)</Label>
                                <Input
                                    id="priority"
                                    name="priority"
                                    type="number"
                                    min="1"
                                    max="10"
                                    defaultValue="5"
                                    className="bg-slate-900/50 border-slate-600 text-white mt-1"
                                />
                            </div>
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 rounded p-2">
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-600 text-slate-300">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Target'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {targets.length === 0 ? (
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No targets yet</h3>
                        <p className="text-slate-400 mb-6">Add your first recon target to start monitoring</p>
                        <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Target
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">All Targets ({targets.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-700">
                                    <TableHead className="text-slate-400">Name</TableHead>
                                    <TableHead className="text-slate-400">Type</TableHead>
                                    <TableHead className="text-slate-400">Value</TableHead>
                                    <TableHead className="text-slate-400">Status</TableHead>
                                    <TableHead className="text-slate-400">Priority</TableHead>
                                    <TableHead className="text-slate-400">Last Scanned</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {targets.map((target) => (
                                    <TableRow key={target.id} className="border-slate-700">
                                        <TableCell className="text-white font-medium">{target.target_name}</TableCell>
                                        <TableCell>
                                            <span className="text-slate-400 capitalize">{target.target_type.replace('_', ' ')}</span>
                                        </TableCell>
                                        <TableCell className="text-slate-300 font-mono text-sm">{target.target_value}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border ${statusColors[target.status as keyof typeof statusColors] || statusColors.pending}`}>
                                                {statusIcons[target.status as keyof typeof statusIcons] || statusIcons.pending}
                                                {target.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`font-semibold ${target.priority >= 8 ? 'text-red-400' : target.priority >= 5 ? 'text-yellow-400' : 'text-slate-400'}`}>
                                                {target.priority}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-slate-400 text-sm">{formatDate(target.last_scanned_at)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
