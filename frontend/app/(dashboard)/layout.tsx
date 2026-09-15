import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getCurrentTenant } from './actions'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { MobileNav } from '@/components/layout/MobileNav'
import { DashboardGate } from '@/components/layout/DashboardGate'
import { DashboardContent } from '@/components/layout/DashboardContent'

async function logout() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        redirect('/login')
    }

    const tenant = await getCurrentTenant()
    const tier = tenant?.tier || 'unpaid'
    const isUnpaid = tier === 'unpaid'
    const isUnverified = !session.user.email_confirmed_at

    const tierBadge = tier === 'elite'
        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
        : tier === 'enterprise'
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
            : tier === 'pro'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-600'

    const isTwitter = session.user.app_metadata?.provider === 'twitter' || session.user.identities?.some(i => i.provider === 'twitter')
    const twitterAvatar = isTwitter
        ? (session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || session.user.identities?.find((i: any) => i.provider === 'twitter')?.identity_data?.avatar_url)
        : null

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Sidebar - Hidden on mobile */}
            <aside className="hidden md:block fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 shadow-sm">
                <Link href="/profile" className="p-8 border-b border-slate-100 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="relative w-10 h-10 group-hover:scale-110 transition-transform shrink-0">
                        {twitterAvatar ? (
                            <Image
                                src={twitterAvatar}
                                alt="Profile"
                                fill
                                className="object-cover rounded-xl"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-sm">
                                {(session.user.user_metadata?.full_name?.charAt(0) || session.user.email?.charAt(0))?.toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-sm font-black text-slate-900 leading-tight truncate uppercase tracking-tighter">
                            {session.user.user_metadata?.full_name || session.user.email?.split('@')[0]}
                        </h1>
                        <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest mt-0.5">{tier} TIER</p>
                    </div>
                </Link>

                <nav className="p-4 space-y-1">
                    {[
                        { name: 'Dashboard', href: isUnverified ? '#' : '/dashboard', icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        )},
                        { name: 'Revenue Recovery', href: isUnverified ? '#' : '/revenue', icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ), special: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' },
                        { name: 'Connect & API', href: isUnverified ? '#' : '/integrations', icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        ), special: 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100' },
                        { name: 'Billing & Plans', href: '/subscription', icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        ), special: 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 shadow-sm' },
                        { name: 'Settings', href: isUnverified ? '#' : '/settings', icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        )},
                    ].map((link) => (
                        <Link
                            key={link.name}
                            href={isUnverified && link.name !== 'Billing & Plans' ? '#' : link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm group ${
                                link.special || 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            } ${isUnverified && link.name !== 'Billing & Plans' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="shrink-0">{link.icon}</span>
                            {link.name}
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3 mb-4">
                        <Link href="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md bg-slate-900 flex items-center justify-center text-white font-bold text-sm relative cursor-pointer hover:border-slate-300 transition-colors">
                            {twitterAvatar ? (
                                <Image
                                    src={twitterAvatar}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <span>{(session.user.user_metadata?.full_name?.charAt(0) || session.user.email?.charAt(0))?.toUpperCase()}</span>
                            )}
                        </Link>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                                <p className="text-xs font-bold text-slate-900 truncate tracking-tight">{session.user.email}</p>
                                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${tierBadge}`}>
                                    {tier}
                                </span>
                            </div>
                            <Link 
                                href="/settings" 
                                className="text-[10px] text-blue-600 font-bold hover:underline"
                            >
                                Edit Profile
                            </Link>
                        </div>
                    </div>
                    <form action={logout}>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 text-xs font-bold text-slate-500 hover:bg-white hover:text-red-600 hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg transition-all"
                        >
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main content */}
            <main className="ml-0 md:ml-64 transition-all duration-300 relative">
                <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 px-4 md:px-8 flex items-center justify-between md:justify-end gap-4 shadow-sm shadow-slate-900/5">
                    <MobileNav user={session.user} tier={tier} />
                    <div className="flex items-center gap-3">
                        <NotificationBell />
                    </div>
                </header>

                <DashboardContent isUnpaid={isUnpaid} isUnverified={isUnverified}>
                    {children}
                </DashboardContent>
            </main>

            {/* Gate overlays — rendered outside <main> so fixed positioning covers the full screen including the sidebar */}
            <DashboardGate 
                isUnverified={isUnverified}
                isUnpaid={isUnpaid}
                email={session.user.email}
            />
        </div>
    )
}
