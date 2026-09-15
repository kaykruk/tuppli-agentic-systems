/**
 * Discord Intelligence Types
 */

export interface DiscordInviteMetadata {
    code: string;
    serverName: string;
    description: string | null;
    memberCount: number;
    activeCount: number;
    verificationLevel: number; // 0-4
    hasIcon: boolean;
    features: string[];
    riskScore: number; // 0-100
    isVerified: boolean;
}

export interface InfiltrationResult {
    success: boolean;
    verified: boolean;
    channelsFound: number;
    assetsDiscovered: {
        url: string;
        fileName: string;
        channelName: string;
        timestamp: string;
    }[];
    error?: string;
}

export interface ScoutIdentity {
    id: string;
    token: string;
    label: string;
    lastUsed: string | null;
    isActive: boolean;
}
