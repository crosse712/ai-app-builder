# 🚀 AI App Builder

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sws-apps/ai-app-builder)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

An intelligent web application builder powered by AI that enables users to create, modify, and deploy web applications through natural language conversations. Built with Next.js, TypeScript, and integrated with Gemini 2.0 Flash for advanced code generation.

## ✨ Features

### 🤖 **AI-Powered Development**
- **Smart Code Generation**: Powered by Gemini 2.0 Flash for intelligent code creation
- **Context-Aware Conversations**: AI remembers your entire conversation history
- **Intent Recognition**: Automatically understands whether you want to create, modify, or discuss code
- **Layout Preservation**: Intelligently preserves existing designs when updating content

### 💬 **Advanced Chat Interface**
- **Project-Specific Memory**: Each project maintains its own conversation history
- **Visual Response Types**: Different badges for code generation, modifications, conversations, and explanations
- **Export/Import Conversations**: Backup and restore your development history
- **Real-time Updates**: See code changes reflected instantly in the editor

### 🎨 **Development Environment**
- **Monaco Editor**: Professional code editing with syntax highlighting
- **Live Preview**: Real-time preview of your code changes
- **Multi-File Support**: Manage multiple files with a built-in file explorer
- **Resizable Panels**: Customize your workspace layout
- **Auto-Save**: Automatic saving to local storage

### 🚀 **Deployment Features**
- **GitHub Integration**: 
  - Create new repositories
  - Update existing repositories
  - Automatic commit messages
  - GitHub Pages support
- **Vercel Deployment**:
  - One-click deployment
  - Update existing projects
  - Instant HTTPS URLs
- **Project Management**: Choose between creating new projects or updating existing ones

### 🎯 **Smart Features**
- **Quick Actions**: Pre-configured templates for common app types
- **Learning Panel**: Interactive learning suggestions based on your code
- **Tutorials**: Built-in tutorials for popular frameworks
- **Storage Warnings**: Clear notifications about local storage usage

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2.5
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini 2.0 Flash
- **Code Editor**: Monaco Editor
- **UI Components**: Lucide React Icons
- **Panel Management**: React Resizable Panels
- **Notifications**: React Hot Toast
- **API Integration**: Octokit (GitHub), Vercel API

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/sws-apps/ai-app-builder.git
cd ai-app-builder
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open the application**
```
http://localhost:3000
```

## 🔑 Configuration

### API Keys Setup

The application uses browser localStorage for API keys, ensuring security and user-specific configurations.

1. **Open the app** and click the **Settings** (key icon) in the header
2. **Add your API keys**:
   - **Gemini API Key**: Required for AI features ([Get it here](https://makersuite.google.com/app/apikey))
   - **GitHub Token**: Optional, for GitHub deployment ([Create token](https://github.com/settings/tokens))
   - **Vercel Token**: Optional, for Vercel deployment ([Get token](https://vercel.com/account/tokens))

### Security Note

**This application does NOT store any API keys on the server.**

- ✅ All API keys are stored locally in your browser's localStorage
- ✅ Keys are never sent to our servers
- ✅ Each user manages their own API keys
- ✅ No environment variables or server-side storage
- ✅ Keys are only sent directly to the respective service APIs (Gemini, GitHub, Vercel)

**Important**: Never share your API keys or commit them to version control.

## 🎮 Usage

### Creating Your First App

1. **Configure API Key**: Click the key icon and add your Gemini API key
2. **Start Building**: 
   - Type "Create a modern todo app with React" in the chat
   - Or use Quick Actions for templates
3. **See Results**: Watch as code generates in the editor with live preview
4. **Iterate**: Continue chatting to modify and enhance your app
5. **Deploy**: Use the GitHub or Vercel buttons to deploy your creation

### Chat Commands Examples

- **Create**: "Build a calculator app with React and Tailwind"
- **Modify**: "Add a dark mode toggle to the header"
- **Enhance**: "Make the buttons larger and add animations"
- **Fix**: "Fix the submit button functionality"
- **Explain**: "How does the useState hook work?"

### Project Management

- **Name Your Project**: Use the project name field in the header
- **Switch Projects**: Each project maintains separate conversation history
- **Export Conversations**: Download your development history as JSON
- **Import Previous Work**: Restore conversations from backup

## 🚢 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sws-apps/ai-app-builder)

Or manually:
1. Fork this repository
2. Go to [vercel.com](https://vercel.com)
3. Import your forked repository
4. Deploy with default settings

### Deploy to Other Platforms

The app is a standard Next.js application and can be deployed to:
- Netlify
- AWS Amplify
- Railway
- Render
- Self-hosted with Node.js

## 🏗️ Architecture

```
ai-app-builder/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── generate/      # AI code generation
│   │   ├── github/        # GitHub integration
│   │   └── vercel/        # Vercel deployment
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application
├── components/            # React components
│   ├── ChatInterface.tsx  # AI chat system
│   ├── EnhancedDeploymentDialog.tsx
│   ├── SettingsModal.tsx  # API key management
│   └── ...               # Other components
├── public/               # Static assets
└── data/                # Tutorial data
```

## 🔧 Advanced Features

### Layout Preservation System

The AI intelligently preserves existing layouts when modifying code:
- Detects design change keywords: "change design", "update layout", "switch theme"
- Maintains CSS classes and styling when updating content
- Injects new features without breaking existing design

### Conversation Context

Each message includes up to 10 previous exchanges for context, enabling:
- Coherent multi-step development
- Reference to previous discussions
- Consistent code evolution

### Intent Recognition

Automatic detection of user intent:
- **Code Generation**: Creating new applications
- **Code Modification**: Updating existing code
- **Conversation**: General discussion
- **Explanation**: Learning and understanding

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [Google Gemini](https://deepmind.google/technologies/gemini/)
- Code editor by [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- Deployed on [Vercel](https://vercel.com)

## 📧 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## 🚀 Roadmap

- [ ] Multi-model AI support (GPT-4, Claude, etc.)
- [ ] Collaborative editing features
- [ ] Template marketplace
- [ ] Custom component libraries
- [ ] Mobile responsive editor
- [ ] Plugin system
- [ ] Docker containerization
- [ ] CI/CD pipeline templates

---

<p align="center">Made with ❤️ by developers, for developers</p>