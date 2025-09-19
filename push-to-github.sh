#!/bin/bash

# Push AI App Builder to GitHub
# Usage: ./push-to-github.sh YOUR_GITHUB_USERNAME YOUR_GITHUB_TOKEN

if [ $# -ne 2 ]; then
    echo "Usage: $0 <github-username> <github-token>"
    echo "Example: $0 myusername ghp_xxxxxxxxxxxx"
    exit 1
fi

USERNAME=$1
TOKEN=$2

echo "Setting up GitHub remote with authentication..."
git remote set-url origin https://${USERNAME}:${TOKEN}@github.com/sws-apps/ai-app-builder.git

echo "Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo "Repository: https://github.com/sws-apps/ai-app-builder"
    echo ""
    echo "Next steps:"
    echo "1. Go to https://vercel.com"
    echo "2. Import the repository"
    echo "3. Deploy!"
else
    echo "❌ Push failed. Please check your credentials."
fi