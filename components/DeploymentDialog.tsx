'use client';

import { useState } from 'react';
import { X, Github, Rocket, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface DeploymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  platform: 'github' | 'vercel';
  apiKeys: {
    githubToken: string;
    vercelToken: string;
  };
}

export default function DeploymentDialog({ isOpen, onClose, code, platform, apiKeys }: DeploymentDialogProps) {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  if (!isOpen) return null;

  const handleDeploy = async () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    setIsDeploying(true);

    try {
      const endpoint = platform === 'github' ? '/api/github' : '/api/vercel';
      const body = platform === 'github' 
        ? { code, repoName: projectName, description, isPrivate, githubToken: apiKeys.githubToken }
        : { code, projectName, vercelToken: apiKeys.vercelToken };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        // Show success message
        if (data.message) {
          toast.success(data.message);
        } else {
          toast.success(`Successfully deployed to ${platform === 'github' ? 'GitHub' : 'Vercel'}!`);
        }
        
        // Open the deployment URL in a new tab
        if (data.repoUrl || data.deploymentUrl) {
          const url = data.repoUrl || data.deploymentUrl;
          toast.success(`Opening ${platform === 'github' ? 'repository' : 'deployment'} in new tab...`);
          setTimeout(() => {
            window.open(url, '_blank');
          }, 500);
        }
        
        // If GitHub Pages URL is available, show it
        if (data.pagesUrl) {
          setTimeout(() => {
            toast.success(`GitHub Pages will be available at: ${data.pagesUrl}`, {
              duration: 5000,
            });
          }, 1000);
        }
        
        onClose();
        setProjectName('');
        setDescription('');
        setIsPrivate(false);
      }
    } catch (error) {
      toast.error(`Failed to deploy to ${platform === 'github' ? 'GitHub' : 'Vercel'}`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            {platform === 'github' ? (
              <Github className="w-5 h-5 text-white" />
            ) : (
              <Rocket className="w-5 h-5 text-purple-500" />
            )}
            <h2 className="text-xl font-semibold text-white">
              Deploy to {platform === 'github' ? 'GitHub' : 'Vercel'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder={platform === 'github' ? 'my-awesome-app' : 'my-vercel-app'}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {platform === 'github' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description of your project"
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="private"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="private" className="text-sm text-gray-300">
                  Make repository private
                </label>
              </div>
            </>
          )}

          <div className="bg-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-400">
              {platform === 'github' 
                ? 'Your code will be pushed to a new GitHub repository. Public repos can be hosted on GitHub Pages.'
                : 'Your app will be deployed to Vercel instantly and will be accessible via a unique URL.'}
            </p>
            {platform === 'github' && (
              <p className="text-xs text-yellow-400 mt-2">
                💡 Tip: Public repos will have GitHub Pages enabled automatically.
              </p>
            )}
            {platform === 'vercel' && (
              <p className="text-xs text-green-400 mt-2">
                ⚡ Your app will be live in seconds with automatic HTTPS!
              </p>
            )}
          </div>
        </div>

        <div className="flex space-x-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeploy}
            disabled={isDeploying}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isDeploying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deploying...</span>
              </>
            ) : (
              <span>Deploy</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}