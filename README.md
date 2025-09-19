# AI App Builder

Build web applications with AI assistance using Google's Gemini AI through Genkit. Features real-time preview, code editing, and one-click deployment to GitHub and Vercel.

## Features

- **AI-Powered Code Generation**: Use Gemini AI with unlimited tokens to generate complete web applications
- **Real-time Preview**: See your changes instantly in the preview panel
- **Multiple Frameworks**: Support for HTML/CSS/JS, React, Vue, Angular, Svelte, and Next.js
- **Monaco Editor**: Professional code editing experience with syntax highlighting
- **GitHub Integration**: Deploy your projects directly to GitHub repositories
- **Vercel Deployment**: One-click deployment to Vercel for instant hosting
- **Responsive Design**: Split-panel interface with resizable panels
- **Download Code**: Export your generated code as files

## Prerequisites

- Node.js 18+ installed
- Google AI API key (for Gemini)
- GitHub Personal Access Token (for GitHub deployment)
- Vercel Token (for Vercel deployment)

## Setup Instructions

1. **Clone the repository**
   ```bash
   cd ai-app-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```env
   # Google AI (Gemini) Configuration
   GOOGLE_GENAI_API_KEY=your_google_ai_api_key_here
   
   # GitHub Configuration (optional, for deployment)
   GITHUB_TOKEN=your_github_personal_access_token_here
   
   # Vercel Configuration (optional, for deployment)
   VERCEL_TOKEN=your_vercel_token_here
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

## Getting API Keys

### Google AI (Gemini) API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the API key and add it to your `.env.local` file

### GitHub Personal Access Token
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `workflow` (for creating repositories)
4. Generate and copy the token

### Vercel Token
1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name your token and copy it

## Usage

1. **Select a Framework**: Choose from HTML/CSS/JS, React, Vue, Angular, Svelte, or Next.js
2. **Enter a Prompt**: Describe the application you want to build
3. **Generate Code**: Click the "Generate" button or press Enter
4. **Edit Code**: Modify the generated code in the Monaco editor
5. **Preview**: See real-time updates in the preview panel
6. **Deploy**: Click "Deploy to GitHub" or "Deploy to Vercel" to publish your app

## Project Structure

```
ai-app-builder/
├── app/
│   ├── api/
│   │   ├── generate/     # Gemini AI code generation
│   │   ├── github/       # GitHub deployment API
│   │   └── vercel/       # Vercel deployment API
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main application UI
│   └── globals.css       # Global styles
├── components/
│   └── DeploymentDialog.tsx  # Deployment modal component
├── lib/
│   └── genkit.ts         # Genkit AI configuration
├── public/               # Static assets
├── package.json          # Dependencies
└── README.md            # This file
```

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Genkit**: Google's AI framework
- **Gemini AI**: Google's generative AI model
- **Monaco Editor**: VS Code's editor in the browser
- **React Resizable Panels**: Flexible panel layout
- **Octokit**: GitHub API client
- **Framer Motion**: Animation library
- **React Hot Toast**: Notifications

## Features in Detail

### AI Code Generation
The app uses Google's Gemini 1.5 Flash model through Genkit to generate code based on natural language descriptions. The AI is prompted to create complete, functional, and styled applications.

### Real-time Preview
The preview panel uses an iframe with `srcDoc` to render the generated HTML/CSS/JS code instantly. Changes in the editor are reflected immediately.

### GitHub Integration
- Creates new repositories
- Commits generated code
- Sets up GitHub Pages for public repositories
- Provides direct links to the repository

### Vercel Deployment
- Creates new Vercel projects
- Deploys static sites instantly
- Provides deployment URLs

## Troubleshooting

### npm install fails
If you encounter permission errors:
```bash
sudo npm cache clean --force
sudo chown -R $(whoami) ~/.npm
npm install
```

### API Key Issues
- Ensure your API keys are correctly set in `.env.local`
- Restart the development server after changing environment variables
- Check that your API keys have the necessary permissions

### Deployment Failures
- For GitHub: Ensure your token has `repo` scope
- For Vercel: Ensure your token is valid and not expired
- Check the browser console for detailed error messages

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open an issue on GitHub or contact the maintainers.