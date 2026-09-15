'use client'

import { Button } from '@/components/ui/button'

interface StepFirstUploadProps {
    onNext: () => void
    onBack: () => void
}

export default function StepFirstUpload({ onNext, onBack }: StepFirstUploadProps) {
    return (
        <div className="space-y-6 max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-2">Protect Your First Content</h2>
            <p className="text-gray-400">Upload an image or video to secure it immediately.</p>

            <div className="border-2 border-dashed border-gray-700 rounded-xl p-12 bg-gray-900/30">
                <p className="text-gray-500">Drag and drop file here, or click to upload</p>
                <Button className="mt-4" variant="secondary">Select File</Button>
            </div>

            <div className="flex justify-between pt-6">
                <Button variant="ghost" onClick={onBack}>Back</Button>
                <Button onClick={onNext}>Skip for now</Button>
            </div>
        </div>
    )
}
