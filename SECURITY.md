# 🔒 Security Documentation - AI App Builder

## Overview

AI App Builder is designed with security as a top priority. The application follows a **zero-trust, client-side storage** model where no sensitive information is ever stored on our servers.

## 🛡️ Security Architecture

### Client-Side Storage Only

**No Server Storage of API Keys**
- ✅ All API keys are stored in browser's `localStorage`
- ✅ Keys never leave your browser except to call respective APIs
- ✅ No database storage of credentials
- ✅ No server-side configuration files
- ✅ No environment variables for user credentials
- ✅ No hardcoded tokens or API keys in source code

### Data Flow

```
User Browser (localStorage)
    ↓
Your API Keys
    ↓
Direct API Calls to:
    ├── Google Gemini API
    ├── GitHub API
    └── Vercel API
```

## 🔑 API Key Management

### Storage Location
API keys are stored in browser localStorage under the key `aiAppBuilderKeys`:

```javascript
{
  "geminiApiKey": "your-gemini-key",
  "githubToken": "your-github-token",
  "vercelToken": "your-vercel-token"
}
```

### How It Works for Multiple Users

Each user:
1. Enters their own API keys in Settings
2. Keys are stored locally in their browser
3. API calls include their personal keys
4. No cross-user contamination possible

```
User A Browser → localStorage → Google/GitHub/Vercel APIs
User B Browser → localStorage → Google/GitHub/Vercel APIs
(Completely isolated - no server intermediary)
```

### Key Security Features

1. **No Server Transmission**: Keys are never sent to our servers
2. **Direct API Communication**: Keys are only used for direct API calls
3. **User-Controlled**: Users can clear keys anytime through the UI
4. **Browser Isolation**: Keys are isolated per browser/device
5. **No Cross-Origin Access**: Keys cannot be accessed by other websites

## 🚫 What We DON'T Do

- ❌ Store API keys in databases
- ❌ Log API keys in server logs
- ❌ Use environment variables for user keys
- ❌ Share keys between users
- ❌ Access keys without user action
- ❌ Store keys in cookies
- ❌ Transmit keys to analytics services
- ❌ Include any tokens in source code

## ✅ Security Best Practices

### For Users

1. **Use Scoped Tokens**
   - GitHub: Create tokens with minimal required permissions (repo scope)
   - Vercel: Use project-specific tokens when possible
   - Gemini: Consider using restricted API keys

2. **Regular Rotation**
   - Rotate your API keys periodically
   - Revoke unused tokens
   - Monitor token usage in respective platforms

3. **Browser Security**
   - Use updated browsers
   - Don't share browser profiles
   - Clear localStorage when using shared computers
   - Use incognito/private mode on shared devices

### For Developers

1. **Never Commit Keys**
   ```bash
   # .gitignore includes:
   *.key
   *.token
   .env*.local
   *-token.txt
   *-key.txt
   ```

2. **Code Review**
   - Check for accidental key exposure
   - Verify localStorage usage
   - Ensure no server-side key storage

## 🔍 Security Audit Checklist

### Application Security
- [x] No hardcoded API keys in source code
- [x] All keys stored in client-side localStorage
- [x] HTTPS-only API communications
- [x] No server-side key storage
- [x] Secure key transmission to service APIs only
- [x] Input validation on all API endpoints
- [x] No sensitive data in logs

### Repository Security
- [x] .gitignore configured for sensitive files
- [x] No committed environment files
- [x] No exposed tokens in documentation
- [x] Deployment scripts sanitized
- [x] All helper scripts with tokens removed

## 🚨 Reporting Security Issues

If you discover a security vulnerability, please:

1. **DO NOT** create a public issue
2. Report via GitHub Security Advisory
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## 📝 Compliance

### Data Protection
- **GDPR Compliant**: No personal data stored on servers
- **User Control**: Full control over data deletion
- **Transparency**: Clear documentation of data handling
- **Right to Erasure**: Clear localStorage to remove all data

### API Key Guidelines
- Users are responsible for their own API key security
- We provide secure storage but not key management
- Users must comply with respective API provider terms
- Keys should have minimal required permissions

## 🔄 Updates and Patches

- Security updates are released immediately when identified
- Users are notified through GitHub releases
- No automatic updates that could expose keys
- Changelog includes security fixes

## 💡 Security Tips

### When to Clear Your Keys
- Before uninstalling the application
- When switching devices
- After any suspected security breach
- When done using the application
- Before clearing browser data/cache

### How to Clear Your Keys
1. **Via UI**: Click Settings (🔑) → Clear all fields → Save
2. **Via Console**: `localStorage.removeItem('aiAppBuilderKeys')`
3. **Clear All**: `localStorage.clear()` (removes all app data)

## 📊 Security Metrics

- **Zero** server-stored API keys
- **Zero** database credential storage
- **Zero** hardcoded credentials
- **100%** client-side key management
- **Direct** API communication only

## 🔐 API Endpoint Security

All API endpoints (`/api/*`) follow these principles:
- Receive tokens only from request body/headers
- Never log or store received tokens
- Direct pass-through to external APIs
- No token persistence between requests
- Immediate token disposal after use

## 🌐 Deployment Security

### Vercel Deployment
- No environment variables for user keys
- Build-time variables don't include secrets
- Runtime secrets managed by users

### Self-Hosting
- Can be deployed without any configuration
- Users add their own keys via UI
- No `.env` files required

---

**Last Updated**: September 2024  
**Version**: 1.0.0  
**Security Model**: Zero-Trust Client-Side Storage