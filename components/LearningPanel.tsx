'use client';

import { useState } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  Lightbulb, 
  Code2, 
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  Brain,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LearningPanelProps {
  code: string;
  framework: string;
  onAskQuestion: (question: string) => void;
  isGenerating: boolean;
}

export default function LearningPanel({ code, framework, onAskQuestion, isGenerating }: LearningPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'explain' | 'challenge' | 'tips'>('explain');
  const [selectedConcept, setSelectedConcept] = useState('');

  // Learning prompts based on current code
  const learningPrompts = [
    { icon: <HelpCircle className="w-4 h-4" />, text: "Explain this code line by line", type: 'explain' },
    { icon: <Lightbulb className="w-4 h-4" />, text: "What does this CSS do?", type: 'css' },
    { icon: <Code2 className="w-4 h-4" />, text: "How can I modify this?", type: 'modify' },
    { icon: <Brain className="w-4 h-4" />, text: "What programming concepts are used here?", type: 'concepts' },
  ];

  const challenges = [
    { level: 'Beginner', task: 'Add a new button that shows an alert', points: 10 },
    { level: 'Intermediate', task: 'Make the design responsive for mobile', points: 20 },
    { level: 'Advanced', task: 'Add local storage to save user data', points: 30 },
  ];

  const codeConcepts = [
    'HTML Structure',
    'CSS Styling',
    'JavaScript Functions',
    'Event Handlers',
    'DOM Manipulation',
    'Responsive Design',
  ];

  const handleQuickQuestion = (prompt: string) => {
    const fullPrompt = `Learning Mode: ${prompt} 

Please explain in a beginner-friendly way with:
1. Simple explanation
2. Key concepts
3. Example usage
4. Common mistakes to avoid

Current code context: ${code.substring(0, 500)}...`;
    
    onAskQuestion(fullPrompt);
  };

  const handleChallenge = (challenge: any) => {
    const prompt = `Create a tutorial for: ${challenge.task}

Show me how to modify the current code to ${challenge.task}. Include:
1. Step-by-step instructions
2. Code snippets with comments
3. Explanation of why each change is needed`;

    onAskQuestion(prompt);
    toast.success(`Starting ${challenge.level} challenge!`);
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-750 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <BookOpen className="w-5 h-5 text-purple-500" />
          <span className="font-medium text-white">Learning Assistant</span>
          <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
            Free with your API key
          </span>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors">
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-700">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('explain')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'explain' 
                  ? 'text-purple-400 border-b-2 border-purple-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Explain Code</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('challenge')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'challenge' 
                  ? 'text-purple-400 border-b-2 border-purple-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Challenges</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'tips' 
                  ? 'text-purple-400 border-b-2 border-purple-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Lightbulb className="w-4 h-4" />
                <span>Learning Tips</span>
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === 'explain' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Learning Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {learningPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickQuestion(prompt.text)}
                        disabled={isGenerating}
                        className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors text-sm disabled:opacity-50"
                      >
                        {prompt.icon}
                        <span>{prompt.text}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Code Concepts to Explore</h3>
                  <div className="flex flex-wrap gap-2">
                    {codeConcepts.map((concept) => (
                      <button
                        key={concept}
                        onClick={() => {
                          setSelectedConcept(concept);
                          handleQuickQuestion(`Explain the ${concept} in this code`);
                        }}
                        className={`px-3 py-1 rounded-full text-xs transition-colors ${
                          selectedConcept === concept
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                        }`}
                      >
                        {concept}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-300">
                        <span className="font-semibold text-white">Pro Tip:</span> Click on any learning action to get detailed explanations. 
                        The AI will break down the code in a beginner-friendly way!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'challenge' && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Practice Challenges</h3>
                {challenges.map((challenge, index) => (
                  <div
                    key={index}
                    className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => handleChallenge(challenge)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            challenge.level === 'Beginner' ? 'bg-green-900 text-green-300' :
                            challenge.level === 'Intermediate' ? 'bg-yellow-900 text-yellow-300' :
                            'bg-red-900 text-red-300'
                          }`}>
                            {challenge.level}
                          </span>
                          <span className="text-xs text-gray-400">+{challenge.points} XP</span>
                        </div>
                        <p className="text-sm text-white">{challenge.task}</p>
                      </div>
                      <Zap className="w-4 h-4 text-yellow-500" />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-400 text-center mt-4">
                  Complete challenges to practice what you've learned!
                </p>
              </div>
            )}

            {activeTab === 'tips' && (
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-700">
                  <h3 className="text-sm font-semibold text-white mb-2">🎯 Learning Path</h3>
                  <ol className="text-xs text-gray-300 space-y-1 list-decimal list-inside">
                    <li>Start with simple prompts like "Create a button"</li>
                    <li>Examine the generated code carefully</li>
                    <li>Try modifying small parts</li>
                    <li>Ask for explanations when confused</li>
                    <li>Build progressively complex projects</li>
                  </ol>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">💡 Current Framework: {framework.toUpperCase()}</h3>
                  <p className="text-xs text-gray-300">
                    {framework === 'html' && "You're learning vanilla HTML/CSS/JS - perfect for understanding web fundamentals!"}
                    {framework === 'react' && "You're learning React - a popular framework for building interactive UIs!"}
                    {framework === 'vue' && "You're learning Vue - a progressive framework that's beginner-friendly!"}
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">🚀 Quick Tips</h3>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• Use the preview panel to see changes instantly</li>
                    <li>• Don't be afraid to break things - you can always reset</li>
                    <li>• Save your progress to GitHub when you create something cool</li>
                    <li>• Join our community to share and learn from others</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}