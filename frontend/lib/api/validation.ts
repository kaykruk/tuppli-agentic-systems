import { z } from 'zod';

/**
 * Standard Forensic Validation Schemas
 */

// Schema for the Free Scan / Lead Capture endpoint
export const FreeScanSchema = z.object({
  handle: z.string().min(1, 'Handle is required').max(100).trim(),
  email: z.string().email('Invalid email address').trim(),
  source: z.string().optional().default('free_scanner'),
});

// Schema for Enforcement Actions
export const EnforceSchema = z.object({
  discovery_id: z.string().uuid('Invalid discovery ID format'),
  custom_notes: z.string().max(500).optional(),
});

// Schema for Discovery Query parameters
export const DiscoveriesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.enum(['matched', 'removal_pending', 'cleared', 'archived']).optional(),
});

/**
 * Helper to format Zod errors for API responses
 */
/**
 * AI Security - Indirect Prompt Injection (IPI) Mitigation
 * Scrubs external data for common prompt injection patterns before AI analysis.
 */
export function sanitizeAIPayload(input: string): string {
    if (!input) return '';

    // Keywords used in various prompt injection attacks
    const maliciousKeywords = [
        /ignore[\s\w]*instructions/i,
        /system[\s\w]*prompt/i,
        /system[\s\w]*instruction/i,
        /developer[\s\w]*mode/i,
        /assistant[\s\w]*mode/i,
        /disregard[\s\w]*above/i,
        /as\s+a\s+language\s+model/i,
        /\[SYSTEM_INSTRUCTION\]/i,
        /\[SYS\]/i,
        /prompt[\s\w]*injection/i
    ];

    let sanitized = input;
    maliciousKeywords.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '[SCRUBBED_SECURITY_VIOLATION]');
    });

    return sanitized.trim();
}

export function formatZodError(error: z.ZodError) {
  return {
    error: 'Validation failed',
    details: error.issues.map((err: z.ZodIssue) => ({
      path: err.path.join('.'),
      message: err.message,
    })),
  };
}
