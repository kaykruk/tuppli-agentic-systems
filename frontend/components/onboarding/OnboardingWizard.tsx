'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import StepTierSelection from './StepTierSelection'
import StepProfileSetup from './StepProfileSetup'
import StepFirstUpload from './StepFirstUpload'
import StepCompletion from './StepCompletion'
import { completeOnboarding, type OnboardingData } from '@/app/(dashboard)/actions'

export default function OnboardingWizard() {
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [data, setData] = useState<OnboardingData>({
        tier: null,
        username: '',
        bio: '',
        socials: {}
    })

    const nextStep = () => setStep(s => s + 1)
    const prevStep = () => setStep(s => s - 1)

    const updateData = (newData: Partial<OnboardingData>) => {
        setData(prev => ({ ...prev, ...newData }))
    }

    const handleFinish = async () => {
        setIsSubmitting(true)
        try {
            // Validation
            if (!data.tier) {
                toast.error('Please select a tier')
                setStep(1)
                return
            }
            if (!data.username) {
                toast.error('Username is required')
                setStep(2)
                return
            }

            const result = await completeOnboarding(data)
            if (result.success) {
                nextStep() // Go to completion step (4)
            } else {
                toast.error(result.error || 'Failed to complete onboarding')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                        Welcome to Tuppli
                    </h1>
                    <span className="text-sm text-gray-400">Step {step} of 4</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 4) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {step === 1 && (
                        <StepTierSelection
                            selectedTier={data.tier}
                            onSelect={(tier) => updateData({ tier })}
                            onNext={nextStep}
                        />
                    )}
                    {step === 2 && (
                        <StepProfileSetup
                            data={data}
                            onUpdate={updateData}
                            onNext={nextStep}
                            onBack={prevStep}
                        />
                    )}
                    {step === 3 && (
                        <StepFirstUpload
                            onNext={handleFinish}
                            onBack={prevStep}
                        />
                    )}
                    {step === 4 && (
                        <StepCompletion />
                    )}
                </motion.div>
            </AnimatePresence>
            {isSubmitting && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}
        </div>
    )
}
