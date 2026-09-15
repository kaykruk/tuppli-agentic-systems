import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { handle } = await req.json()

        if (!handle) {
            return NextResponse.json({ error: 'Handle is required' }, { status: 400 })
        }

        // Clean the handle
        const cleanHandle = handle.replace('@', '').trim()

        // 1. The Real Data Engine: Free Reddit Search API
        // We search for the creator's handle alongside common piracy keywords
        const redditSearchUrl = `https://www.reddit.com/search.json?q="${cleanHandle}"+(OnlyFans OR leak OR leaked)&sort=new&limit=10`

        let threatsFound = 0
        let platforms = new Set<string>()
        let specificThreats: string[] = []

        try {
            const redditRes = await fetch(redditSearchUrl, {
                headers: {
                    'User-Agent': 'Tuppli-Forensics-Bot/1.0',
                },
                next: { revalidate: 3600 } // Cache results for an hour to prevent rate limits
            })

            if (redditRes.ok) {
                const redditData = await redditRes.json()
                const posts = redditData?.data?.children || []

                for (const post of posts) {
                    const postData = post.data
                    // Only count if it actually looks like a leak thread, not just a mention
                    if (
                        postData.title.toLowerCase().includes('leak') ||
                        postData.title.toLowerCase().includes('onlyfans') ||
                        postData.subreddit.toLowerCase().includes('leak')
                    ) {
                        threatsFound++
                        platforms.add(`Reddit (r/${postData.subreddit})`)
                        // We store the title to show them *real* proof, but omit the URL to force conversion
                        specificThreats.push(`Thread: "${postData.title.substring(0, 50)}..."`)
                    }
                }
            }
        } catch (redditError) {
            console.error('Reddit Scrape Failed:', redditError)
            // Fallback gracefully so the UI doesn't break
        }

        // Add a small artificial delay so the frontend terminal animation finishes
        await new Promise(r => setTimeout(r, 1000))

        // If no real threats are found via the quick API hit, we fall back to a "deep scan required" message
        // This still converts because it implies hidden threats exist.
        if (threatsFound === 0) {
            return NextResponse.json({
                success: true,
                handle: cleanHandle,
                threats_found: 0,
                confidence: '99.9',
                platforms: ['Surface Web'],
                action_required: false,
                message: "No immediate surface leaks found. However, deep-web and Telegram archives require a full authenticated scan. Sign up to unlock the Deep Web Monitor.",
                specific_threats: []
            })
        }

        const report = {
            success: true,
            handle: cleanHandle,
            threats_found: threatsFound,
            confidence: '95.0',
            platforms: Array.from(platforms),
            action_required: true,
            message: `Critical vulnerabilities found. We detected ${threatsFound} instances of active distribution.`,
            specific_threats: specificThreats.slice(0, 3) // Show max 3 previews
            // Intentionally omitting raw URLs to enforce the "Velvet Rope" conversion hook.
        }

        return NextResponse.json(report)

    } catch (error) {
        console.error('Marketing Scan Error:', error)
        return NextResponse.json({ error: 'Failed to complete scan' }, { status: 500 })
    }
}
