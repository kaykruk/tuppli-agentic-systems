import { NextRequest, NextResponse } from 'next/server'

const SPREADSHEET_ID = '14k9pAVjqmWh6ukQo3S2JV2kdUkV-fazy8TnqkYI-1Zc'
const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`
const GITHUB_REPO = 'kaykruk/tuppli-agentic-systems'
const WORKFLOW_FILE = 'tuppli_lead_pipeline.yml'

async function sendTelegramMessage(botToken: string, chatId: number | string, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })
  } catch (err) {
    console.error('Failed to send Telegram message:', err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json()
    const message = update?.message
    if (!message || !message.text) {
      return NextResponse.json({ ok: true })
    }

    const chatId = message.chat.id
    const rawText = message.text.trim()
    const text = rawText.toLowerCase()
    const botToken = process.env.TELEGRAM_BOT_TOKEN

    if (!botToken) {
      console.warn('TELEGRAM_BOT_TOKEN is not configured.')
      return NextResponse.json({ ok: false, error: 'Bot token not set' })
    }

    // Security: Restrict to authorized chat_id if TELEGRAM_CHAT_ID is set in env
    const allowedChatId = process.env.TELEGRAM_CHAT_ID
    if (allowedChatId && String(chatId) !== String(allowedChatId)) {
      console.warn(`Unauthorized Telegram access attempt from chat_id: ${chatId}`)
      await sendTelegramMessage(
        botToken,
        chatId,
        '⛔ <b>Access Denied:</b> This bot is private and restricted to the authorized operator.'
      )
      return NextResponse.json({ ok: true })
    }

    // Command A: Run lead generation
    const isRunTrigger = /^(run|\/run|scrape|\/scrape|find|search|generate)\b/i.test(text) || text.includes('run lead')

    if (isRunTrigger) {
      // Extract count
      const numMatch = text.match(/\b(\d{1,2})\b/)
      let maxLeads = 5
      if (numMatch) {
        maxLeads = Math.min(Math.max(parseInt(numMatch[1], 10), 1), 15)
      }

      // Extract city
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

      const githubToken = process.env.GITHUB_TOKEN
      if (!githubToken) {
        await sendTelegramMessage(botToken, chatId, '❌ <b>Server Error:</b> <code>GITHUB_TOKEN</code> is not configured.')
        return NextResponse.json({ ok: true })
      }

      const dispatchUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`
      const dispatchRes = await fetch(dispatchUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'Tuppli-Telegram-Webhook',
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
        const targetDesc = city ? `in <b>${city}</b>` : 'across <b>Chicago & Dallas</b>'
        await sendTelegramMessage(
          botToken,
          chatId,
          `🚀 <b>Tuppli Lead Agent Dispatched!</b>\n\n` +
          `• <b>Target:</b> ${targetDesc}\n` +
          `• <b>Max Leads:</b> ${maxLeads}\n` +
          `• <b>Runner:</b> GitHub Actions Cloud Runner\n\n` +
          `The scraper is executing, evaluating operational bottlenecks, and scoring ICP fit.\n\n` +
          `📲 <i>I will send you the full breakdown and top discoveries right here when it finishes!</i>`
        )
      } else {
        const errText = await dispatchRes.text()
        console.error('GitHub dispatch failed:', dispatchRes.status, errText)
        await sendTelegramMessage(
          botToken,
          chatId,
          `❌ <b>Failed to dispatch GitHub Action:</b> (HTTP ${dispatchRes.status}). Check token permissions.`
        )
      }
      return NextResponse.json({ ok: true })
    }

    // Command B: Status & Lead Count
    const isStatusQuery = /^(status|\/status|leads|\/leads|count|summary|info)/i.test(text) || text.includes('how many')

    if (isStatusQuery) {
      try {
        const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv`
        const sheetRes = await fetch(csvUrl, { next: { revalidate: 30 } })
        let countDisplay = '30+'
        if (sheetRes.ok) {
          const csvText = await sheetRes.text()
          const rows = csvText.split('\n').filter(r => r.trim().length > 0)
          const leadCount = Math.max(0, rows.length - 1)
          countDisplay = String(leadCount)
        }

        await sendTelegramMessage(
          botToken,
          chatId,
          `📊 <b>Tuppli Lead Database Status</b>\n\n` +
          `✅ <b>Qualified Leads in Sheet:</b> <code>${countDisplay}</code>\n` +
          `🎯 <b>Target Niches:</b> 3PL Logistics, Freight Dispatch, Claims Intake, Operations\n` +
          `⚡ <b>Filter:</b> ICP Score ≥ 4/10 with Custom Anti-Slop Icebreakers\n\n` +
          `🔗 <a href="${SPREADSHEET_URL}">Open Google Sheet</a>\n\n` +
          `💡 <i>Reply with <code>/run 5 in Chicago</code> to launch a fresh batch!</i>`
        )
      } catch (e) {
        await sendTelegramMessage(
          botToken,
          chatId,
          `📊 <b>Tuppli Lead Sheet:</b> <a href="${SPREADSHEET_URL}">Click here</a>`
        )
      }
      return NextResponse.json({ ok: true })
    }

    // Command C: Start / Help
    await sendTelegramMessage(
      botToken,
      chatId,
      `👋 <b>Tuppli Lead Generation Bot</b>\n\n` +
      `Here is what you can prompt me to do:\n\n` +
      `• <code>/run 5 in Chicago</code> — Dispatches agent to scrape 5 SMB leads in Chicago\n` +
      `• <code>/run 10 in Dallas</code> — Scrapes Dallas operations and enriches with icebreakers\n` +
      `• <code>/status</code> — Real-time lead count and link to your Google Sheet\n` +
      `• <code>/help</code> — Show this menu\n\n` +
      `<i>All leads are scored, deduplicated, and synced to Google Sheets with zero human manual entry!</i>`
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram Webhook Error:', error)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Tuppli Telegram Agent Webhook',
    status: 'online',
    endpoint: '/api/webhooks/telegram',
  })
}
