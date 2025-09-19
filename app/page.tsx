'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { 
  Sparkles, 
  Code2, 
  Eye, 
  Github, 
  Rocket,
  Settings,
  Download,
  Upload,
  Play,
  Save,
  RefreshCw,
  Info,
  Key,
  AlertCircle,
  Trash2,
  Check,
  BookOpen,
  GraduationCap,
  Folder,
  FolderOpen,
  File,
  FileCode,
  FileText,
  Plus,
  X,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Send,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import EnhancedDeploymentDialog from '@/components/EnhancedDeploymentDialog';
import SettingsModal, { ApiKeys } from '@/components/SettingsModal';
import ProjectSelector from '@/components/ProjectSelector';
import WelcomeGuide from '@/components/WelcomeGuide';
import SimpleLearningPanel from '@/components/SimpleLearningPanel';
import ChatInterface, { Message } from '@/components/ChatInterface';
import TutorialsModal from '@/components/TutorialsModal';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  path: string;
}

export default function Home() {
  const defaultCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My App</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 100%;
        }
        h1 {
            color: #333;
            margin-bottom: 1rem;
        }
        p {
            color: #666;
            line-height: 1.6;
        }
        .button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-size: 1rem;
            cursor: pointer;
            margin-top: 1rem;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to AI App Builder</h1>
        <p>Start building your app with AI assistance. Type your prompt in the chat below!</p>
        <button class="button" onclick="alert('Hello from AI App Builder!')">Get Started</button>
    </div>
</body>
</html>`;

  const [files, setFiles] = useState<FileNode[]>([
    {
      name: 'index.html',
      type: 'file',
      content: defaultCode,
      path: '/index.html'
    }
  ]);
  const [activeFile, setActiveFile] = useState('/index.html');
  const [code, setCode] = useState(defaultCode);
  const [saved, setSaved] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [deploymentDialog, setDeploymentDialog] = useState<{
    isOpen: boolean;
    platform: 'github' | 'vercel';
  }>({ isOpen: false, platform: 'github' });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [projectSelectorOpen, setProjectSelectorOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [tutorialsOpen, setTutorialsOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    geminiApiKey: '',
    githubToken: '',
    vercelToken: '',
  });
  const [selectedModel, setSelectedModel] = useState<'gemini'>('gemini');
  const [commentLevel, setCommentLevel] = useState<'simple' | 'detailed'>('detailed');
  const [collapsedPanels, setCollapsedPanels] = useState({
    fileExplorer: false,
    aiAssistant: false,
    preview: false
  });
  const [projectName, setProjectName] = useState('My Project');
  const [showChatInterface, setShowChatInterface] = useState(true);

  // Load API keys and saved code from localStorage on mount
  useEffect(() => {
    // Load API keys
    const savedKeys = localStorage.getItem('aiAppBuilderKeys');
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys));
      } catch (error) {
        console.error('Failed to load saved API keys');
      }
    } else {
      // Show welcome guide on first visit
      setWelcomeOpen(true);
    }

    // Load saved files
    const savedFiles = localStorage.getItem('aiAppBuilderFiles');
    if (savedFiles) {
      try {
        const parsedFiles = JSON.parse(savedFiles);
        setFiles(parsedFiles);
        // Set code from active file
        const activeFileNode = findFileByPath(parsedFiles, activeFile);
        if (activeFileNode) {
          setCode(activeFileNode.content || '');
        }
      } catch (error) {
        console.error('Failed to load saved files');
      }
    }

    // Load saved prompt
    const savedPrompt = localStorage.getItem('aiAppBuilderPrompt');
    if (savedPrompt) {
      setPrompt(savedPrompt);
    }
  }, []);

  // Helper function to find file by path
  const findFileByPath = (nodes: FileNode[], path: string): FileNode | null => {
    for (const node of nodes) {
      if (node.path === path && node.type === 'file') {
        return node;
      }
      if (node.children) {
        const found = findFileByPath(node.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  // Update file content when code changes
  const updateFileContent = (path: string, content: string) => {
    const updateFiles = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.path === path && node.type === 'file') {
          return { ...node, content };
        }
        if (node.children) {
          return { ...node, children: updateFiles(node.children) };
        }
        return node;
      });
    };
    
    setFiles(prev => {
      const updated = updateFiles(prev);
      localStorage.setItem('aiAppBuilderFiles', JSON.stringify(updated));
      return updated;
    });
  };

  // Autosave code whenever it changes
  useEffect(() => {
    setSaved(false);
    const saveTimer = setTimeout(() => {
      updateFileContent(activeFile, code);
      setSaved(true);
    }, 500); // Save after 500ms of no changes

    return () => clearTimeout(saveTimer);
  }, [code, activeFile]);

  // Save prompt when it changes
  useEffect(() => {
    localStorage.setItem('aiAppBuilderPrompt', prompt);
  }, [prompt]);

  // Save API keys to localStorage
  const saveApiKeys = (keys: ApiKeys) => {
    setApiKeys(keys);
    localStorage.setItem('aiAppBuilderKeys', JSON.stringify(keys));
  };

  const generateCode = async (promptText?: string, conversationHistory?: Message[]) => {
    const actualPrompt = promptText || prompt;
    if (!actualPrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    // Check API key for Gemini
    if (!apiKeys.geminiApiKey) {
      toast.error('Please add your Gemini API key in Settings');
      setSettingsOpen(true);
      return;
    }

    setIsGenerating(true);
    try {
      const endpoint = '/api/generate';
      const apiKey = apiKeys.geminiApiKey;
      
      // Build context from conversation history
      let contextPrompt = actualPrompt;
      if (conversationHistory && conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-10); // Last 10 messages for context
        const context = recentHistory
          .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n');
        contextPrompt = `Previous conversation context:\n${context}\n\nCurrent request: ${actualPrompt}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: contextPrompt,
          apiKey,
          githubToken: apiKeys.githubToken,
          commentLevel,
          projectContext: projectName,
          conversationHistory: conversationHistory,
          currentCode: code
        }),
      });

      const data = await response.json();
      
      // Handle special project loading actions
      if (data.action === 'list_projects') {
        setProjectSelectorOpen(true);
        toast(data.message);
      } else if (data.action === 'load_url') {
        // Load project from GitHub URL
        const loadResponse = await fetch(
          `/api/github/repos?token=${apiKeys.githubToken}&action=fetch&url=${encodeURIComponent(data.githubUrl)}`
        );
        const loadData = await loadResponse.json();
        
        if (loadData.code) {
          setCode(loadData.code);
          updateFileContent(activeFile, loadData.code);
          setPreviewKey(prev => prev + 1);
          if (loadData.source) {
            toast.success(`Loaded from ${loadData.repoName} (${loadData.source})`);
          } else {
            toast.success(`Loaded: ${loadData.repoName}`);
          }
        } else if (loadData.error) {
          toast.error(loadData.error);
        }
      } else if (data.action === 'load_project') {
        // Try to load the specific project
        const loadResponse = await fetch(
          `/api/github/repos?token=${apiKeys.githubToken}&action=fetch&repo=${data.projectName}`
        );
        const loadData = await loadResponse.json();
        
        if (loadData.code) {
          setCode(loadData.code);
          updateFileContent(activeFile, loadData.code);
          setPreviewKey(prev => prev + 1);
          toast.success(`Loaded project: ${data.projectName}`);
        } else {
          // If not found by exact name, show project selector
          setProjectSelectorOpen(true);
          toast(`Couldn't find "${data.projectName}". Select from your projects:`);
        }
      } else if (data.error) {
        toast.error(data.error);
        if (data.requiresGitHub) {
          toast.error('Add your GitHub token to load projects');
          setSettingsOpen(true);
        } else if (data.error.includes('API key')) {
          setSettingsOpen(true);
        }
        return data; // Return error for chat interface
      } else if (data.isConversation) {
        // Just conversation, no code update
        return data;
      } else if (data.code) {
        setCode(data.code);
        updateFileContent(activeFile, data.code);
        setPreviewKey(prev => prev + 1);
        
        // Show different toast based on intent
        if (data.intent === 'code_modification') {
          toast.success('Code updated with your changes!');
        } else {
          toast.success('Code generated successfully!');
        }
        
        return data; // Return the full response for chat interface
      }
      
      return data; // Return any response
    } catch (error) {
      toast.error('Failed to process request');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeploy = (platform: 'github' | 'vercel') => {
    const token = platform === 'github' ? apiKeys.githubToken : apiKeys.vercelToken;
    
    if (!token) {
      toast.error(`Please add your ${platform === 'github' ? 'GitHub' : 'Vercel'} token in Settings`);
      setSettingsOpen(true);
      return;
    }
    
    setDeploymentDialog({ isOpen: true, platform });
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.split('/').pop() || 'app.html';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Code downloaded!');
  };

  const resetProject = () => {
    if (confirm('Are you sure you want to reset? This will clear all your files.')) {
      setFiles([{
        name: 'index.html',
        type: 'file',
        content: defaultCode,
        path: '/index.html'
      }]);
      setActiveFile('/index.html');
      setCode(defaultCode);
      setPrompt('');
      localStorage.removeItem('aiAppBuilderFiles');
      localStorage.removeItem('aiAppBuilderPrompt');
      toast.success('Project reset to default');
    }
  };

  const handleProjectSelect = (code: string, projectName: string) => {
    setCode(code);
    updateFileContent(activeFile, code);
    setPreviewKey(prev => prev + 1);
    toast.success(`Loaded: ${projectName}`);
  };

  const handleTutorialSelect = (tutorialPrompt: string, tutorialFramework: string) => {
    setPrompt(tutorialPrompt);
    generateCode();
  };

  const handleLearningQuestion = (question: string) => {
    setPrompt(question);
    generateCode();
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const handleFileClick = (file: FileNode) => {
    if (file.type === 'file') {
      // Save current file before switching
      updateFileContent(activeFile, code);
      setActiveFile(file.path);
      setCode(file.content || '');
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'html':
      case 'jsx':
      case 'tsx':
        return <FileCode className="w-4 h-4 text-orange-400" />;
      case 'css':
      case 'scss':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'js':
      case 'ts':
        return <FileCode className="w-4 h-4 text-yellow-400" />;
      case 'json':
        return <FileText className="w-4 h-4 text-green-400" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.path}>
        {node.type === 'folder' ? (
          <>
            <div
              className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-700 cursor-pointer"
              style={{ paddingLeft: `${level * 12 + 8}px` }}
              onClick={() => toggleFolder(node.path)}
            >
              {expandedFolders.has(node.path) ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              {expandedFolders.has(node.path) ? (
                <FolderOpen className="w-4 h-4 text-yellow-500" />
              ) : (
                <Folder className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm text-gray-300">{node.name}</span>
            </div>
            {expandedFolders.has(node.path) && node.children && (
              <div>{renderFileTree(node.children, level + 1)}</div>
            )}
          </>
        ) : (
          <div
            className={`flex items-center space-x-2 px-2 py-1 hover:bg-gray-700 cursor-pointer ${
              activeFile === node.path ? 'bg-gray-700 border-l-2 border-purple-500' : ''
            }`}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={() => handleFileClick(node)}
          >
            {getFileIcon(node.name)}
            <span className="text-sm text-gray-300">{node.name}</span>
          </div>
        )}
      </div>
    ));
  };

  // Get current file content for preview
  const getPreviewContent = () => {
    // Use the code state directly for immediate preview updates
    return code;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-6 h-6 text-purple-500" />
              <h1 className="text-xl font-bold text-white">AI App Builder</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">Project:</span>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="px-2 py-1 text-xs bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                placeholder="Project name"
              />
            </div>
            <span className="text-xs text-gray-400">Modern Web Development with AI</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* API Key Status Indicator */}
            <div className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-gray-700">
              {apiKeys.geminiApiKey ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-400">API Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-yellow-400">API Key Required</span>
                </>
              )}
            </div>
            
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="API Settings"
            >
              <Key className="w-5 h-5" />
            </button>
            
            <div className="w-px h-6 bg-gray-700"></div>
            
            <button
              onClick={() => setTutorialsOpen(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">Tutorials</span>
            </button>
            
            <button
              onClick={resetProject}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Reset Project"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            
            <button
              onClick={downloadCode}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Download Code"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => handleDeploy('github')}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              title="Deploy to GitHub"
            >
              <Github className="w-4 h-4" />
              <span className="text-sm">GitHub</span>
            </button>
            
            <button
              onClick={() => handleDeploy('vercel')}
              className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-lg transition-colors border border-gray-600"
              title="Deploy to Vercel"
            >
              <Rocket className="w-4 h-4" />
              <span className="text-sm">Vercel</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Left Panel: File Explorer + Code Editor */}
          <Panel defaultSize={collapsedPanels.fileExplorer ? 5 : 40} minSize={collapsedPanels.fileExplorer ? 5 : 30}>
            <PanelGroup direction="horizontal">
              {/* File Explorer */}
              <Panel defaultSize={25} minSize={15}>
                {collapsedPanels.fileExplorer ? (
                  <div className="h-full bg-gray-900 border-r border-gray-700 flex items-center justify-center">
                    <button
                      onClick={() => setCollapsedPanels(prev => ({ ...prev, fileExplorer: false }))}
                      className="text-gray-400 hover:text-white transition-colors p-2"
                      title="Expand Files"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <PanelLeftOpen className="w-5 h-5" />
                        <span className="text-xs" style={{ writingMode: 'vertical-lr' }}>Files</span>
                      </div>
                    </button>
                  </div>
                ) : (
                <div className="h-full flex flex-col bg-gray-900 border-r border-gray-700">
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                      <Folder className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-300">Files</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title="Add file"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCollapsedPanels(prev => ({ ...prev, fileExplorer: !prev.fileExplorer }))}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title={collapsedPanels.fileExplorer ? "Expand" : "Collapse"}
                      >
                        {collapsedPanels.fileExplorer ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {renderFileTree(files)}
                  </div>
                </div>
                )}
              </Panel>

              <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-gray-600 transition-colors" />

              {/* Code Editor */}
              <Panel defaultSize={75} minSize={50}>
                <div className="h-full flex flex-col bg-gray-900">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                      <Code2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-300">{activeFile.split('/').pop()}</span>
                      {saved ? (
                        <div className="flex items-center space-x-1 text-xs text-green-400">
                          <Check className="w-3 h-3" />
                          <span>Saved</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-xs text-yellow-400">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Saving...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1" style={{ display: collapsedPanels.fileExplorer ? 'block' : 'block' }}>
                    <MonacoEditor
                      height="100%"
                      defaultLanguage="html"
                      theme="vs-dark"
                      value={code}
                      onChange={(value) => setCode(value || '')}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                        automaticLayout: true,
                        formatOnPaste: true,
                        formatOnType: true,
                      }}
                    />
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-2 bg-gray-800 hover:bg-gray-700 transition-colors" />

          {/* Middle Panel: AI Chat */}
          <Panel defaultSize={collapsedPanels.aiAssistant ? 3 : 25} minSize={collapsedPanels.aiAssistant ? 3 : 20}>
            {collapsedPanels.aiAssistant ? (
              <div className="h-full bg-gray-850 border-r border-gray-700 flex items-center justify-center">
                <button
                  onClick={() => setCollapsedPanels(prev => ({ ...prev, aiAssistant: false }))}
                  className="text-gray-400 hover:text-white transition-colors p-2"
                  title="Expand AI Assistant"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-xs" style={{ writingMode: 'vertical-lr' }}>AI</span>
                  </div>
                </button>
              </div>
            ) : (
            <div className="h-full flex flex-col bg-gray-850 border-r border-gray-700">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-gray-300">AI Assistant</span>
                  <button
                    onClick={() => setShowChatInterface(!showChatInterface)}
                    className="px-2 py-0.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                  >
                    {showChatInterface ? 'Classic' : 'Chat'}
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <Sparkles className="w-3 h-3" />
                    <span>Gemini 2.0 Flash</span>
                  </div>
                  <button
                    onClick={() => setCollapsedPanels(prev => ({ ...prev, aiAssistant: !prev.aiAssistant }))}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title={collapsedPanels.aiAssistant ? "Expand" : "Collapse"}
                  >
                    {collapsedPanels.aiAssistant ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {showChatInterface ? (
                <ChatInterface
                  onGenerateCode={generateCode}
                  isGenerating={isGenerating}
                  currentProjectName={projectName}
                  apiKeyConfigured={!!apiKeys.geminiApiKey}
                  onCodeUpdate={(newCode) => {
                    setCode(newCode);
                    updateFileContent(activeFile, newCode);
                    setPreviewKey(prev => prev + 1);
                  }}
                  currentCode={code}
                />
              ) : (
                <>
                  <div className="flex-1 p-4 overflow-y-auto">
                    {/* AI Model Status */}
                    <div className="mb-3 p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-medium text-gray-300">Gemini 2.0 Flash</span>
                      </div>
                      {!apiKeys.geminiApiKey ? (
                        <p className="text-xs text-yellow-400 mt-2">
                          ⚠️ API key required - Click settings above
                        </p>
                      ) : (
                        <p className="text-xs text-green-400 mt-2">
                          ✓ Ready to generate
                        </p>
                      )}
                    </div>
                    
                    {/* Quick prompts */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Quick Actions:</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'Todo App', tech: 'React and Tailwind CSS' },
                          { label: 'Vite Dashboard', tech: 'Vite, React and TypeScript' },
                          { label: 'Portfolio', tech: 'modern React with Vite' },
                          { label: 'Calculator', tech: 'React and Tailwind CSS' },
                          { label: 'Chat UI', tech: 'React with real-time features' }
                        ].map((quickPrompt) => (
                          <button
                            key={quickPrompt.label}
                            onClick={() => {
                              setPrompt(`Create a modern ${quickPrompt.label.toLowerCase()} with ${quickPrompt.tech}`);
                              generateCode();
                            }}
                            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                            title={`Build with ${quickPrompt.tech}`}
                          >
                            {quickPrompt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Learning Panel */}
                    <SimpleLearningPanel 
                      code={code}
                      onAskQuestion={handleLearningQuestion}
                      isGenerating={isGenerating}
                    />
                  </div>

                  {/* Prompt Input */}
                  <div className="border-t border-gray-700 p-4">
                    <div className="flex flex-col space-y-2">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            generateCode();
                          }
                        }}
                        placeholder="Describe what you want to build... (e.g., 'Create a modern calculator with React')"
                        className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none placeholder-gray-500 resize-none text-sm"
                        rows={3}
                      />
                      <button
                        onClick={() => generateCode()}
                        disabled={isGenerating || !apiKeys.geminiApiKey}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Generate</span>
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-500 text-center">
                        Press Enter to send • Shift+Enter for new line
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
            )}
          </Panel>

          <PanelResizeHandle className="w-2 bg-gray-800 hover:bg-gray-700 transition-colors" />

          {/* Right Panel: Preview */}
          <Panel defaultSize={collapsedPanels.preview ? 5 : 35} minSize={collapsedPanels.preview ? 5 : 25}>
            {collapsedPanels.preview ? (
              <div className="h-full bg-gray-800 flex items-center justify-center">
                <button
                  onClick={() => setCollapsedPanels(prev => ({ ...prev, preview: false }))}
                  className="text-gray-400 hover:text-white transition-colors p-2"
                  title="Expand Preview"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <PanelRightOpen className="w-5 h-5" />
                    <span className="text-xs" style={{ writingMode: 'vertical-lr' }}>Preview</span>
                  </div>
                </button>
              </div>
            ) : (
            <div className="h-full flex flex-col bg-white">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">Live Preview</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setPreviewKey(prev => prev + 1);
                      toast.success('Preview refreshed');
                    }}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title="Refresh preview"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Auto-refresh</span>
                  </div>
                  <button
                    onClick={() => setCollapsedPanels(prev => ({ ...prev, preview: !prev.preview }))}
                    className="p-1 text-gray-400 hover:text-white transition-colors ml-2"
                    title={collapsedPanels.preview ? "Expand" : "Collapse"}
                  >
                    {collapsedPanels.preview ? <PanelRightOpen className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-white overflow-auto">
                <iframe
                  key={previewKey}
                  srcDoc={getPreviewContent()}
                  className="w-full h-full border-0"
                  title="Preview"
                  sandbox="allow-scripts allow-forms allow-modals"
                />
              </div>
            </div>
            )}
          </Panel>
        </PanelGroup>
      </div>

      {/* Status Bar */}
      <footer className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Ready</span>
            </span>
            <span>•</span>
            <span>{files.length} file(s)</span>
            <span>•</span>
            <span>{code.length} characters</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Vite + React Ready</span>
            <span>•</span>
            <span>Real-time preview</span>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={saveApiKeys}
        currentKeys={apiKeys}
      />

      {/* Enhanced Deployment Dialog */}
      <EnhancedDeploymentDialog
        isOpen={deploymentDialog.isOpen}
        onClose={() => setDeploymentDialog({ ...deploymentDialog, isOpen: false })}
        code={code}
        platform={deploymentDialog.platform}
        apiKeys={{
          githubToken: apiKeys.githubToken,
          vercelToken: apiKeys.vercelToken,
        }}
      />

      {/* Project Selector */}
      <ProjectSelector
        isOpen={projectSelectorOpen}
        onClose={() => setProjectSelectorOpen(false)}
        onSelectProject={handleProjectSelect}
        githubToken={apiKeys.githubToken}
      />

      {/* Welcome Guide */}
      <WelcomeGuide
        isOpen={welcomeOpen}
        onClose={() => setWelcomeOpen(false)}
        onComplete={() => {
          setWelcomeOpen(false);
          setSettingsOpen(true);
        }}
      />

      {/* Tutorials Modal */}
      <TutorialsModal
        isOpen={tutorialsOpen}
        onClose={() => setTutorialsOpen(false)}
        onSelectTutorial={handleTutorialSelect}
      />
    </div>
  );
}