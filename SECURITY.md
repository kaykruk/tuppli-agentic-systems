# Lysis Security Documentation

## ⚠️ Repository Visibility

> [!CAUTION]
> **This repository should remain PRIVATE on GitHub.**
> 
> Making it public would expose:
> - Security hardening patterns (helps attackers bypass defenses)
> - Workflow detection logic (reveals how we identify stolen content)
> - Infrastructure details (attack surface information)

---

## Security Architecture

### Authentication Layers

| Layer | Method | Purpose |
|-------|--------|---------|
| **n8n UI** | Basic Auth | Admin access to workflow editor |
| **Webhook** | Hybrid (Token + HMAC) | API request authentication |
| **Database** | Row Level Security (RLS) | Multi-tenant data isolation |
| **Frontend** | Supabase Auth (JWT) | User authentication |

### Webhook Security (Hybrid Auth)

All webhooks require both:
1. **Token**: `X-Lysis-Auth: <token>` - Authenticates the client
2. **HMAC Signature**: `X-Lysis-Signature: <signature>` - Verifies request integrity
3. **Timestamp**: `X-Lysis-Timestamp: <unix_timestamp>` - Prevents replay attacks

**Signature generation**:
```javascript
const crypto = require('crypto');
const timestamp = Math.floor(Date.now() / 1000);
const message = `${timestamp}.${JSON.stringify(body)}`;
const signature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(message).digest('hex');
```

---

## Prompt Injection Protection

### Direct Injection
User input is sanitized before AI processing:
- Delimiter escaping (prevents breakout)
- Pattern detection (blocks known injection phrases)
- Content wrapping (isolates user input)

### Indirect Injection
Scraped web content is processed:
- HTML stripped, only text extracted
- Hidden element detection
- AI instruction detection
- Content hashing for audit trail

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Webhooks | 50 | per minute |
| Auth | 5 | per minute |
| Recon (Elite) | 10 | per hour |
| Recon (Freemium) | 2 | per hour |

---

## Input Validation

All inputs are validated against schemas:
- UUID format enforcement
- Max length limits
- Pattern matching
- Dangerous pattern blocking (SQLi, XSS)

---

## Secrets Management

### Required Secrets

| Secret | Generate With | Purpose |
|--------|---------------|---------|
| `N8N_BASIC_AUTH_PASSWORD` | Strong password | n8n admin login |
| `N8N_ENCRYPTION_KEY` | `openssl rand -hex 32` | Credential encryption |
| `N8N_WEBHOOK_AUTH_TOKEN` | `openssl rand -base64 32` | Webhook auth |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase dashboard | DB admin access |

### Secret Rotation

Rotate secrets every 90 days minimum:
1. Generate new secret
2. Update `.env` file
3. Restart services: `docker-compose restart`
4. Update any external integrations

---

## Audit Logging

Sensitive operations are logged to `audit_log` table:
- Vault item access/modification
- Evidence chain-of-custody changes
- Authentication failures
- Rate limit violations

---

## Security Checklist

Before deploying to production:

- [ ] Repository is **private**
- [ ] All default passwords changed
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Rate limiting tested
- [ ] Webhook signatures verified end-to-end
- [ ] RLS policies tested for tenant isolation
- [ ] Audit logging verified
- [ ] Secrets rotated from development values
- [ ] Supabase project security settings reviewed

---

## Incident Response

If you suspect a security breach:

1. **Contain**: Disable affected webhooks/users
2. **Rotate**: Change all secrets immediately
3. **Audit**: Review `audit_log` for suspicious activity
4. **Notify**: Inform affected tenants per GDPR requirements
5. **Remediate**: Patch vulnerability, redeploy

---

## Vulnerability Reporting

If you discover a security vulnerability:
- **Do NOT** create a public GitHub issue
- Email: security@your-domain.com
- Include: Description, steps to reproduce, impact assessment
