import ScannerClient from './scanner-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Free Deep Web Leak Scan | Tuppli',
    description: 'Find out if your paid content has been leaked to the dark web, Reddit, or piracy sites. Free automated scan.',
}

export default function FreeScanPage() {
    return <ScannerClient />
}
