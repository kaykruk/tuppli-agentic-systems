import ShadowbanClient from './shadowban-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Free Shadowban Tester | Tuppli',
    description: 'Check if Twitter, Instagram, or TikTok are suppressing your account. Free instant results for creators.',
}

export default function ShadowbanCheckPage() {
    return <ShadowbanClient />
}
