import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Tuppli - Agentic AI Systems & Agent Reliability Engineering'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: '#0f172a', // slate-900
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div
                        style={{
                            fontSize: 140,
                            fontWeight: 900,
                            backgroundImage: 'linear-gradient(to right, #3b82f6, #06b6d4)', // blue-500 to cyan-500
                            backgroundClip: 'text',
                            color: 'transparent',
                            marginBottom: 20
                        }}
                    >
                        Tuppli
                    </div>
                </div>
                <div style={{ fontSize: 40, color: '#94a3b8', fontWeight: 500, marginBottom: 8 }}>
                    Agentic AI Systems
                </div>
                <div style={{ fontSize: 28, color: '#64748b', fontWeight: 400 }}>
                    Agent Reliability Engineering
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
