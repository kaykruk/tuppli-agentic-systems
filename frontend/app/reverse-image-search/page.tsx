import ReverseImageClient from './reverse-image-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Free Reverse Image Search | Tuppli',
    description: 'Upload any image and find where it appears across the web, dark web, and social platforms. Free for creators.',
}

export default function ReverseImagePage() {
    return <ReverseImageClient />
}
