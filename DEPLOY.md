# Deploying AI App Builder to Vercel

## Quick Deploy with Vercel Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ai-app-builder)

## Manual Deployment Steps

### Option 1: Deploy via Vercel Web Interface (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - AI App Builder"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ai-app-builder.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [https://vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your `ai-app-builder` repository
   - Configure environment variables (see below)
   - Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI globally:**
   ```bash
   sudo npm install -g vercel
   ```

2. **Deploy the project:**
   ```bash
   cd /Users/kmh/ai-app-builder
   vercel
   ```

3. **Follow the prompts:**
   - Confirm deployment settings
   - Choose project name
   - Link to existing project or create new

### Option 3: Direct Deployment (Without GitHub)

1. **Using npx (no installation needed):**
   ```bash
   cd /Users/kmh/ai-app-builder
   npx vercel
   ```

2. **Follow the prompts to deploy**

## Environment Variables

No environment variables are required for basic deployment. The app uses localStorage for API keys and settings.

However, if you want to pre-configure API keys, you can add:

- `NEXT_PUBLIC_GEMINI_API_KEY` - Your Gemini API key (optional)
- `NEXT_PUBLIC_GITHUB_TOKEN` - Your GitHub token (optional)
- `NEXT_PUBLIC_VERCEL_TOKEN` - Your Vercel token (optional)

**Note:** For security, users should add their own API keys through the Settings interface rather than environment variables.

## Project Configuration

The project includes:
- `vercel.json` - Vercel configuration
- `package.json` - Dependencies and scripts
- `next.config.js` - Next.js configuration

## Build Settings

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Development Command:** `npm run dev`

## After Deployment

1. Your app will be available at: `https://your-project-name.vercel.app`
2. Users can configure their API keys through the Settings interface
3. All data is stored locally in the browser (localStorage)

## Features Available After Deployment

- ✅ AI-powered code generation with Gemini 2.0
- ✅ Live preview of generated code
- ✅ Project management with conversation history
- ✅ GitHub deployment from the app
- ✅ Vercel deployment from the app
- ✅ Code export and download
- ✅ Smart layout preservation
- ✅ Chat-based interface with memory

## Troubleshooting

If deployment fails:
1. Ensure all dependencies are listed in `package.json`
2. Check Node.js version compatibility (requires Node 18+)
3. Verify build logs in Vercel dashboard
4. Ensure no hardcoded local paths in code

## Support

For issues or questions, check the Vercel deployment docs: https://vercel.com/docs