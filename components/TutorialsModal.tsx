'use client';

import { useState } from 'react';
import { X, Clock, Zap, BookOpen, ChevronRight, Star, Trophy } from 'lucide-react';
import { tutorials, getTutorialsByDifficulty, Tutorial } from '@/data/tutorials';

interface TutorialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTutorial: (prompt: string, framework: string) => void;
}

export default function TutorialsModal({ isOpen, onClose, onSelectTutorial }: TutorialsModalProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);

  if (!isOpen) return null;

  const filteredTutorials = selectedDifficulty === 'all' 
    ? tutorials 
    : getTutorialsByDifficulty(selectedDifficulty);

  const handleStartTutorial = (tutorial: Tutorial) => {
    onSelectTutorial(tutorial.prompt, tutorial.framework);
    onClose();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-900 text-green-300';
      case 'intermediate': return 'bg-yellow-900 text-yellow-300';
      case 'advanced': return 'bg-red-900 text-red-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🌿';
      case 'advanced': return '🌳';
      default: return '📚';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-bold text-white">Learning Tutorials</h2>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Step-by-step projects to build your coding skills
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Difficulty Filter */}
        <div className="px-6 py-4 border-b border-gray-700 bg-gray-750">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Filter by level:</span>
            {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
              <button
                key={level}
                onClick={() => setSelectedDifficulty(level as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedDifficulty === level
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tutorials Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTutorials.map((tutorial) => {
              const isCompleted = completedTutorials.includes(tutorial.id);
              
              return (
                <div
                  key={tutorial.id}
                  className="bg-gray-700 rounded-lg p-5 hover:bg-gray-650 transition-all hover:scale-[1.02] cursor-pointer group"
                  onClick={() => handleStartTutorial(tutorial)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{tutorial.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                          {tutorial.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(tutorial.difficulty)}`}>
                            {getDifficultyIcon(tutorial.difficulty)} {tutorial.difficulty}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {tutorial.estimatedTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isCompleted && (
                      <Trophy className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>

                  <p className="text-sm text-gray-300 mb-3">
                    {tutorial.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">You'll learn:</span>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tutorial.concepts.map((concept, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-600">
                    <button className="w-full py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 text-purple-300 rounded-lg text-sm font-medium transition-all">
                      Start Tutorial →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Tips */}
        <div className="px-6 py-4 border-t border-gray-700 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <p className="text-xs text-gray-300">
              <span className="font-semibold text-white">Pro Tip:</span> Start with beginner tutorials to understand the basics, 
              then progress to more complex projects. Each tutorial is designed to teach specific concepts you can apply to your own projects!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}