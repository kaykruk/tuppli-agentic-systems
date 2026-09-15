import { getLegalCases } from '../actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Scale, Clock, Send, AlertTriangle, CheckCircle, Archive, XCircle } from 'lucide-react'

const statusConfig = {
    open: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
    notice_sent: { icon: Send, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
    pending_response: { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
    escalated: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
    resolved: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
    closed: { icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/30' },
    archived: { icon: Archive, color: 'text-slate-500', bg: 'bg-slate-600/10 border-slate-600/30' },
}

const priorityColors = {
    low: 'text-slate-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    critical: 'text-red-400',
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

export default async function CasesPage() {
    const cases = await getLegalCases()

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Legal Cases</h1>
                    <p className="text-slate-400">DMCA and enforcement case tracking</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    + New Case
                </Button>
            </div>

            {cases.length === 0 ? (
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Scale className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No cases yet</h3>
                        <p className="text-slate-400">Legal cases will be created automatically when threats are confirmed</p>
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">All Cases ({cases.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-700">
                                    <TableHead className="text-slate-400">Case #</TableHead>
                                    <TableHead className="text-slate-400">Name</TableHead>
                                    <TableHead className="text-slate-400">Type</TableHead>
                                    <TableHead className="text-slate-400">Platform</TableHead>
                                    <TableHead className="text-slate-400">Priority</TableHead>
                                    <TableHead className="text-slate-400">Status</TableHead>
                                    <TableHead className="text-slate-400">Deadline</TableHead>
                                    <TableHead className="text-slate-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cases.map((caseItem) => {
                                    const status = statusConfig[caseItem.status as keyof typeof statusConfig] || statusConfig.open
                                    const StatusIcon = status.icon
                                    return (
                                        <TableRow key={caseItem.id} className="border-slate-700">
                                            <TableCell className="text-slate-300 font-mono text-sm">{caseItem.case_number}</TableCell>
                                            <TableCell className="text-white font-medium">{caseItem.case_name}</TableCell>
                                            <TableCell className="text-slate-400 uppercase text-xs">{caseItem.case_type}</TableCell>
                                            <TableCell className="text-blue-400">{caseItem.platform || '-'}</TableCell>
                                            <TableCell>
                                                <span className={`font-semibold capitalize ${priorityColors[caseItem.priority as keyof typeof priorityColors] || 'text-slate-400'}`}>
                                                    {caseItem.priority}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border ${status.bg}`}>
                                                    <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                                                    <span className={status.color}>{caseItem.status.replace('_', ' ')}</span>
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-slate-400 text-sm">
                                                {caseItem.deadline_date ? (
                                                    <span className={new Date(caseItem.deadline_date) < new Date() ? 'text-red-400' : ''}>
                                                        {formatDate(caseItem.deadline_date)}
                                                    </span>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm" className="text-blue-400 border-blue-400/50">
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
