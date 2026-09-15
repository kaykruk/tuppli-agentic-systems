'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('tuppli-cookie-consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('tuppli-cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('tuppli-cookie-consent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 z-50 shadow-2xl">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-300">
                    <p>
                        We use essential cookies to ensure security and functionality. We do not track you for advertising.
                        By using Tuppli, you agree to our <Link href="/privacy-policy" className="text-cyan-400 hover:underline">Privacy Policy</Link> and <Link href="/terms-of-service" className="text-cyan-400 hover:underline">Terms of Service</Link>.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDecline}
                        className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-4 py-2 text-sm bg-cyan-500 hover:bg-cyan-600 text-white rounded-md font-medium transition-colors shadow-lg shadow-cyan-500/20"
                    >
                        Accept & Continue
                    </button>
                </div>
            </div>
        </div>
    );
}
