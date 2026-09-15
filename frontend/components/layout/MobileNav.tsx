"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { name: "Revenue Recovery", href: "/revenue", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { name: "Connect & API", href: "/integrations", icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" },
    { name: "Billing & Plans", href: "/subscription", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
    { name: "Settings", href: "/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
]

export interface MobileNavProps {
    user: any
    tier: string
}

export function MobileNav({ user, tier }: MobileNavProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [open, setOpen] = useState(false)

    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Agent'
    const isTwitter = user.app_metadata?.provider === 'twitter' || user.identities?.some((i: any) => i.provider === 'twitter')
    const twitterAvatar = isTwitter
        ? (user.user_metadata?.avatar_url || user.user_metadata?.picture || user.identities?.find((i: any) => i.provider === 'twitter')?.identity_data?.avatar_url)
        : null

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-slate-900 border-r border-slate-800 p-0 flex flex-col">
                {/* Profile header */}
                <div className="p-8 border-b border-slate-800">
                    <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                    >
                        <div className="relative w-12 h-12 shrink-0">
                            {twitterAvatar ? (
                                <Image
                                    src={twitterAvatar}
                                    alt="Profile"
                                    fill
                                    className="object-cover rounded-xl"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
                                    {(displayName.charAt(0) || user.email?.charAt(0))?.toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-black text-white truncate leading-tight uppercase tracking-tighter">{displayName}</h1>
                            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-0.5">{tier} TIER</p>
                        </div>
                    </Link>
                </div>

                {/* Nav links */}
                <nav className="flex flex-col p-4 space-y-2 flex-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-4 rounded-2xl transition-all text-[11px] font-black uppercase tracking-widest",
                                pathname === item.href
                                    ? "bg-blue-600 text-white shadow-xl shadow-blue-900/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
                            </svg>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Logout button at the bottom */}
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-red-900/40 hover:text-red-400 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
