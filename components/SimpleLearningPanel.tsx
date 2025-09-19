'use client';

import { useState } from 'react';
import { 
  MessageSquare,
  HelpCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Sparkles,
  Code2
} from 'lucide-react';

interface SimpleLearningPanelProps {
  code: string;
  onAskQuestion: (question: string) => void;
  isGenerating: boolean;
}

export default function SimpleLearningPanel({ code, onAskQuestion, isGenerating }: SimpleLearningPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [learningMode, setLearningMode] = useState<'beginner' | 'normal'>('beginner');

  const quickQuestions = [
    { 
      icon: <HelpCircle className="w-4 h-4" />, 
      text: "Explain this code in simple terms",
      prompt: "Explain the generated code in simple terms that a beginner can understand. Break down each section and explain what it does and why."
    },
    { 
      icon: <Code2 className="w-4 h-4" />, 
      text: "How can I modify this?",
      prompt: "Show me 3 simple modifications I can make to this code to customize it, with step-by-step instructions for each."
    },
    { 
      icon: <Lightbulb className="w-4 h-4" />, 
      text: "What concepts are used here?",
      prompt: "List and explain the programming concepts used in this code (like loops, functions, CSS properties, etc.) with simple examples."
    },
    { 
      icon: <MessageSquare className="w-4 h-4" />, 
      text: "Common mistakes to avoid",
      prompt: "What are common mistakes beginners make with this type of code, and how can I avoid them?"
    },
  ];

  const handleQuickQuestion = (question: any) => {
    const fullPrompt = `${question.prompt}

Current code to explain:
${code.substring(0, 1000)}${code.length > 1000 ? '...' : ''}

Please provide a beginner-friendly explanation with examples.`;
    
    onAskQuestion(fullPrompt);
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700">
      {/* Collapsed Header */}
      <div 
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-750 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <BookOpen className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-white">Learning Helper</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">
              AI adds comments to help you understand
            </span>
            <Sparkles className="w-3 h-3 text-yellow-500" />
          </div>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-700 p-4">
          <div className="space-y-3">
            {/* Info Box */}
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-3 border border-purple-700/50">
              <p className="text-xs text-gray-300">
                <span className="font-semibold text-white">💡 Learning Mode Active:</span> The AI automatically adds helpful comments to explain the code. 
                Look for comments in green (in the editor) that explain what each part does!
              </p>
            </div>

            {/* Quick Questions */}
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">Need more help? Ask the AI:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    disabled={isGenerating}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {question.icon}
                    <span>{question.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Learning Tips */}
            <div className="bg-gray-700/50 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-white mb-2">📚 How to Learn from This Code:</h4>
              <ol className="text-xs text-gray-300 space-y-1 list-decimal list-inside">
                <li>Read the comments first to understand the structure</li>
                <li>Try changing small values (colors, text, sizes)</li>
                <li>See what breaks when you remove something</li>
                <li>Use the preview to see your changes instantly</li>
                <li>Ask questions when you don't understand</li>
              </ol>
            </div>

            {/* Custom Question */}
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Ask any question about this code..."
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-xs placeholder-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    onAskQuestion(`Please answer this question about the code: ${e.currentTarget.value}`);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors"
                onClick={() => {
                  const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (input?.value) {
                    onAskQuestion(`Please answer this question about the code: ${input.value}`);
                    input.value = '';
                  }
                }}
              >
                Ask
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}