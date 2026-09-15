/**
 * Lysis Validation Schemas
 * 
 * JSON Schema definitions for all webhook payloads
 * Used for input validation before processing
 */

// =============================================================================
// COMMON PATTERNS
// =============================================================================

const PATTERNS = {
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    URL: /^https?:\/\/[^\s<>\"{}|\\^`\[\]]+$/,
    SAFE_STRING: /^[a-zA-Z0-9\s.,!?'"\-_@#$%&*()+=:;]+$/,
    PHASH: /^[a-fA-F0-9]{16,128}$/,
    HASH_MD5: /^[a-fA-F0-9]{32}$/,
    HASH_SHA256: /^[a-fA-F0-9]{64}$/,
    FILENAME: /^[a-zA-Z0-9._-]+$/,
};

// =============================================================================
// DANGEROUS PATTERNS (Block these)
// =============================================================================

const DANGEROUS_PATTERNS = [
    // SQL injection
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\s)/i,
    /(['"]?\s*;\s*(SELECT|INSERT|UPDATE|DELETE|DROP))/i,
    /(--\s*$|\/\*|\*\/)/,

    // XSS
    /<script[\s>]/i,
    /javascript:/i,
    /on(click|load|error|mouseover|focus|blur)=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,

    // Path traversal
    /\.\.\//,
    /\.\.\\/,
    /%2e%2e/i,

    // Command injection
    /[;&|`$]|\$\(/,
    /\|\s*\w+/,

    // LDAP injection
    /[)(|*\\]/,
];

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

const schemas = {
    /**
     * Forensic evidence upload payload
     */
    forensicEvidence: {
        type: 'object',
        required: ['tenant_id', 'evidence_name', 'evidence_type'],
        properties: {
            tenant_id: {
                type: 'string',
                pattern: PATTERNS.UUID.source,
                description: 'Tenant UUID',
            },
            evidence_name: {
                type: 'string',
                minLength: 1,
                maxLength: 255,
                sanitize: true,
            },
            evidence_type: {
                type: 'string',
                enum: ['image', 'video', 'document', 'audio', 'archive', 'other'],
            },
            case_id: {
                type: 'string',
                maxLength: 100,
                optional: true,
            },
            file_path: {
                type: 'string',
                maxLength: 1000,
                optional: true,
            },
            file_size: {
                type: 'integer',
                minimum: 0,
                maximum: 10737418240, // 10GB max
                optional: true,
            },
            mime_type: {
                type: 'string',
                maxLength: 100,
                pattern: /^[a-z]+\/[a-z0-9.+-]+$/i.source,
                optional: true,
            },
            phash_image: {
                type: 'string',
                pattern: PATTERNS.PHASH.source,
                optional: true,
            },
            source_url: {
                type: 'string',
                pattern: PATTERNS.URL.source,
                maxLength: 2000,
                optional: true,
                validateUrl: true,
            },
            source_platform: {
                type: 'string',
                maxLength: 100,
                optional: true,
            },
            collected_by: {
                type: 'string',
                maxLength: 255,
                optional: true,
            },
            metadata: {
                type: 'object',
                optional: true,
            },
        },
    },

    /**
     * Recon target creation payload
     */
    reconTarget: {
        type: 'object',
        required: ['tenant_id', 'target_name', 'target_type', 'target_value'],
        properties: {
            tenant_id: {
                type: 'string',
                pattern: PATTERNS.UUID.source,
            },
            target_name: {
                type: 'string',
                minLength: 1,
                maxLength: 255,
                sanitize: true,
            },
            target_type: {
                type: 'string',
                enum: ['domain', 'ip', 'organization', 'person', 'creator_name'],
            },
            target_value: {
                type: 'string',
                minLength: 1,
                maxLength: 500,
                sanitize: true,
            },
            target_aliases: {
                type: 'array',
                items: { type: 'string', maxLength: 255 },
                maxItems: 10,
                optional: true,
            },
            priority: {
                type: 'integer',
                minimum: 1,
                maximum: 10,
                optional: true,
            },
        },
    },

    /**
     * Legal case creation payload
     */
    legalCase: {
        type: 'object',
        required: ['tenant_id', 'case_name', 'case_type'],
        properties: {
            tenant_id: {
                type: 'string',
                pattern: PATTERNS.UUID.source,
            },
            case_name: {
                type: 'string',
                minLength: 1,
                maxLength: 255,
                sanitize: true,
            },
            case_type: {
                type: 'string',
                enum: ['dmca', 'copyright', 'trademark', 'harassment', 'impersonation', 'other'],
            },
            infringing_url: {
                type: 'string',
                pattern: PATTERNS.URL.source,
                maxLength: 2000,
                optional: true,
                validateUrl: true,
            },
            platform: {
                type: 'string',
                maxLength: 100,
                optional: true,
            },
            description: {
                type: 'string',
                maxLength: 5000,
                sanitize: true,
                optional: true,
            },
            priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'critical'],
                optional: true,
            },
            evidence_ids: {
                type: 'array',
                items: { type: 'string', pattern: PATTERNS.UUID.source },
                maxItems: 100,
                optional: true,
            },
        },
    },

    /**
     * Vault item creation payload
     */
    vaultItem: {
        type: 'object',
        required: ['tenant_id', 'item_name', 'item_type'],
        properties: {
            tenant_id: {
                type: 'string',
                pattern: PATTERNS.UUID.source,
            },
            item_name: {
                type: 'string',
                minLength: 1,
                maxLength: 255,
                sanitize: true,
            },
            item_type: {
                type: 'string',
                enum: ['master_image', 'master_video', 'watermark_key', 'api_credential', 'signature', 'other'],
            },
            phash: {
                type: 'string',
                pattern: PATTERNS.PHASH.source,
                optional: true,
            },
            category: {
                type: 'string',
                maxLength: 100,
                optional: true,
            },
        },
    },

    /**
     * Onboarding webhook payload
     */
    onboarding: {
        type: 'object',
        required: ['email'],
        properties: {
            email: {
                type: 'string',
                pattern: PATTERNS.EMAIL.source,
                maxLength: 255,
            },
            display_name: {
                type: 'string',
                minLength: 1,
                maxLength: 255,
                sanitize: true,
                optional: true,
            },
            tier: {
                type: 'string',
                enum: ['freemium', 'elite'],
                optional: true,
            },
            master_photo_phash: {
                type: 'string',
                pattern: PATTERNS.PHASH.source,
                optional: true,
            },
        },
    },
};

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate a value against a schema property
 * @param {*} value - Value to validate
 * @param {object} propSchema - Property schema
 * @param {string} propName - Property name for error messages
 * @returns {object} - { valid, error, sanitized }
 */
function validateProperty(value, propSchema, propName) {
    // Check if required
    if (value === undefined || value === null) {
        if (propSchema.optional) {
            return { valid: true, sanitized: null };
        }
        return { valid: false, error: `${propName} is required` };
    }

    // Type checking
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (propSchema.type && actualType !== propSchema.type) {
        return { valid: false, error: `${propName} must be of type ${propSchema.type}` };
    }

    // String validations
    if (propSchema.type === 'string') {
        if (propSchema.minLength && value.length < propSchema.minLength) {
            return { valid: false, error: `${propName} must be at least ${propSchema.minLength} characters` };
        }
        if (propSchema.maxLength && value.length > propSchema.maxLength) {
            return { valid: false, error: `${propName} must be at most ${propSchema.maxLength} characters` };
        }
        if (propSchema.pattern) {
            const pattern = typeof propSchema.pattern === 'string'
                ? new RegExp(propSchema.pattern, 'i')
                : propSchema.pattern;
            if (!pattern.test(value)) {
                return { valid: false, error: `${propName} has invalid format` };
            }
        }
        if (propSchema.enum && !propSchema.enum.includes(value)) {
            return { valid: false, error: `${propName} must be one of: ${propSchema.enum.join(', ')}` };
        }

        // Check for dangerous patterns
        for (const pattern of DANGEROUS_PATTERNS) {
            if (pattern.test(value)) {
                return { valid: false, error: `${propName} contains potentially dangerous content` };
            }
        }
    }

    // Integer validations
    if (propSchema.type === 'integer') {
        if (propSchema.minimum !== undefined && value < propSchema.minimum) {
            return { valid: false, error: `${propName} must be at least ${propSchema.minimum}` };
        }
        if (propSchema.maximum !== undefined && value > propSchema.maximum) {
            return { valid: false, error: `${propName} must be at most ${propSchema.maximum}` };
        }
    }

    // Array validations
    if (propSchema.type === 'array') {
        if (propSchema.maxItems && value.length > propSchema.maxItems) {
            return { valid: false, error: `${propName} must have at most ${propSchema.maxItems} items` };
        }
        if (propSchema.items) {
            for (let i = 0; i < value.length; i++) {
                const itemResult = validateProperty(value[i], propSchema.items, `${propName}[${i}]`);
                if (!itemResult.valid) {
                    return itemResult;
                }
            }
        }
    }

    return { valid: true, sanitized: value };
}

/**
 * Validate a payload against a schema
 * @param {object} payload - Data to validate
 * @param {string} schemaName - Name of schema to use
 * @returns {object} - { valid, errors, sanitized }
 */
function validatePayload(payload, schemaName) {
    const schema = schemas[schemaName];
    if (!schema) {
        return { valid: false, errors: [`Unknown schema: ${schemaName}`] };
    }

    if (!payload || typeof payload !== 'object') {
        return { valid: false, errors: ['Payload must be an object'] };
    }

    const errors = [];
    const sanitized = {};

    // Check required fields
    for (const field of (schema.required || [])) {
        if (!(field in payload)) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    // Validate each property
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const value = payload[propName];
        const result = validateProperty(value, propSchema, propName);

        if (!result.valid) {
            errors.push(result.error);
        } else if (result.sanitized !== null) {
            sanitized[propName] = result.sanitized;
        }
    }

    // Check for unknown fields
    const knownFields = Object.keys(schema.properties);
    for (const field of Object.keys(payload)) {
        if (!knownFields.includes(field)) {
            // Allow unknown fields but don't include them in sanitized output
            // You could alternatively return an error here for strict mode
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        sanitized: errors.length === 0 ? sanitized : null,
    };
}

/**
 * Generate n8n-compatible validation code for a schema
 * @param {string} schemaName - Schema to generate code for
 * @returns {string} - JavaScript code for n8n Code node
 */
function generateN8nValidationCode(schemaName) {
    const schema = schemas[schemaName];
    if (!schema) return null;

    return `
// Auto-generated validation for ${schemaName}
const payload = $input.first().json.body || $input.first().json;
const errors = [];

${schema.required.map(field => `
if (!payload.${field}) {
  errors.push('Missing required field: ${field}');
}`).join('\n')}

${Object.entries(schema.properties).map(([name, prop]) => {
        const checks = [];
        if (prop.type === 'string') {
            if (prop.maxLength) checks.push(`payload.${name} && payload.${name}.length > ${prop.maxLength}`);
            if (prop.pattern) checks.push(`payload.${name} && !/${prop.pattern}/.test(payload.${name})`);
            if (prop.enum) checks.push(`payload.${name} && !${JSON.stringify(prop.enum)}.includes(payload.${name})`);
        }
        if (checks.length === 0) return '';
        return `if (${checks.join(' || ')}) { errors.push('Invalid ${name}'); }`;
    }).filter(Boolean).join('\n')}

if (errors.length > 0) {
  throw new Error('Validation failed: ' + errors.join(', '));
}

return payload;
`;
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    PATTERNS,
    DANGEROUS_PATTERNS,
    schemas,
    validateProperty,
    validatePayload,
    generateN8nValidationCode,
};
