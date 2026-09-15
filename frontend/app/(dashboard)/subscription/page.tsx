'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { Check, X } from 'lucide-react';
import Image from 'next/image';

// Token is NEXT_PUBLIC — safe to expose in frontend code
const PADDLE_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || 'live_c932908ab58ce7fe0db446cd82b';

const plans = [
    {
        name: 'Pro',
        price: 99.50,
        description: 'For independent creators, artists, and educators protecting their livelihood.',
        badge: null,
        highlight: false,
        plan: 'pro',
        priceId: 'pri_01knpaft4jammxq4yh6cf0k9w7',
        features: [
            { name: 'Fully Automated Sit Back & Relax', included: true },
            { name: 'DMCA Takedowns', included: true },
            { name: 'Social Media Removals', included: true },
            { name: 'Deepfake & AI Detection', included: true },
            { name: 'Hourly Surface Web Scanning', included: true },
            { name: 'Deep Web & Telegram Scans', included: true },
            { name: 'Unlimited DMCA Auto-Generation', included: true },
            { name: 'Anti-Impersonator Enforcement', included: true },
            { name: 'Worldwide Coverage', included: true },
            { name: '1 Stagename', included: true },
        ],
        cta: 'Protect My Content',
        disabled: false,
    },
    {
        name: 'Elite',
        price: 259.5,
        description: 'Advanced forensic protection for high-value brands and digital entrepreneurs.',
        badge: 'Most Protected',
        highlight: true,
        plan: 'elite',
        priceId: 'pri_01knpa68f3kd6vge2tkyfc0tcw',
        features: [
            { name: 'Everything in Pro', included: true },
            { name: '3 Stagenames', included: true },
            { name: 'Fan Traffic & Revenue Tool', included: true },
            { name: 'Google & Bing De-indexing', included: true },
            { name: 'Forensic Watermarking & Traitor Tracing', included: true },
            { name: 'Forensic Evidence Vault (Court-Ready)', included: true },
            { name: 'Priority Enforcement Queue', included: true },
            { name: 'Brand Understanding', included: true },
            { name: 'Automatic Released Content Tracking', included: true },
            { name: 'Doxing & Stalking Protection', included: true },
        ],
        cta: 'Get Elite Protection',
        disabled: false,
    },
    {
        name: 'Enterprise',
        price: 0,
        description: 'For management companies protecting entire rosters.',
        badge: 'Management',
        highlight: false,
        plan: 'enterprise',
        priceId: null,
        features: [
            { name: 'Everything in Elite', included: true },
            { name: 'Unlimited Creator Roster', included: true },
            { name: 'White-Label ROI Reports', included: true },
            { name: 'Custom Workflow Automation', included: true },
            { name: 'Dedicated Legal Engineer', included: true },
        ],
        cta: 'Contact Us',
        disabled: false,
    },
];

export default function SubscriptionPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const paddleReady = useRef(false);
    const supabase = createClient();

    useEffect(() => {
        // Get current user
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setUserId(user.id);
        });

        // Load Paddle.js v2 directly via script tag — bypassing the npm package
        if ((window as any).Paddle) {
            // Already loaded (e.g. hot reload)
            (window as any).Paddle.Initialize({ token: PADDLE_TOKEN });
            paddleReady.current = true;
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
        script.async = true;
        script.onload = () => {
            const Paddle = (window as any).Paddle;
            if (Paddle) {
                Paddle.Initialize({ token: PADDLE_TOKEN });
                paddleReady.current = true;
                console.log('[Paddle] Loaded and initialized');
            } else {
                console.error('[Paddle] Script loaded but Paddle object not found');
            }
        };
        script.onerror = () => {
            console.error('[Paddle] Failed to load paddle.js from CDN');
        };
        document.head.appendChild(script);
    }, []);

    const handleUpgrade = async (planName: string) => {
        const selectedPlan = plans.find(p => p.plan === planName);
        if (!selectedPlan) return;

        // Enterprise → contact page
        if (planName === 'enterprise' || !selectedPlan.priceId) {
            window.location.href = '/contact';
            return;
        }

        const Paddle = (window as any).Paddle;

        if (!Paddle || !paddleReady.current) {
            alert('Payment system is loading — please wait a moment and try again.');
            return;
        }

        setLoading(planName);
        try {
            Paddle.Checkout.open({
                settings: {
                    displayMode: 'overlay',
                    theme: 'dark',
                    locale: 'en',
                    showAddDiscounts: false,
                },
                items: [{ priceId: selectedPlan.priceId, quantity: 1 }],
                customData: { userId, plan: planName },
            });
        } catch (err) {
            console.error('[Paddle] Checkout.open error:', err);
            alert('An error occurred opening checkout. Please try again.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="text-center mb-12">
                <div className="flex justify-center mb-10">
                    <div className="relative w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl overflow-hidden">
                        <Image src="/logo.png" alt="Tuppli" fill className="object-contain p-2" priority />
                    </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tighter text-slate-900 leading-none">Select a Plan</h1>
                <p className="text-slate-500 font-bold text-sm md:text-lg max-w-xl mx-auto uppercase tracking-widest">
                    Simple, transparent pricing for every creator.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {plans.map((plan) => (
                    <Card
                        key={plan.name}
                        className={`relative flex flex-col rounded-[2.5rem] overflow-hidden transition-all duration-500 ${
                            plan.highlight
                                ? 'border-4 border-blue-600 shadow-2xl shadow-blue-200 scale-[1.05] z-10'
                                : 'border border-slate-200 shadow-sm hover:border-slate-300'
                        }`}
                    >
                        {plan.badge && (
                            <div className="absolute top-6 right-6">
                                <Badge className="bg-blue-600 text-white px-4 py-1 text-[8px] font-black uppercase tracking-widest rounded-full">
                                    {plan.badge}
                                </Badge>
                            </div>
                        )}

                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <CardTitle className={`text-xl font-black uppercase tracking-tight ${plan.highlight ? 'text-blue-600' : 'text-slate-900'}`}>
                                    {plan.name}
                                </CardTitle>
                            </div>
                            <CardDescription className="text-sm min-h-[40px]">{plan.description}</CardDescription>
                        </CardHeader>

                        <CardContent className="flex-1">
                            <div className="mb-6 flex items-baseline gap-1">
                                <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                                    {plan.price === 0 ? 'Custom' : `$${plan.price}`}
                                </span>
                                {plan.price !== 0 && (
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">/month</span>
                                )}
                            </div>

                            <ul className="space-y-4">
                                {plan.features.map((feature) => (
                                    <li key={feature.name} className="flex items-start gap-3">
                                        {feature.included ? (
                                            <Check className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                        ) : (
                                            <X className="h-4 w-4 text-slate-200 mt-0.5 shrink-0" />
                                        )}
                                        <span className={`text-[11px] font-bold uppercase tracking-tight ${feature.included ? 'text-slate-600' : 'text-slate-300'}`}>
                                            {feature.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter className="pt-4">
                            <Button
                                className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${
                                    plan.highlight
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200'
                                        : 'bg-slate-900 hover:bg-black text-white'
                                }`}
                                onClick={() => handleUpgrade(plan.plan)}
                                disabled={plan.disabled || loading === plan.plan}
                            >
                                {loading === plan.plan ? 'Connecting...' : plan.cta}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
