# Pushing AI App Builder to GitHub

Your repository is ready to push to: `https://github.com/sws-apps/ai-app-builder.git`

## Option 1: Using GitHub Personal Access Token (Recommended)

1. **Create a Personal Access Token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token"
   - Give it a name: "AI App Builder Deploy"
   - Select scopes: `repo` (full control of private repositories)
   - Click "Generate token"
   - Copy the token (it looks like: `ghp_xxxxxxxxxxxx`)

2. **Push using the token:**
   ```bash
   cd /Users/kmh/ai-app-builder
   git remote set-url origin https://YOUR_GITHUB_USERNAME:YOUR_TOKEN@github.com/sws-apps/ai-app-builder.git
   git push -u origin main
   ```
   Replace:
   - `YOUR_GITHUB_USERNAME` with your GitHub username
   - `YOUR_TOKEN` with the token you just created

## Option 2: Using GitHub CLI

1. **Install GitHub CLI:**
   ```bash
   brew install gh
   ```

2. **Authenticate:**
   ```bash
   gh auth login
   ```

3. **Push the code:**
   ```bash
   cd /Users/kmh/ai-app-builder
   gh repo create sws-apps/ai-app-builder --public --source=. --remote=origin --push
   ```

## Option 3: Using SSH

1. **Generate SSH key:**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **Add SSH key to GitHub:**
   ```bash
   pbcopy < ~/.ssh/id_ed25519.pub
   ```
   - Go to GitHub → Settings → SSH and GPG keys
   - Click "New SSH key"
   - Paste the key

3. **Change remote to SSH:**
   ```bash
   cd /Users/kmh/ai-app-builder
   git remote set-url origin git@github.com:sws-apps/ai-app-builder.git
   git push -u origin main
   ```

## Option 4: Manual Upload via GitHub Web

1. Go to: https://github.com/sws-apps/ai-app-builder
2. Click "uploading an existing file"
3. Drag and drop all files from `/Users/kmh/ai-app-builder`
4. Commit directly to main branch

## After Pushing

Once pushed, you can:
1. Deploy to Vercel directly from the GitHub repository
2. Share the repository link: https://github.com/sws-apps/ai-app-builder
3. Enable GitHub Pages for a static preview

## Files Ready to Push

All files are committed and ready:
- ✅ Source code (app/, components/)
- ✅ Configuration (vercel.json, package.json)
- ✅ Documentation (README.md, DEPLOY.md)
- ✅ Git ignore rules (.gitignore)

The repository structure is optimized for immediate Vercel deployment!