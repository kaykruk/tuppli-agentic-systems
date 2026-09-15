import { NextRequest, NextResponse } from 'next/server';
import { Paddle, EventName, Environment } from '@paddle/paddle-node-sdk';
import { createAdminClient } from '@/lib/supabase/server';

const paddle = new Paddle(process.env.PADDLE_API_KEY || '', {
    environment: (process.env.NEXT_PUBLIC_PADDLE_SANDBOX === 'true' ? 'sandbox' : 'production') as any,
});

export async function POST(req: NextRequest) {
    const signature = req.headers.get('paddle-signature') || '';
    const body = await req.text();
    const secret = process.env.PADDLE_WEBHOOK_SECRET || '';

    try {
        // 🛡️ VERIFY SIGNATURE
        const event = await paddle.webhooks.unmarshal(body, secret, signature);
        if (!event) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        console.log(`[PADDLE_WEBHOOK] Received event: ${event.eventType}`);

        const adminClient = createAdminClient();

        // 🚀 HANDLE SUBSCRIPTION / PAYMENT SUCCESS
        if (
            event.eventType === EventName.SubscriptionCreated ||
            event.eventType === EventName.SubscriptionActivated ||
            event.eventType === EventName.TransactionCompleted
        ) {
            const data = event.data as any;
            const customData = data.customData || data.custom_data;
            const userId = customData?.userId;
            const plan = customData?.plan || 'pro'; // Default to pro if missing

            if (userId && plan) {
                console.log(`[PADDLE_WEBHOOK] Upgrading user ${userId} to ${plan} tier.`);
                
                await adminClient
                    .from('tenants')
                    .update({ 
                        tier: plan,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId);
                
                console.log(`[PADDLE_WEBHOOK] Success: User ${userId} is now ${plan}.`);
            }
        } 
        // 🛑 HANDLE CANCELLATION / PAYMENT FAILURE
        else if (
            event.eventType === EventName.SubscriptionCanceled ||
            event.eventType === EventName.SubscriptionPastDue
        ) {
            const data = event.data as any;
            const customData = data.customData || data.custom_data;
            const userId = customData?.userId;

            if (userId) {
                console.log(`[PADDLE_WEBHOOK] Revoking access for user ${userId} (Event: ${event.eventType}).`);
                
                await adminClient
                    .from('tenants')
                    .update({ 
                        tier: 'unpaid',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId);

                console.log(`[PADDLE_WEBHOOK] Success: User ${userId} is now unpaid.`);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[PADDLE_WEBHOOK] Error:', error.message);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
