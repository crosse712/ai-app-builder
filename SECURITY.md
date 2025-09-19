# Security Architecture - AI App Builder

## Current Security Model (Development)

### 1. API Key Management
- **Storage**: Browser localStorage (client-side only)
- **Transmission**: Direct from browser to API services
- **Server Storage**: None - keys never touch your server

### 2. How It Works for Multiple Users

Each user:
1. Enters their own API keys in Settings
2. Keys are stored locally in their browser
3. API calls include their personal keys
4. No cross-user contamination

```
User A Browser → localStorage → Google/GitHub/Vercel APIs
User B Browser → localStorage → Google/GitHub/Vercel APIs
```

### 3. Current Security Features

✅ **What's Protected:**
- Keys stay in user's browser
- No server-side storage
- Each user isolated
- Keys can be cleared by clearing browser data

⚠️ **Current Vulnerabilities:**
- Keys visible in browser DevTools Network tab
- No encryption in localStorage
- Vulnerable to XSS attacks
- No rate limiting
- No audit trail

## Production Security Recommendations

### Option 1: Server-Side Proxy (Recommended)

```
User → Your Server (with auth) → External APIs
```

**Implementation:**
```typescript
// app/api/secure/generate/route.ts
export async function POST(req: NextRequest) {
  // 1. Authenticate user
  const session = await getSession(req);
  if (!session) return unauthorized();
  
  // 2. Get user's encrypted keys from database
  const userKeys = await getUserKeys(session.userId);
  
  // 3. Decrypt keys server-side
  const apiKey = decrypt(userKeys.geminiKey);
  
  // 4. Make API call server-side
  const result = await callGeminiAPI(apiKey, req.body);
  
  // 5. Return result (no keys exposed)
  return NextResponse.json(result);
}
```

### Option 2: Encrypted Storage

```typescript
// Encrypt keys before storing
import crypto from 'crypto';

function encryptApiKey(apiKey: string, userPassword: string) {
  const cipher = crypto.createCipher('aes-256-cbc', userPassword);
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Store encrypted in localStorage
localStorage.setItem('encryptedKeys', encrypted);
```

### Option 3: Backend for Frontend (BFF) Pattern

```
Client → Your BFF API → Multiple Services
         ↓
    User Session
    Rate Limiting
    Key Rotation
    Audit Logs
```

## Recommended Production Setup

### 1. Authentication Layer
```typescript
// Use NextAuth.js or similar
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ]
})
```

### 2. Database for User Keys
```sql
-- PostgreSQL schema
CREATE TABLE user_api_keys (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  service VARCHAR(50), -- 'gemini', 'github', 'vercel'
  encrypted_key TEXT,
  created_at TIMESTAMP,
  last_used TIMESTAMP,
  usage_count INTEGER DEFAULT 0
);
```

### 3. Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each user to 100 requests per windowMs
  keyGenerator: (req) => req.session?.userId || req.ip
});

app.use('/api/', limiter);
```

### 4. Environment-Based Keys
```env
# .env.production
# For team/enterprise use
GEMINI_API_KEY_POOL=key1,key2,key3
ENABLE_KEY_ROTATION=true
MAX_REQUESTS_PER_USER=1000
```

## Security Best Practices

### For Individual Users (Current Setup)
1. **Use strong API keys** - Regenerate regularly
2. **Don't share browsers** - Keys are stored locally
3. **Use incognito for demos** - No key persistence
4. **Clear browser data** - Removes stored keys
5. **Use separate keys for dev/prod**

### For Production Deployment
1. **Add authentication** - Require user login
2. **Implement RBAC** - Role-based access control
3. **Use environment variables** - Never commit keys
4. **Add HTTPS only** - Encrypt all traffic
5. **Implement CSP headers** - Prevent XSS
6. **Add request signing** - Verify request integrity
7. **Use key rotation** - Automatic key refresh
8. **Add audit logging** - Track all API usage
9. **Implement rate limiting** - Prevent abuse
10. **Use secret management** - AWS Secrets, Vault, etc.

## Example: Secure Multi-Tenant Setup

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // 1. Check authentication
  const token = request.cookies.get('auth-token');
  if (!token) return redirectToLogin();
  
  // 2. Verify user
  const user = await verifyToken(token);
  
  // 3. Check rate limits
  const rateLimitOk = await checkRateLimit(user.id);
  if (!rateLimitOk) return rateLimitExceeded();
  
  // 4. Log request
  await logApiRequest(user.id, request.url);
  
  // 5. Add user context to request
  request.headers.set('x-user-id', user.id);
  
  return NextResponse.next();
}
```

## API Key Security Levels

### Level 1: Basic (Current)
- Client-side storage
- Direct API calls
- Good for: Personal projects, demos

### Level 2: Enhanced
- Encrypted localStorage
- HTTPS only
- Basic rate limiting
- Good for: Small teams, internal tools

### Level 3: Production
- Server-side proxy
- User authentication
- Database key storage
- Rate limiting & monitoring
- Good for: Public SaaS, enterprise

### Level 4: Enterprise
- Hardware security modules (HSM)
- Key rotation policies
- Audit compliance (SOC2, ISO)
- Zero-trust architecture
- Good for: Banking, healthcare, government

## Quick Security Checklist

- [ ] API keys in environment variables, not code
- [ ] HTTPS enabled in production
- [ ] Authentication required for API access
- [ ] Rate limiting implemented
- [ ] Keys encrypted at rest
- [ ] Regular key rotation
- [ ] Audit logging enabled
- [ ] CSP headers configured
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens for state-changing operations

## Monitoring & Alerts

Set up monitoring for:
- Unusual API usage patterns
- Failed authentication attempts
- Rate limit violations
- Expired or invalid keys
- Suspicious request patterns

## Incident Response

If keys are compromised:
1. Immediately revoke compromised keys
2. Generate new keys
3. Update all services
4. Review audit logs
5. Notify affected users
6. Implement additional security measures

## Compliance Considerations

For production use with user data:
- GDPR compliance for EU users
- CCPA compliance for California users
- SOC2 Type II for enterprise
- HIPAA for healthcare data
- PCI DSS for payment processing

## Resources

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Google AI API Security](https://ai.google.dev/docs/security)
- [GitHub API Security](https://docs.github.com/en/rest/overview/security)