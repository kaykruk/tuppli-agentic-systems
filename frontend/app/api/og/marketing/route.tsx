import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

// We can load fonts here if needed, but for now we'll use system fonts for speed.
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Dynamic data to pass in
        const title = searchParams.get('title') || 'Enterprise Level Content Protection';
        const highlight = searchParams.get('highlight') || 'Threat Detected & Eliminated';
        const tag = searchParams.get('tag') || 'Tuppli Automations';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        backgroundColor: '#0a0a0a',
                        backgroundImage: 'radial-gradient(circle at 50% -20%, #0d2a45, #0a0a0a 80%)',
                        padding: '80px 100px',
                        fontFamily: 'system-ui, sans-serif',
                    }}
                >
                    {/* Header Tag */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(149, 233, 236, 0.1)',
                            border: '1px solid rgba(149, 233, 236, 0.3)',
                            borderRadius: '9999px',
                            padding: '12px 24px',
                            marginBottom: '40px',
                        }}
                    >
                        <span
                            style={{
                                color: '#95E9EC',
                                fontSize: 24,
                                fontWeight: 600,
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                            }}
                        >
                            {tag}
                        </span>
                    </div>

                    {/* Main Title */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                        }}
                    >
                        <span
                            style={{
                                fontSize: 96,
                                fontWeight: 800,
                                color: 'white',
                                lineHeight: 1.1,
                                letterSpacing: '-0.02em',
                                maxWidth: '900px',
                            }}
                        >
                            {title}
                        </span>

                        {/* Glowing Highlight */}
                        <span
                            style={{
                                fontSize: 64,
                                fontWeight: 600,
                                marginTop: '30px',
                                backgroundImage: 'linear-gradient(to right, #95E9EC, #A78BFA)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent',
                            }}
                        >
                            {highlight}
                        </span>
                    </div>

                    {/* Footer Logo Area */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            position: 'absolute',
                            bottom: '80px',
                            left: '100px',
                            gap: '20px',
                        }}
                    >
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                backgroundColor: '#95E9EC',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span
                            style={{
                                fontSize: 36,
                                fontWeight: 700,
                                color: 'white',
                            }}
                        >
                            Tuppli.com
                        </span>
                    </div>

                    {/* Decorative Elements */}
                    <div
                        style={{
                            position: 'absolute',
                            right: '-100px',
                            top: '-100px',
                            width: '600px',
                            height: '600px',
                            backgroundColor: 'rgba(167, 139, 250, 0.1)',
                            filter: 'blur(100px)',
                            borderRadius: '50%',
                        }}
                    />
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e: any) {
        console.error(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
