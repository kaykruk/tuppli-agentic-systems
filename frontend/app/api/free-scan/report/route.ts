import { NextResponse } from 'next/server'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const handle = searchParams.get('handle') || 'creator'

    // In a real prod environment we'd pull actual stats from DB
    const twitterCount = 4
    const redditCount = 10

    const rootDir = '/Users/user/agents/tuppli'
    const scriptPath = path.join(rootDir, 'scripts/generate_damage_report.js')
    const pdfPath = `/tmp/damage_report_${handle}.pdf`

    try {
        console.log(`🚀 Generating PDF for @${handle} via API...`)
        // Execute the backend script
        execSync(`node ${scriptPath} ${handle} ${twitterCount} ${redditCount}`, {
            cwd: rootDir,
            env: { ...process.env, PATH: process.env.PATH }
        })

        if (!fs.existsSync(pdfPath)) {
            throw new Error('PDF file not created')
        }

        const fileBuffer = fs.readFileSync(pdfPath)

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Tuppli_Forensic_Audit_${handle}.pdf"`,
            },
        })

    } catch (e: any) {
        console.error('❌ PDF Generation API Error:', e.message)
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
    }
}
