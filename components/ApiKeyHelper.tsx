'use client';

import { Key, ExternalLink, CheckCircle, Copy, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ApiKeyHelperProps {
  onClose?: () => void;
  compact?: boolean;
}

export default function ApiKeyHelper({ onClose, compact = false }: ApiKeyHelperProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const apiKeyUrl = 'https://aistudio.google.com/apikey';

  if (compact) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-400">API Key Required</span>
          </div>
          <a
            href={apiKeyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300"
          >
            <span>Get Free Key</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-purple-600/20 rounded-lg">
          <Key className="w-6 h-6 text-purple-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Get Your Free Gemini API Key</h2>
      </div>

      <div className="space-y-4">
        <p className="text-gray-300">
          To use the AI App Builder, you'll need a free Google Gemini API key. 
          Your API key is stored securely in your browser's local storage and is never sent to our servers.
        </p>

        <div className="bg-gray-900 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Setup Steps:</h3>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs text-white font-bold">
                1
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-300">Click the link below to open Google AI Studio</p>
                <div className="mt-2 flex items-center space-x-2">
                  <a
                    href={apiKeyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <span>Open Google AI Studio</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => copyToClipboard(apiKeyUrl)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    title="Copy link"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs text-white font-bold">
                2
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-300">Sign in with your Google account (free)</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs text-white font-bold">
                3
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-300">Click "Get API Key" and then "Create API Key"</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs text-white font-bold">
                4
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-300">Copy your API key and paste it in the Settings</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-300">
              <p className="font-medium">Free Tier Benefits:</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• 1,500 requests per day</li>
                <li>• Access to Gemini 2.0 Flash model</li>
                <li>• No credit card required</li>
                <li>• Instant activation</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-xs text-gray-400">
            <span className="font-medium">Privacy Note:</span> Your API key is stored locally in your browser 
            and is only used to communicate directly with Google's API. We never store or have access to your API key.
          </p>
        </div>

        {onClose && (
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <span>Got it</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}