import { NextRequest, NextResponse } from 'next/server'

const SPREADSHEET_ID = '14k9pAVjqmWh6ukQo3S2JV2kdUkV-fazy8TnqkYI-1Zc'
const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`
const GITHUB_REPO = 'kaykruk/tuppli-agentic-systems'
const WORKFLOW_FILE = 'tuppli_lead_pipeline.yml'

function twimlResponse(message: string) {
  // Escape XML characters
  const escapedMessage = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapedMessage}</Message>
</Response>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const from = formData.get('From')?.toString() || ''
    const rawBody = (formData.get('Body')?.toString() || '').trim()
    const text = rawBody.toLowerCase()

    // 1. Authorization check if USER_WHATSAPP_NUMBER is set
    const allowedUser = process.env.USER_WHATSAPP_NUMBER
    if (allowedUser) {
      const normalizedFrom = from.replace(/[^0-9]/g, '')
      const normalizedAllowed = allowedUser.replace(/[^0-9]/g, '')
      if (normalizedFrom && normalizedAllowed && !normalizedFrom.endsWith(normalizedAllowed) && !normalizedAllowed.endsWith(normalizedFrom)) {
        console.warn(`Unauthorized WhatsApp attempt from: ${from}`)
        return twimlResponse('⛔ Unauthorized: This bot is configured for personal administrative use only.')
      }
    }

    // 2. Parse Commands
    // Command A: Trigger Lead Gen Run
    const isRunTrigger = /^(run|scrape|find|search|get|generate)\b/i.test(text) || text.includes('run lead') || text.includes('scrape')

    if (isRunTrigger) {
      // Extract number of leads (default 5, capped at 15 for Gemini free rate limits)
      const numMatch = text.match(/\b(\d{1,2})\b/)
      let maxLeads = 5
      if (numMatch) {
        maxLeads = Math.min(Math.max(parseInt(numMatch[1], 10), 1), 15)
      }

      // Extract city if specified (e.g., "in Chicago", "Dallas", etc.)
      let city = ''
      const cityInMatch = text.match(/\bin\s+([a-zA-Z\s]+)/i)
      if (cityInMatch) {
        city = cityInMatch[1].trim()
      } else if (text.includes('chicago')) {
        city = 'Chicago'
      } else if (text.includes('dallas')) {
        city = 'Dallas'
      } else if (text.includes('austin')) {
        city = 'Austin'
      } else if (text.includes('houston')) {
        city = 'Houston'
      } else if (text.includes('atlanta')) {
        city = 'Atlanta'
      }

      // Dispatch GitHub Actions workflow
      const githubToken = process.env.GITHUB_TOKEN
      if (!githubToken) {
        return twimlResponse('❌ Server Error: GITHUB_TOKEN is not configured in the web environment.')
      }

      const dispatchUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`
      const dispatchRes = await fetch(dispatchUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'Tuppli-WhatsApp-Webhook',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            max_leads: String(maxLeads),
            query_limit: '10',
            city: city,
          },
        }),
      })

      if (dispatchRes.status === 204 || dispatchRes.ok) {
        const targetDesc = city ? `in ${city}` : 'across Chicago & Dallas'
        return twimlResponse(
          `🚀 *Tuppli Lead Agent Dispatched!*\n\n` +
          `• *Target:* ${targetDesc}\n` +
          `• *Max Leads:* ${maxLeads}\n` +
          `• *Platform:* GitHub Actions Cloud Runner\n\n` +
          `The agent is now scraping, evaluating ICP fit, and drafting anti-slop icebreakers.\n\n` +
          `📲 I will send the summary report right here as soon as it finishes!`
        )
      } else {
        const errText = await dispatchRes.text()
        console.error('GitHub dispatch failed:', dispatchRes.status, errText)
        return twimlResponse(`❌ Failed to trigger GitHub Action (Status ${dispatchRes.status}). Please check GitHub token permissions.`)
      }
    }

    // Command B: Status / Check Leads
    const isStatusQuery = /^(status|leads|how many|count|summary|info|latest)/i.test(text) || text.includes('how many leads') || text.includes('sheet')

    if (isStatusQuery) {
      try {
        // Quick fetch of Google Sheets public CSV export or row count
        const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv`
        const sheetRes = await fetch(csvUrl, { next: { revalidate: 30 } })
        let countDisplay = '30+'
        if (sheetRes.ok) {
          const csvText = await sheetRes.text()
          const rows = csvText.split('\n').filter(r => r.trim().length > 0)
          // Subtract header
          const leadCount = Math.max(0, rows.length - 1)
          countDisplay = String(leadCount)
        }

        return twimlResponse(
          `📊 *Tuppli Lead Database Status*\n\n` +
          `✅ *Qualified Leads in Sheet:* ${countDisplay}\n` +
          `🎯 *Target Niches:* 3PL Logistics, Freight Dispatch, Claims Intake, Operations\n` +
          `⚡ *Active Filter:* ICP Fit Score ≥ 4/10 with Custom Anti-Slop Icebreakers\n\n` +
          `🔗 *Google Sheet:* ${SPREADSHEET_URL}\n\n` +
          `💡 *Prompt me:* Reply *"run 5 in Chicago"* to scrape new leads!`
        )
      } catch (e) {
        return twimlResponse(
          `📊 *Tuppli Lead Sheet*\n\n` +
          `🔗 *Sheet Link:* ${SPREADSHEET_URL}\n\n` +
          `💡 Reply *"run 5"* to dispatch the agent on GitHub Actions.`
        )
      }
    }

    // Command C: Help / Default Fallback
    return twimlResponse(
      `👋 *Tuppli Lead Generation Agent*\n\n` +
      `Here is what you can prompt me to do:\n\n` +
      `• *"run 5 in Chicago"* — Dispatches cloud agent to find 5 qualified leads in Chicago\n` +
      `• *"run 10 in Dallas"* — Scrapes Dallas operations and enriches with icebreakers\n` +
      `• *"status"* — Real-time lead count and link to your Google Sheet\n` +
      `• *"help"* — Shows this menu\n\n` +
      `All leads are automatically verified, scored, and synced to your Google Sheet!`
    )
  } catch (error) {
    console.error('WhatsApp Webhook Error:', error)
    return twimlResponse('⚠️ An unexpected error occurred while processing your request.')
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Tuppli WhatsApp Agent Webhook',
    status: 'online',
    endpoint: '/api/webhooks/whatsapp',
    description: 'Receives Twilio WhatsApp messages to query leads and trigger GitHub Actions lead generation runs.',
  })
}
