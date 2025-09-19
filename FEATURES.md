# AI App Builder - Feature Documentation

## 🤖 AI Features

### Gemini 2.0 Flash Integration
- **Model**: Google's latest Gemini 2.0 Flash experimental model
- **Capabilities**: Code generation, modification, explanation, and conversation
- **Context Window**: Maintains up to 10 previous messages for context
- **Response Time**: Typically 1-3 seconds for code generation

### Intent Recognition System
The AI automatically detects user intent through keyword analysis:

| Intent | Keywords | Example | Action |
|--------|----------|---------|--------|
| Code Generation | create, build, make, generate | "Create a todo app" | Generates new code |
| Code Modification | change, update, add, fix | "Add a dark mode toggle" | Modifies existing code |
| Conversation | thanks, hello, good | "Thanks, that looks great!" | Friendly response |
| Explanation | how, what, why, explain | "How does useState work?" | Educational response |

### Layout Preservation
- **Smart Detection**: Recognizes design change keywords
- **Content Injection**: Updates content without breaking layouts
- **Style Matching**: New elements match existing design patterns
- **Design Keywords**: "change design", "update layout", "switch theme", "redesign"

## 💬 Chat Interface Features

### Message Types & Visual Indicators
- 🎨 **Green Badge**: New code generation
- ✏️ **Yellow Badge**: Code modification
- 💬 **Blue Badge**: Conversation
- 📖 **Purple Badge**: Explanation

### Conversation Management
- **Per-Project History**: Each project maintains separate conversations
- **Export Format**: JSON with full message history and timestamps
- **Import**: Restore previous conversations
- **Clear History**: Reset conversation for current project
- **Auto-Save**: Conversations saved to localStorage automatically

### Chat Commands
```
Create Commands:
- "Create a [type] app with [technology]"
- "Build me a [description]"
- "Generate a [component/feature]"

Modify Commands:
- "Add [feature] to the [location]"
- "Change the [element] to [new value]"
- "Update [component] with [changes]"
- "Fix the [issue]"

Learning Commands:
- "Explain [concept]"
- "How does [feature] work?"
- "What is [technology]?"
```

## 🎨 Editor Features

### Monaco Editor
- **Syntax Highlighting**: HTML, CSS, JavaScript, JSX, TypeScript
- **Auto-Completion**: IntelliSense support
- **Format on Paste**: Automatic code formatting
- **Word Wrap**: Enabled by default
- **Theme**: VS Code Dark theme

### File Management
- **Multi-File Support**: Create and manage multiple files
- **File Types**: HTML, CSS, JS, JSX, TS, TSX, JSON
- **Auto-Save**: Files saved to localStorage every 500ms
- **File Icons**: Visual indicators for different file types

### Live Preview
- **Real-Time Updates**: Preview updates as you type
- **Sandbox Environment**: Secure iframe with scripts enabled
- **Auto-Refresh**: Automatic preview refresh on code changes
- **Full-Screen Mode**: Expandable preview panel

## 🚀 Deployment Features

### GitHub Integration

#### New Repository Creation
- Create public or private repositories
- Add descriptions
- Automatic initial commit
- GitHub Pages setup for public repos

#### Existing Repository Updates
- List all user repositories
- Select from dropdown
- Custom commit messages
- Preserve repository settings

#### API Endpoints
- `POST /api/github` - Create/update repositories
- `GET /api/github/repos/list` - List user repositories

### Vercel Integration

#### Project Deployment
- Create new Vercel projects
- Update existing deployments
- Instant HTTPS URLs
- Production deployments

#### API Endpoints
- `POST /api/vercel` - Deploy projects
- `GET /api/vercel/projects` - List Vercel projects

## 🎯 Smart Features

### Quick Actions
Pre-configured templates for rapid development:
- Todo App (React + Tailwind)
- Dashboard (Vite + React + TypeScript)
- Portfolio (Modern React + Vite)
- Calculator (React + Tailwind)
- Chat UI (React + Real-time features)

### Learning Panel
- **Code Analysis**: Suggests learning topics based on current code
- **Interactive Questions**: Ask about specific code elements
- **Context-Aware**: Recommendations change with your code

### Tutorials System
Built-in tutorials for popular frameworks:
- React Basics
- Next.js Fundamentals
- Tailwind CSS
- TypeScript
- Node.js
- And more...

## 💾 Storage System

### Local Storage Structure
```javascript
{
  "aiAppBuilderKeys": {
    "geminiApiKey": "...",
    "githubToken": "...",
    "vercelToken": "..."
  },
  "aiAppBuilderFiles": [
    {
      "name": "index.html",
      "type": "file",
      "content": "...",
      "path": "/index.html"
    }
  ],
  "aiAppBuilderConversations": {
    "projectName": {
      "id": "...",
      "messages": [...],
      "createdAt": "...",
      "updatedAt": "..."
    }
  },
  "aiAppBuilderPrompt": "last used prompt"
}
```

### Storage Warnings
- Automatic warning on first visit
- Clear indication of local storage usage
- Export recommendations
- Cache clearing warnings

## 🔧 API Routes

### `/api/generate`
**Purpose**: AI code generation and conversation handling
**Methods**: POST
**Request Body**:
```json
{
  "prompt": "user request",
  "apiKey": "gemini_api_key",
  "conversationHistory": [...],
  "currentCode": "existing code",
  "projectContext": "project name"
}
```

### `/api/github`
**Purpose**: GitHub repository management
**Methods**: POST, GET
**Actions**: create, update, list

### `/api/vercel`
**Purpose**: Vercel deployment management
**Methods**: POST
**Actions**: create, update

## 🎨 UI Components

### Resizable Panels
- **File Explorer**: 15-25% default width
- **Code Editor**: 50-75% default width
- **AI Assistant**: 20-25% default width
- **Preview**: 25-35% default width

### Panel Controls
- Collapse/Expand buttons
- Drag handles for resizing
- Persistent layout preferences
- Responsive design

### Theme & Styling
- **Primary Colors**: Purple-600, Pink-600 gradients
- **Background**: Gray-900 (dark mode)
- **Accent**: Purple-500
- **Font**: System UI stack
- **Icons**: Lucide React

## ⚡ Performance Features

### Optimization
- **Code Splitting**: Automatic Next.js code splitting
- **Lazy Loading**: Monaco Editor loaded on demand
- **Debouncing**: Auto-save with 500ms debounce
- **Caching**: 15-minute web fetch cache

### Error Handling
- **API Failures**: Graceful degradation with user feedback
- **Network Issues**: Retry logic with exponential backoff
- **Storage Limits**: Warning when approaching localStorage limits
- **Invalid Input**: Validation with helpful error messages

## 🔒 Security Features

### API Key Management
- **Client-Side Storage**: Keys stored in browser localStorage
- **No Server Storage**: Keys never sent to server
- **User-Specific**: Each user manages their own keys
- **Secure Transmission**: HTTPS only

### Code Execution
- **Sandboxed Preview**: iframe with limited permissions
- **No Server Execution**: All code runs client-side
- **XSS Prevention**: Sanitized user input

## 📱 Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features
- localStorage
- ES2020 JavaScript
- WebSocket (for real-time features)
- Service Workers (for PWA features)

## 🚀 Future Features (Roadmap)

### Planned Enhancements
- **Multi-Model Support**: GPT-4, Claude, Llama integration
- **Collaboration**: Real-time collaborative editing
- **Templates**: Expanded template library
- **Components**: Reusable component marketplace
- **Mobile**: Responsive mobile editor
- **Plugins**: Extension system
- **Docker**: Containerized deployments
- **CI/CD**: Automated pipeline generation