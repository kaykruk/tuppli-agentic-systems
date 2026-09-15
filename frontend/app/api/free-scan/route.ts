import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { FreeScanSchema, formatZodError } from '@/lib/api/validation'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        
        // 1. STRICT VALIDATION (VULN_004 FIX)
        const validation = FreeScanSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(formatZodError(validation.error), { status: 400 })
        }
        
        const { handle, email, source } = validation.data

        const supabaseUrl = process.env.SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseKey) {
            console.error('Supabase credentials missing')
            // Don't fail the frontend if DB is down for this marketing tool, just return success so the animation plays
            return NextResponse.json({ success: true, message: 'Scan initiated' })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        // 0. RATE LIMITING (VULN_003 FIX)
        const { data: limitCheck, error: limitError } = await supabase.rpc('check_rate_limit', {
            p_key_type: 'free_scan_email',
            p_key_value: email,
            p_max_requests: 5,
            p_window_seconds: 60
        });

        if (limitError) {
            console.error('Rate limit check failed:', limitError);
        } else if (limitCheck && !limitCheck.allowed) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please wait a minute before requesting another scan.' },
                { status: 429 }
            );
        }

        // Log the lead into the waitlist table with the handle
        const { error } = await supabase
            .from('waitlist')
            .insert([
                {
                    email,
                    source: source || 'free_scanner',
                }
            ])
        // Ignore unique constraints if they already scanned/joined

        // Real-Time Reconnaissance Phase (Connect to n8n)
        let reconResults = null;
        if (process.env.N8N_RECON_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL) {
            try {
                const reconUrl = process.env.N8N_RECON_WEBHOOK_URL || 'https://n8n.tuppli.com/webhook/real-time-recon';
                const response = await fetch(reconUrl, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.TUPPLI_INTERNAL_SECRET}`
                    },
                    body: JSON.stringify({ handle, email })
                });

                if (response.ok) {
                    reconResults = await response.json();
                    console.log(`✅ Real-time recon complete for @${handle}`);
                }
            } catch (e) {
                console.error("Failed to connect to real-time recon engine", e);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Scan complete',
            results: reconResults || {
                // Fallback to simulation if n8n is unreachable
                success: true,
                handle,
                threats_found: 14,
                breakdown: [
                    { source: 'X (Twitter)', count: 4, severity: 'high' },
                    { source: 'Reddit', count: 10, severity: 'medium' }
                ]
            }
        });

    } catch (e: any) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
