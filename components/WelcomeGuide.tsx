'use client';

import { useState } from 'react';
import { X, Sparkles, Key, Code, Rocket, BookOpen, Target, CheckCircle, ChevronRight } from 'lucide-react';

interface WelcomeGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function WelcomeGuide({ isOpen, onClose, onComplete }: WelcomeGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Sparkles className="w-12 h-12 text-purple-500" />,
      title: "Welcome to AI Code Learning!",
      content: "Learn web development by building real apps with AI assistance. You'll understand how code works while creating amazing projects!",
      action: "Let's Start Learning!",
    },
    {
      icon: <Key className="w-12 h-12 text-blue-500" />,
      title: "Your Learning Journey, Your API Key",
      content: "You'll use your own Google AI API key (free tier available with generous limits). This means you control your learning pace and never worry about running out of credits!",
      action: "I Understand",
      subpoints: [
        "Free tier includes 60 requests per minute",
        "Perfect for learning and experimenting",
        "Your key, your control",
        "No hidden costs or surprises"
      ]
    },
    {
      icon: <Code className="w-12 h-12 text-green-500" />,
      title: "Learn by Doing",
      content: "Type what you want to build in plain English, and watch as AI generates the code. Then explore, modify, and understand how it works!",
      action: "Show Me How",
      subpoints: [
        "See code generated in real-time",
        "Live preview of your creation",
        "Edit and experiment freely",
        "Learn patterns and best practices"
      ]
    },
    {
      icon: <BookOpen className="w-12 h-12 text-orange-500" />,
      title: "Learning Features",
      content: "Special features designed to help you understand code better:",
      action: "Awesome!",
      subpoints: [
        "🔍 Code explanations on demand",
        "💡 Hover over code for hints",
        "📝 Comments explaining each section",
        "🎯 Challenges to test your knowledge"
      ]
    },
    {
      icon: <Target className="w-12 h-12 text-red-500" />,
      title: "Start with Simple Projects",
      content: "Begin your journey with guided projects perfect for beginners:",
      action: "Ready to Code!",
      examples: [
        "\"Create a simple button that changes color\"",
        "\"Make a birthday card with animation\"",
        "\"Build a calculator with basic operations\"",
        "\"Design a todo list with local storage\""
      ]
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-700">
        {/* Progress bar */}
        <div className="h-2 bg-gray-700 rounded-t-2xl overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-8">
          {/* Step indicator */}
          <div className="flex justify-between items-center mb-8">
            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              {step.icon}
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              {step.title}
            </h2>
            
            <p className="text-gray-300 text-lg mb-6">
              {step.content}
            </p>

            {step.subpoints && (
              <div className="bg-gray-800 rounded-lg p-6 mb-6 text-left">
                {step.subpoints.map((point, index) => (
                  <div key={index} className="flex items-start space-x-3 mb-3 last:mb-0">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{point}</span>
                  </div>
                ))}
              </div>
            )}

            {step.examples && (
              <div className="bg-gray-800 rounded-lg p-6 text-left">
                <p className="text-sm text-gray-400 mb-3">Try these beginner-friendly prompts:</p>
                {step.examples.map((example, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2 last:mb-0">
                    <ChevronRight className="w-4 h-4 text-purple-500" />
                    <code className="text-sm text-purple-300">{example}</code>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action button */}
          <button
            onClick={nextStep}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold text-lg transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <span>{step.action}</span>
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Skip option */}
          {currentStep === 0 && (
            <button
              onClick={onComplete}
              className="w-full mt-3 py-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              I've used this before, skip tutorial
            </button>
          )}
        </div>
      </div>
    </div>
  );
}