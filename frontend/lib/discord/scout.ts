import { DiscordInviteMetadata } from './types';

/**
 * Passive Discord Scout
 * Fetches server metadata via public API without joining.
 */
export async function getInviteMetadata(inviteCode: string): Promise<DiscordInviteMetadata | null> {
    try {
        // Remove whitespace and extraction from URL if necessary
        const code = inviteCode.split('/').pop() || inviteCode;
        
        const response = await fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true`);
        
        if (!response.ok) {
            console.warn(`[DiscordScout] Failed to fetch invite ${code}: ${response.statusText}`);
            return null;
        }

        const data = await response.json();

        // Calculate a basic risk score based on server name and verified status
        let riskScore = 0;
        const leakerKeywords = ['leak', 'pack', 'exposed', 'mega', 'full', 'premium', 'exclusive', 'vault'];
        const serverName = (data.guild?.name || '').toLowerCase();
        
        leakerKeywords.forEach(word => {
            if (serverName.includes(word)) riskScore += 20;
        });

        if (data.approximate_member_count > 1000) riskScore += 10;
        if (data.approximate_member_count > 5000) riskScore += 20;
        if (data.guild?.verification_level > 2) riskScore += 10;

        return {
            code,
            serverName: data.guild?.name || 'Unknown Server',
            description: data.guild?.description || null,
            memberCount: data.approximate_member_count || 0,
            activeCount: data.approximate_presence_count || 0,
            verificationLevel: data.guild?.verification_level || 0,
            hasIcon: !!data.guild?.icon,
            features: data.guild?.features || [],
            riskScore: Math.min(riskScore, 100),
            isVerified: !!data.guild?.verification_level && data.guild?.verification_level > 0
        };
    } catch (error) {
        console.error('[DiscordScout] Error:', error);
        return null;
    }
}
