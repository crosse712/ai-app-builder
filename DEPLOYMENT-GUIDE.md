# 🚀 Deployment Guide - AI App Builder

## How The App Works on Both Localhost and Production

The AI App Builder is designed to work seamlessly on both **localhost (development)** and **deployed versions (production)** without any configuration changes.

## 🌐 Universal Compatibility

### Why It Works Everywhere

1. **Relative API URLs**: All API calls use relative paths (`/api/...`)
2. **Client-Side Storage**: API keys stored in browser localStorage
3. **No Hard-Coded URLs**: No localhost or domain-specific URLs
4. **Zero Configuration**: No environment variables needed

### How URLs Resolve

```javascript
// In the code:
fetch('/api/generate', ...)

// On localhost:
// Resolves to: http://localhost:3000/api/generate

// On Vercel:
// Resolves to: https://your-app.vercel.app/api/generate

// On custom domain:
// Resolves to: https://yourdomain.com/api/generate
```

## 🏠 Local Development

### Starting Locally
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Opens at http://localhost:3000
```

### Local Features
- ✅ Hot reloading
- ✅ Full API functionality
- ✅ Monaco Editor with all features
- ✅ Live preview
- ✅ All integrations work

## ☁️ Production Deployment

### Deploy to Vercel
```bash
# Build for production
npm run build

# Deploy (via Vercel Dashboard)
# Or use Vercel CLI
npx vercel --prod
```

### Deploy to Other Platforms
The app works on any Node.js hosting:
- Netlify
- Railway
- Render
- AWS Amplify
- Self-hosted VPS

## 🔑 API Key Management (Same for Both)

### How Users Add Keys

1. **Open the app** (localhost or deployed)
2. **Click Settings** (🔑 icon)
3. **Add API keys**:
   - Gemini API Key
   - GitHub Token (optional)
   - Vercel Token (optional)
4. **Save** - Keys stored in browser

### Storage Location
```javascript
// Browser's localStorage
localStorage.getItem('aiAppBuilderKeys')
// Returns:
{
  "geminiApiKey": "...",
  "githubToken": "...",
  "vercelToken": "..."
}
```

## 🔧 Technical Implementation

### API Route Structure
```
/app/api/
├── generate/route.ts      # AI generation (uses Gemini key)
├── github/route.ts        # GitHub operations
├── github/repos/route.ts  # Repository management
├── vercel/route.ts        # Vercel deployment
└── vercel/projects/route.ts # Project listing
```

### Request Flow
```
User Browser
    ↓ (includes API key from localStorage)
Next.js API Route (/api/...)
    ↓ (validates key)
External Service (Gemini/GitHub/Vercel)
    ↓ (returns data)
API Route
    ↓ (sends response)
User Browser
```

## 🎯 Key Design Principles

### 1. No Environment Variables
```javascript
// ❌ Never do this:
const apiKey = process.env.GEMINI_API_KEY

// ✅ Always do this:
const { apiKey } = await req.json() // From client
```

### 2. Relative Paths Only
```javascript
// ❌ Never:
fetch('http://localhost:3000/api/generate')
fetch('https://myapp.vercel.app/api/generate')

// ✅ Always:
fetch('/api/generate')
```

### 3. Client-Side Key Management
```javascript
// Keys come from browser
const keys = localStorage.getItem('aiAppBuilderKeys')

// Send with requests
fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({
    prompt: userPrompt,
    apiKey: keys.geminiApiKey
  })
})
```

## 🛡️ Security Benefits

### Localhost
- Keys never leave your machine
- Complete privacy during development
- No external dependencies

### Production
- Each user has their own keys
- No shared credentials
- No server storage
- Direct API communication

## 📊 Comparison Table

| Feature | Localhost | Deployed |
|---------|-----------|----------|
| API Keys Storage | Browser localStorage | Browser localStorage |
| API Endpoints | /api/* | /api/* |
| Configuration Needed | None | None |
| Environment Variables | None | None |
| HTTPS | Optional | Required |
| Hot Reload | Yes | No |
| Domain | localhost:3000 | your-app.vercel.app |

## 🚀 Quick Deployment Checklist

### For Any Platform:

- [ ] No `.env` files needed
- [ ] No API keys in code
- [ ] Build succeeds: `npm run build`
- [ ] All routes are relative
- [ ] vercel.json configured (for Vercel)

### Deployment Commands:

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod

# Railway
railway up

# Docker
docker build -t ai-app-builder .
docker run -p 3000:3000 ai-app-builder

# PM2 (VPS)
npm run build
pm2 start npm --name "ai-app-builder" -- start
```

## 🔍 Testing Both Environments

### Test Localhost:
```bash
npm run dev
# Visit http://localhost:3000
# Add your API keys
# Test all features
```

### Test Production Build Locally:
```bash
npm run build
npm start
# Visit http://localhost:3000
# Works exactly like deployed version
```

## 📝 Common Issues & Solutions

### Issue: API calls fail on deployed version
**Solution**: Check browser console - likely missing API keys. Add them via Settings.

### Issue: CORS errors
**Solution**: Already handled in vercel.json with proper headers.

### Issue: Different behavior between local and deployed
**Solution**: This shouldn't happen - code is identical. Clear browser cache.

## ✅ Summary

The AI App Builder works identically on:
- **Development**: http://localhost:3000
- **Production**: https://your-app.vercel.app
- **Custom Domain**: https://yourdomain.com

No configuration changes needed - just deploy and go!

---

**Last Updated**: September 2024  
**Version**: 1.0.0