'use client';

import { useState, useEffect } from 'react';
import { X, Key, Save, Eye, EyeOff, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: ApiKeys) => void;
  currentKeys: ApiKeys;
}

export interface ApiKeys {
  geminiApiKey: string;
  githubToken: string;
  vercelToken: string;
}

export default function SettingsModal({ isOpen, onClose, onSave, currentKeys }: SettingsModalProps) {
  const [keys, setKeys] = useState<ApiKeys>(currentKeys);
  const [showKeys, setShowKeys] = useState({
    gemini: false,
    github: false,
    vercel: false,
  });

  useEffect(() => {
    setKeys(currentKeys);
  }, [currentKeys]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!keys.geminiApiKey.trim()) {
      toast.error('Gemini API key is required for code generation');
      return;
    }
    
    onSave(keys);
    toast.success('API keys saved successfully');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-semibold text-white">API Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Gemini API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Google Gemini API Key <span className="text-purple-400">(Required)</span>
              </label>
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1"
              >
                <span>Get API Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKeys.gemini ? 'text' : 'password'}
                value={keys.geminiApiKey}
                onChange={(e) => setKeys({ ...keys, geminiApiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2 pr-10 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKeys({ ...showKeys, gemini: !showKeys.gemini })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showKeys.gemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Powered by Google's Gemini 2.0 Flash (Experimental) - Latest and most capable model for code generation. Free tier available.
            </p>
          </div>

          {/* GitHub Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                GitHub Personal Access Token <span className="text-gray-500">(Optional)</span>
              </label>
              <a
                href="https://github.com/settings/tokens/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1"
              >
                <span>Create Token</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKeys.github ? 'text' : 'password'}
                value={keys.githubToken}
                onChange={(e) => setKeys({ ...keys, githubToken: e.target.value })}
                placeholder="ghp_..."
                className="w-full px-4 py-2 pr-10 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKeys({ ...showKeys, github: !showKeys.github })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showKeys.github ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Required for deploying to GitHub. Needs 'repo' scope.
            </p>
          </div>

          {/* Vercel Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Vercel Token <span className="text-gray-500">(Optional)</span>
              </label>
              <a
                href="https://vercel.com/account/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1"
              >
                <span>Create Token</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKeys.vercel ? 'text' : 'password'}
                value={keys.vercelToken}
                onChange={(e) => setKeys({ ...keys, vercelToken: e.target.value })}
                placeholder="..."
                className="w-full px-4 py-2 pr-10 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKeys({ ...showKeys, vercel: !showKeys.vercel })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showKeys.vercel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Required for deploying to Vercel.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-gray-700 rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-300">Important Notes:</h3>
            <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
              <li>API keys are stored locally in your browser (localStorage)</li>
              <li>Keys are never sent to our servers, only to the respective services</li>
              <li>Clear your browser data to remove stored keys</li>
              <li>Each user needs their own API keys</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-3 p-6 border-t border-gray-700 sticky bottom-0 bg-gray-800">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Keys</span>
          </button>
        </div>
      </div>
    </div>
  );
}