import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl

    // 🛡️ 1. BEHAVIORAL WAF-LITE (HIGHEST PRIORITY)
    // Decoded URL inspection to prevent obfuscation bypasses
    const maliciousPatterns = [
        /%3Cscript/i, /<script/i, // XSS
        /union[\s/*+]+select/i, /"OR"[\s/*+]+1=1/i, /'OR'[\s/*+]+1=1/i, // SQLi with space/+ bypass
        /drop[\s/*+]+table/i, /truncate[\s/*+]+table/i, // Destructive SQL
        /\.\.\/\.\.\//, /\/etc\/passwd/i, // Path Traversal
        /base64,/i // Potential payload smuggling
    ]

    let suspectData = ''
    try {
        suspectData = decodeURIComponent(`${pathname}${search}`)
    } catch {
        suspectData = `${pathname}${search}`
    }

    if (maliciousPatterns.some(pattern => pattern.test(suspectData))) {
        return new NextResponse(
            JSON.stringify({ error: 'Security violation: Suspicious payload detected.' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
    }

    // 2. PUBLIC PATH WHITELIST
    const publicPaths = ['/', '/login', '/signup', '/pitch', '/privacy', '/terms']
    if (publicPaths.includes(pathname)) {
        return NextResponse.next()
    }

    // 3. PUBLIC API WHITELIST (Ingress endpoints)
    const publicApiPaths = ['/api/free-scan']
    if (publicApiPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next()
    }

    // 4. APPLY SECURITY HEADERS
    const response = pathname.startsWith('/api') 
        ? await updateSession(request) 
        : NextResponse.next()
    
    // Refresh session if not an API route (already handled above if it was)
    const finalResponse = pathname.startsWith('/api') ? response : await updateSession(request)

    // Set standard security headers
    finalResponse.headers.set('X-DNS-Prefetch-Control', 'on')
    finalResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    finalResponse.headers.set('X-Frame-Options', 'DENY')
    finalResponse.headers.set('X-Content-Type-Options', 'nosniff')
    finalResponse.headers.set('X-XSS-Protection', '1; mode=block')
    finalResponse.headers.set('Referrer-Policy', 'origin-when-cross-origin')

    return finalResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
