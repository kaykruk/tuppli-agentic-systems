'use client'

import { Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface StepTierSelectionProps {
    selectedTier: 'pro' | 'elite' | 'enterprise' | null
    onSelect: (tier: 'pro' | 'elite' | 'enterprise') => void
    onNext: () => void
}

const tiers = [
    {
        id: 'pro',
        name: 'Pro',
        price: '$249',
        features: ['Unlimited Surface Web Scanning', 'Deep Web & Telegram Scans', 'DMCA Automation', 'Social Media Removals', 'Escalation Tracking'],
        color: 'border-blue-500'
    },
    {
        id: 'elite',
        name: 'Elite',
        price: '$449',
        features: ['Everything in Pro', 'Google & Bing De-indexing', 'Deepfake AI Detection', 'Forensic Watermarking', 'Forensic Evidence Vault'],
        color: 'border-purple-500'
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 'Custom',
        features: ['Everything in Elite', 'Unlimited Creator Roster', 'Dedicated Legal Engineer', 'Custom Workflows'],
        color: 'border-yellow-500'
    }
] as const

export default function StepTierSelection({ selectedTier, onSelect, onNext }: StepTierSelectionProps) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Choose Your Protection Level</h2>
                <p className="text-gray-400">Select a plan that fits your needs. You can upgrade anytime.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tiers.map((tier) => (
                    <Card
                        key={tier.id}
                        className={cn(
                            "p-6 cursor-pointer transition-all border-2 bg-gray-900/50 hover:bg-gray-900",
                            selectedTier === tier.id ? tier.color + " bg-gray-900" : "border-transparent"
                        )}
                        onClick={() => onSelect(tier.id)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold">{tier.name}</h3>
                                <span className="text-2xl font-bold text-gray-200">{tier.price}{tier.price !== 'Custom' && <span className="text-sm font-normal text-gray-400">/mo</span>}</span>
                            </div>
                            {selectedTier === tier.id && (
                                <div className="bg-green-500/20 text-green-500 p-1 rounded-full">
                                    <Check size={20} />
                                </div>
                            )}
                        </div>
                        <ul className="space-y-2">
                            {tier.features.map((feature, i) => (
                                <li key={i} className="flex items-center text-sm text-gray-300">
                                    <Check size={16} className="mr-2 text-blue-500" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </Card>
                ))}
            </div>

            <div className="flex justify-end pt-6">
                <Button
                    onClick={onNext}
                    disabled={!selectedTier}
                    className="w-full md:w-auto"
                >
                    Continue
                </Button>
            </div>
        </div>
    )
}

