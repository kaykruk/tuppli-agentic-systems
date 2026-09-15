/**
 * Lysis HMAC Verification Utilities
 * 
 * Provides webhook signature verification using HMAC-SHA256
 * Combined with token authentication for hybrid security
 */

const crypto = require('crypto');

// =============================================================================
// HMAC SIGNATURE VERIFICATION
// =============================================================================

/**
 * Generate HMAC-SHA256 signature for a payload
 * @param {string|object} payload - Request body to sign
 * @param {string} secret - Signing secret
 * @param {string} timestamp - Request timestamp
 * @returns {string} - Hex-encoded signature
 */
function generateSignature(payload, secret, timestamp) {
    const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const message = `${timestamp}.${body}`;

    return crypto
        .createHmac('sha256', secret)
        .update(message)
        .digest('hex');
}

/**
 * Verify HMAC signature from incoming webhook
 * @param {object} options - Verification options
 * @returns {object} - { valid, error }
 */
function verifySignature(options) {
    const {
        payload,
        signature,
        timestamp,
        secret,
        maxAgeSeconds = 300,  // 5 minutes
    } = options;

    // Check if signature is provided
    if (!signature) {
        return { valid: false, error: 'Missing signature header' };
    }

    // Check if timestamp is provided and valid
    if (!timestamp) {
        return { valid: false, error: 'Missing timestamp header' };
    }

    // Verify timestamp is not too old (replay protection)
    const requestTime = parseInt(timestamp, 10);
    if (isNaN(requestTime)) {
        return { valid: false, error: 'Invalid timestamp format' };
    }

    const now = Math.floor(Date.now() / 1000);
    const age = now - requestTime;

    if (age > maxAgeSeconds) {
        return { valid: false, error: `Request too old (${age}s > ${maxAgeSeconds}s)` };
    }

    if (age < -60) {  // Allow 1 minute clock skew into future
        return { valid: false, error: 'Request timestamp in future' };
    }

    // Generate expected signature
    const expectedSignature = generateSignature(payload, secret, timestamp);

    // Constant-time comparison to prevent timing attacks
    if (!timingSafeEqual(signature, expectedSignature)) {
        return { valid: false, error: 'Invalid signature' };
    }

    return { valid: true, error: null };
}

/**
 * Constant-time string comparison
 */
function timingSafeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
        return false;
    }

    if (a.length !== b.length) {
        return false;
    }

    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);

    return crypto.timingSafeEqual(bufA, bufB);
}

// =============================================================================
// HYBRID AUTH (TOKEN + HMAC)
// =============================================================================

/**
 * Verify both token and HMAC signature (hybrid authentication)
 * @param {object} options - Verification options
 * @returns {object} - { valid, error, authMethod }
 */
function verifyHybridAuth(options) {
    const {
        headers,
        payload,
        expectedToken,
        hmacSecret,
        tokenHeader = 'x-lysis-auth',
        signatureHeader = 'x-lysis-signature',
        timestampHeader = 'x-lysis-timestamp',
        requireBoth = true,
    } = options;

    const normalizedHeaders = {};
    for (const [key, value] of Object.entries(headers)) {
        normalizedHeaders[key.toLowerCase()] = value;
    }

    const results = {
        tokenValid: false,
        signatureValid: false,
        errors: [],
    };

    // Verify token
    const receivedToken = normalizedHeaders[tokenHeader];
    if (!receivedToken) {
        results.errors.push('Missing auth token');
    } else if (receivedToken !== expectedToken) {
        results.errors.push('Invalid auth token');
    } else {
        results.tokenValid = true;
    }

    // Verify HMAC signature
    const signature = normalizedHeaders[signatureHeader];
    const timestamp = normalizedHeaders[timestampHeader];

    if (!signature || !timestamp) {
        results.errors.push('Missing signature or timestamp');
    } else {
        const sigResult = verifySignature({
            payload,
            signature,
            timestamp,
            secret: hmacSecret,
        });

        if (!sigResult.valid) {
            results.errors.push(sigResult.error);
        } else {
            results.signatureValid = true;
        }
    }

    // Determine overall validity
    let valid = false;
    let authMethod = 'none';

    if (requireBoth) {
        valid = results.tokenValid && results.signatureValid;
        authMethod = valid ? 'hybrid' : 'none';
    } else {
        valid = results.tokenValid || results.signatureValid;
        authMethod = results.signatureValid ? 'hmac' : (results.tokenValid ? 'token' : 'none');
    }

    return {
        valid,
        error: valid ? null : results.errors.join('; '),
        authMethod,
        details: results,
    };
}

// =============================================================================
// RATE LIMITING
// =============================================================================

/**
 * In-memory rate limiter (for single-instance deployments)
 * For production, use Redis-based implementation
 */
class RateLimiter {
    constructor(options = {}) {
        this.windowMs = options.windowMs || 60000;  // 1 minute default
        this.maxRequests = options.maxRequests || 50;  // 50/min default
        this.store = new Map();

        // Cleanup old entries every minute
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }

    /**
     * Check if request is allowed
     * @param {string} key - Rate limit key (IP, tenant_id, etc.)
     * @returns {object} - { allowed, remaining, resetAt }
     */
    check(key) {
        const now = Date.now();
        const windowStart = now - this.windowMs;

        let record = this.store.get(key);

        if (!record) {
            record = { requests: [], resetAt: now + this.windowMs };
            this.store.set(key, record);
        }

        // Remove old requests outside the window
        record.requests = record.requests.filter(time => time > windowStart);

        // Check if limit exceeded
        if (record.requests.length >= this.maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetAt: record.resetAt,
                retryAfter: Math.ceil((record.resetAt - now) / 1000),
            };
        }

        // Record this request
        record.requests.push(now);
        record.resetAt = now + this.windowMs;

        return {
            allowed: true,
            remaining: this.maxRequests - record.requests.length,
            resetAt: record.resetAt,
        };
    }

    /**
     * Cleanup expired entries
     */
    cleanup() {
        const now = Date.now();
        const windowStart = now - this.windowMs;

        for (const [key, record] of this.store.entries()) {
            record.requests = record.requests.filter(time => time > windowStart);
            if (record.requests.length === 0) {
                this.store.delete(key);
            }
        }
    }

    /**
     * Destroy the rate limiter
     */
    destroy() {
        clearInterval(this.cleanupInterval);
        this.store.clear();
    }
}

// Pre-configured rate limiters
const rateLimiters = {
    webhook: new RateLimiter({ windowMs: 60000, maxRequests: 50 }),  // 50/min
    auth: new RateLimiter({ windowMs: 60000, maxRequests: 5 }),      // 5/min
    reconElite: new RateLimiter({ windowMs: 3600000, maxRequests: 10 }),  // 10/hr
    reconFreemium: new RateLimiter({ windowMs: 3600000, maxRequests: 2 }),  // 2/hr
};

/**
 * Check rate limit for a specific limiter
 * @param {string} limiterType - Type of rate limiter
 * @param {string} key - Rate limit key
 * @returns {object} - Rate limit result
 */
function checkRateLimit(limiterType, key) {
    const limiter = rateLimiters[limiterType];
    if (!limiter) {
        return { allowed: true, error: `Unknown limiter: ${limiterType}` };
    }
    return limiter.check(key);
}

// =============================================================================
// N8N CODE NODE HELPERS
// =============================================================================

/**
 * Generate n8n-compatible auth verification code
 * This is the actual code that runs inside n8n Code nodes
 */
const n8nAuthVerificationCode = `
// Hybrid Authentication Verification for n8n
// Verifies both token AND HMAC signature

const crypto = require('crypto');

function verifyAuth() {
  const headers = $input.first().json.headers || {};
  const body = $input.first().json.body || {};
  
  // Get environment variables
  const expectedToken = $env.N8N_WEBHOOK_AUTH_TOKEN;
  const hmacSecret = $env.N8N_WEBHOOK_AUTH_TOKEN; // Using same secret for simplicity
  
  // Normalize headers to lowercase
  const h = {};
  for (const [key, value] of Object.entries(headers)) {
    h[key.toLowerCase()] = value;
  }
  
  // Token verification
  const receivedToken = h['x-lysis-auth'];
  if (!receivedToken || receivedToken !== expectedToken) {
    throw new Error('Unauthorized: Invalid or missing auth token');
  }
  
  // HMAC verification
  const signature = h['x-lysis-signature'];
  const timestamp = h['x-lysis-timestamp'];
  
  if (signature && timestamp) {
    // Verify timestamp is not too old (5 minutes)
    const requestTime = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    
    if (isNaN(requestTime) || (now - requestTime) > 300) {
      throw new Error('Unauthorized: Request expired or invalid timestamp');
    }
    
    // Verify signature
    const message = timestamp + '.' + JSON.stringify(body);
    const expectedSig = crypto
      .createHmac('sha256', hmacSecret)
      .update(message)
      .digest('hex');
    
    if (signature !== expectedSig) {
      throw new Error('Unauthorized: Invalid signature');
    }
  }
  
  // Auth passed
  return { ...body, _authVerified: true, _authMethod: signature ? 'hybrid' : 'token' };
}

return verifyAuth();
`;

/**
 * Generate n8n-compatible rate limiting code
 */
const n8nRateLimitCode = `
// Rate Limiting for n8n (per-tenant)
// Uses workflow static data for in-memory storage

const staticData = $getWorkflowStaticData('global');
const tenantId = $json.tenant_id;
const now = Date.now();
const windowMs = 60000; // 1 minute
const maxRequests = 50;

// Initialize rate limit store if needed
if (!staticData.rateLimits) {
  staticData.rateLimits = {};
}

// Get or create tenant record
let record = staticData.rateLimits[tenantId];
if (!record) {
  record = { requests: [], resetAt: now + windowMs };
  staticData.rateLimits[tenantId] = record;
}

// Remove old requests
const windowStart = now - windowMs;
record.requests = record.requests.filter(time => time > windowStart);

// Check limit
if (record.requests.length >= maxRequests) {
  throw new Error(\`Rate limit exceeded. Try again in \${Math.ceil((record.resetAt - now) / 1000)} seconds\`);
}

// Record request
record.requests.push(now);
record.resetAt = now + windowMs;

return {
  ...$json,
  _rateLimitRemaining: maxRequests - record.requests.length
};
`;

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    // HMAC
    generateSignature,
    verifySignature,
    timingSafeEqual,

    // Hybrid auth
    verifyHybridAuth,

    // Rate limiting
    RateLimiter,
    rateLimiters,
    checkRateLimit,

    // n8n helpers
    n8nAuthVerificationCode,
    n8nRateLimitCode,
};
