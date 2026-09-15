'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from './actions'
import { toast } from 'sonner'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
    Shield, ArrowRight, User, Plus, 
    X, Sparkles, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function OnboardingPage() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        displayName: '',
        targetUsername: '',
        platform: 'instagram',
        persona: 'premium_creator',
        variations: ['']
    })

    const router = useRouter()

    const addVariation = () => {
        setFormData(prev => ({
            ...prev,
            variations: [...prev.variations, '']
        }))
    }

    const removeVariation = (index: number) => {
        setFormData(prev => ({
            ...prev,
            variations: prev.variations.filter((_, i) => i !== index)
        }))
    }

    const updateVariation = (index: number, value: string) => {
        const newVariations = [...formData.variations]
        newVariations[index] = value
        setFormData(prev => ({ ...prev, variations: newVariations }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.displayName) {
            toast.error('Please enter your brand name')
            return
        }

        setLoading(true)
        try {
            const cleanVariations = formData.variations.filter(v => v.trim() !== '')
            
            const result = await completeOnboarding({
                ...formData,
                variations: cleanVariations
            } as any)

            if (result.success) {
                toast.success('Ready to go!')
                router.push('/dashboard')
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Left Side: Simple Form */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-20 lg:px-32 py-16">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full mx-auto"
                >
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 relative">
                                <Image 
                                    src="/logo.png" 
                                    alt="Tuppli Logo" 
                                    fill 
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-xl font-black tracking-tighter text-slate-900">TUPPLI</span>
                        </div>
                        
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-3">
                            First, what is your <span className="text-cyan-600 italic font-medium">Brand Name?</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">
                            * Also known as "Stage Name", "Alias" or "Username"
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Primary Brand Name */}
                        <div className="space-y-3">
                            <Input
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                required
                                className="h-16 px-6 bg-white border-slate-200 text-lg text-slate-900 rounded-2xl font-semibold focus:ring-2 focus:ring-cyan-500 shadow-sm transition-all"
                                placeholder="ex.: Jane Doe"
                            />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-2">min. 3 char.</p>
                        </div>

                        {/* Brand Variations */}
                        <div className="space-y-5">
                            <div className="flex justify-between items-end mb-2">
                                <h2 className="text-xl font-bold text-slate-800">Do you go by any <span className="text-cyan-600">other variation?</span></h2>
                            </div>
                            
                            <div className="space-y-4">
                                {formData.variations.map((v, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="relative group"
                                    >
                                        <Input
                                            value={v}
                                            onChange={(e) => updateVariation(i, e.target.value)}
                                            className="h-14 px-6 bg-slate-50/50 border-slate-200 text-slate-900 rounded-xl font-medium focus:ring-cyan-500 shadow-inner group-hover:bg-white transition-all"
                                            placeholder={`ex.: Jane_Doe_${i + 2}`}
                                        />
                                        {formData.variations.length > 1 && (
                                            <button 
                                                type="button"
                                                onClick={() => removeVariation(i)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-400 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                                
                                <button
                                    type="button"
                                    onClick={addVariation}
                                    className="flex items-center gap-2 text-xs font-bold text-cyan-600 hover:text-cyan-700 transition-colors pl-2"
                                >
                                    <Plus className="w-3 h-3" />
                                    Add more variations
                                </button>
                            </div>
                        </div>

                        {/* Hidden/Simple Social Handle (Necessary for Logic) */}
                        <div className="pt-4 border-t border-slate-100">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Final Check: Main Platform</label>
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">@</span>
                                    <Input
                                        value={formData.targetUsername}
                                        onChange={(e) => setFormData({ ...formData, targetUsername: e.target.value.replace('@', '') })}
                                        required
                                        className="h-14 pl-10 bg-white border-slate-200 text-slate-900 rounded-xl font-bold focus:ring-cyan-500 shadow-sm transition-all"
                                        placeholder="username"
                                    />
                                </div>
                                <select
                                    value={formData.platform}
                                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                    className="h-14 bg-white border border-slate-200 text-slate-900 rounded-xl px-4 font-bold text-xs uppercase focus:ring-indigo-500 outline-none shadow-sm transition-all hover:border-cyan-300"
                                >
                                    <option value="instagram">Instagram</option>
                                    <option value="twitter">X (Twitter)</option>
                                    <option value="onlyfans">OnlyFans</option>
                                    <option value="fansly">Fansly</option>
                                    <option value="patreon">Patreon</option>
                                    <option value="gumroad">Gumroad</option>
                                    <option value="twitch">Twitch</option>
                                    <option value="custom">Other / Custom</option>
                                </select>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !formData.displayName}
                            className="w-full h-16 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            {loading ? 'Starting scan...' : 'Next'}
                            <ChevronRight className="w-4 h-4" />
                        </Button>

                        <p className="text-center text-slate-400 text-xs font-medium">
                            More variations help us find more stolen content — but you can always add them later.
                        </p>
                    </form>
                </motion.div>
            </div>

            {/* Right Side: Visual Panel */}
            <div className="hidden md:flex flex-[0.8] relative bg-cyan-50 overflow-hidden m-6 rounded-[2.5rem]">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex flex-col justify-end p-12 text-white">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl transition-transform hover:scale-[1.02]">
                        <p className="text-lg font-bold leading-sneg mb-2">
                            Find out exactly where your content is being stolen — and how much it's costing you.
                        </p>
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                     <div className="w-full h-full bg-cyan-400 opacity-50" />
                                </div>
                            ))}
                            <div className="flex items-center ml-4 text-[10px] font-bold text-white/80">12,000+ creators protected</div>
                        </div>
                    </div>
                </div>
                <Image
                    src="/onboarding_hero.png"
                    alt="Tuppli Creator"
                    fill
                    className="object-cover object-center"
                    priority
                />
            </div>
        </div>
    )
}
