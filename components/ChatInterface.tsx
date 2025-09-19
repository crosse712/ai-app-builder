'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Loader2, 
  User, 
  Bot, 
  Trash2, 
  Download, 
  Upload, 
  AlertTriangle,
  Save,
  Clock,
  MessageSquare,
  ChevronDown,
  Copy,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  code?: string;
  intent?: 'code_generation' | 'code_modification' | 'conversation' | 'explanation';
  codeUpdated?: boolean;
}

export interface Conversation {
  id: string;
  projectName: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  context?: string;
}

interface ChatInterfaceProps {
  onGenerateCode: (prompt: string, conversationHistory: Message[]) => Promise<any>;
  isGenerating: boolean;
  currentProjectName: string;
  apiKeyConfigured: boolean;
  onCodeUpdate?: (code: string) => void;
  currentCode?: string;
}

export default function ChatInterface({ 
  onGenerateCode, 
  isGenerating, 
  currentProjectName,
  apiKeyConfigured,
  onCodeUpdate,
  currentCode 
}: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [showStorageWarning, setShowStorageWarning] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('aiAppBuilderConversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        Object.keys(parsed).forEach(key => {
          parsed[key].messages = parsed[key].messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          parsed[key].createdAt = new Date(parsed[key].createdAt);
          parsed[key].updatedAt = new Date(parsed[key].updatedAt);
        });
        setConversations(parsed);
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    }

    // Check if first time user
    const hasSeenWarning = localStorage.getItem('aiAppBuilderStorageWarning');
    if (!hasSeenWarning) {
      setShowStorageWarning(true);
      localStorage.setItem('aiAppBuilderStorageWarning', 'true');
    }
  }, []);

  // Initialize or load conversation for current project
  useEffect(() => {
    if (currentProjectName) {
      let conversation = conversations[currentProjectName];
      
      if (!conversation) {
        conversation = {
          id: generateId(),
          projectName: currentProjectName,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          context: `Project: ${currentProjectName}`
        };
        
        // Add welcome message
        conversation.messages.push({
          id: generateId(),
          role: 'assistant',
          content: `Hello! I'm your AI assistant for the "${currentProjectName}" project. I'll remember our entire conversation and maintain context about what we're building together. How can I help you today?`,
          timestamp: new Date()
        });
        
        setConversations(prev => ({
          ...prev,
          [currentProjectName]: conversation
        }));
      }
      
      setCurrentConversation(conversation);
    }
  }, [currentProjectName, conversations]);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(conversations).length > 0) {
      localStorage.setItem('aiAppBuilderConversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isGenerating) return;
    
    if (!apiKeyConfigured) {
      toast.error('Please configure your API key in Settings first');
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    // Add user message to conversation
    const updatedConversation = {
      ...currentConversation!,
      messages: [...(currentConversation?.messages || []), userMessage],
      updatedAt: new Date()
    };

    setConversations(prev => ({
      ...prev,
      [currentProjectName]: updatedConversation
    }));
    setCurrentConversation(updatedConversation);
    setMessage('');

    try {
      // Generate code with conversation context
      const response = await onGenerateCode(message, updatedConversation.messages);
      
      let assistantMessage: Message;
      
      if (response?.isConversation) {
        // It's just a conversation, not code generation
        assistantMessage = {
          id: generateId(),
          role: 'assistant',
          content: response.response || 'I understand. How else can I help you?',
          timestamp: new Date(),
          intent: response.intent
        };
      } else if (response?.code) {
        // Code was generated or modified
        const actionText = response.intent === 'code_modification' 
          ? 'I\'ve updated your code with the requested changes.'
          : 'I\'ve generated new code for you.';
          
        assistantMessage = {
          id: generateId(),
          role: 'assistant',
          content: `${actionText} Check the editor to see the changes. The live preview has been updated automatically.`,
          timestamp: new Date(),
          intent: response.intent,
          codeUpdated: true,
          code: response.code
        };
        
        // Update the code in the editor if callback provided
        if (onCodeUpdate && response.code) {
          onCodeUpdate(response.code);
        }
      } else {
        // Fallback response
        assistantMessage = {
          id: generateId(),
          role: 'assistant',
          content: 'I\'ve processed your request. Please check the results.',
          timestamp: new Date()
        };
      }

      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage],
        updatedAt: new Date()
      };

      setConversations(prev => ({
        ...prev,
        [currentProjectName]: finalConversation
      }));
      setCurrentConversation(finalConversation);
    } catch (error) {
      console.error('Failed to process request:', error);
      
      // Add error message to conversation
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      
      const errorConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, errorMessage],
        updatedAt: new Date()
      };
      
      setConversations(prev => ({
        ...prev,
        [currentProjectName]: errorConversation
      }));
      setCurrentConversation(errorConversation);
    }
  };

  const clearConversation = () => {
    if (confirm(`Clear all conversation history for "${currentProjectName}"? This cannot be undone.`)) {
      const newConversation: Conversation = {
        id: generateId(),
        projectName: currentProjectName,
        messages: [{
          id: generateId(),
          role: 'assistant',
          content: `Conversation cleared. Starting fresh for the "${currentProjectName}" project. How can I help you?`,
          timestamp: new Date()
        }],
        createdAt: new Date(),
        updatedAt: new Date(),
        context: `Project: ${currentProjectName}`
      };

      setConversations(prev => ({
        ...prev,
        [currentProjectName]: newConversation
      }));
      setCurrentConversation(newConversation);
      toast.success('Conversation history cleared');
    }
  };

  const exportConversations = () => {
    const dataStr = JSON.stringify(conversations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-app-builder-conversations-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Conversations exported successfully');
  };

  const importConversations = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        // Convert date strings back to Date objects
        Object.keys(imported).forEach(key => {
          imported[key].messages = imported[key].messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          imported[key].createdAt = new Date(imported[key].createdAt);
          imported[key].updatedAt = new Date(imported[key].updatedAt);
        });
        
        setConversations(prev => ({
          ...prev,
          ...imported
        }));
        toast.success('Conversations imported successfully');
      } catch (error) {
        toast.error('Failed to import conversations. Invalid file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyMessage = (msg: Message) => {
    navigator.clipboard.writeText(msg.content);
    setCopiedMessageId(msg.id);
    toast.success('Message copied to clipboard');
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="h-full flex flex-col bg-gray-850">
      {/* Storage Warning */}
      {showStorageWarning && (
        <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3 m-3 mb-0">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-yellow-400 font-medium">Important: Local Storage Notice</p>
              <p className="text-xs text-yellow-400/80 mt-1">
                Your conversations and projects are saved in browser's local storage. 
                If you clear your browser cache, all saved data will be lost. 
                Use the export feature to backup important conversations.
              </p>
              <button
                onClick={() => setShowStorageWarning(false)}
                className="text-xs text-yellow-400 underline mt-2 hover:text-yellow-300"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">
              {currentProjectName} Chat
            </span>
            {currentConversation && (
              <span className="text-xs text-gray-500">
                ({currentConversation.messages.length} messages)
              </span>
            )}
            <div className="flex items-center space-x-1 px-2 py-0.5 bg-gray-700 rounded text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gray-400">AI Context Active</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={clearConversation}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={exportConversations}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Export all conversations"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Import conversations"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={importConversations}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {currentConversation?.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                msg.role === 'user' ? 'bg-purple-600 ml-2' : 'bg-gray-700 mr-2'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-purple-400" />
                )}
              </div>
              
              <div className={`group relative ${msg.role === 'user' ? 'bg-purple-600' : msg.intent === 'conversation' ? 'bg-blue-900' : 'bg-gray-800'} rounded-lg px-3 py-2`}>
                {msg.intent && msg.role === 'assistant' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      msg.intent === 'code_generation' ? 'bg-green-800 text-green-300' :
                      msg.intent === 'code_modification' ? 'bg-yellow-800 text-yellow-300' :
                      msg.intent === 'conversation' ? 'bg-blue-800 text-blue-300' :
                      'bg-purple-800 text-purple-300'
                    }`}>
                      {msg.intent === 'code_generation' ? '🎨 Generated Code' :
                       msg.intent === 'code_modification' ? '✏️ Modified Code' :
                       msg.intent === 'conversation' ? '💬 Conversation' :
                       '📖 Explanation'}
                    </span>
                    {msg.codeUpdated && (
                      <span className="text-xs text-green-400">
                        ✓ Editor updated
                      </span>
                    )}
                  </div>
                )}
                
                <p className="text-sm text-white whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
                
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-700/50">
                  <span className="text-xs text-gray-400">
                    {formatTime(msg.timestamp)}
                  </span>
                  
                  <button
                    onClick={() => copyMessage(msg)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-700/50 rounded"
                    title="Copy message"
                  >
                    {copiedMessageId === msg.id ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isGenerating && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center">
                <Bot className="w-4 h-4 text-purple-400" />
              </div>
              <div className="bg-gray-800 rounded-lg px-3 py-2">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-sm text-gray-400">Generating code...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 p-4 bg-gray-800">
        <div className="flex space-x-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Describe what you want to build or modify..."
            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none placeholder-gray-500 resize-none text-sm"
            rows={2}
            disabled={isGenerating}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={isGenerating || !message.trim() || !apiKeyConfigured}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            Press Enter to send • Shift+Enter for new line
          </p>
          <p className="text-xs text-gray-500">
            Context: {currentConversation?.messages.length || 0} messages
          </p>
        </div>
      </div>
    </div>
  );
}