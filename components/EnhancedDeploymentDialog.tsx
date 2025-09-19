'use client';

import { useState, useEffect } from 'react';
import { X, Github, Rocket, Loader2, ChevronRight, Plus, FolderOpen, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface EnhancedDeploymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  platform: 'github' | 'vercel';
  apiKeys: {
    githubToken: string;
    vercelToken: string;
  };
}

interface GitHubRepo {
  name: string;
  full_name: string;
  description?: string;
  html_url: string;
  private: boolean;
  updated_at: string;
}

interface VercelProject {
  id: string;
  name: string;
  latestDeployments?: any[];
  createdAt: number;
}

export default function EnhancedDeploymentDialog({ 
  isOpen, 
  onClose, 
  code, 
  platform, 
  apiKeys 
}: EnhancedDeploymentDialogProps) {
  const [deploymentType, setDeploymentType] = useState<'new' | 'existing' | null>(null);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // For existing projects
  const [existingProjects, setExistingProjects] = useState<GitHubRepo[] | VercelProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [commitMessage, setCommitMessage] = useState('Update from AI App Builder');

  useEffect(() => {
    if (isOpen) {
      // Reset state when dialog opens
      setDeploymentType(null);
      setProjectName('');
      setDescription('');
      setIsPrivate(false);
      setSelectedProject('');
      setCommitMessage('Update from AI App Builder');
      setExistingProjects([]);
    }
  }, [isOpen]);

  useEffect(() => {
    // Load existing projects when user selects "existing"
    if (deploymentType === 'existing' && isOpen) {
      loadExistingProjects();
    }
  }, [deploymentType]);

  const loadExistingProjects = async () => {
    setIsLoading(true);
    try {
      if (platform === 'github') {
        const response = await fetch('/api/github/repos/list', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKeys.githubToken}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setExistingProjects(data.repos || []);
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to load GitHub repositories');
        }
      } else if (platform === 'vercel') {
        const response = await fetch('/api/vercel/projects', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKeys.vercelToken}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setExistingProjects(data.projects || []);
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to load Vercel projects');
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error(`Failed to load ${platform} projects. Please check your token.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (deploymentType === 'new') {
      await deployNewProject();
    } else {
      await updateExistingProject();
    }
  };

  const deployNewProject = async () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    setIsDeploying(true);

    try {
      const endpoint = platform === 'github' ? '/api/github' : '/api/vercel';
      const body = platform === 'github' 
        ? { 
            code, 
            repoName: projectName, 
            description, 
            isPrivate, 
            githubToken: apiKeys.githubToken,
            action: 'create'
          }
        : { 
            code, 
            projectName, 
            vercelToken: apiKeys.vercelToken,
            action: 'create'
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        handleDeploymentSuccess(data);
      }
    } catch (error) {
      toast.error(`Failed to deploy to ${platform === 'github' ? 'GitHub' : 'Vercel'}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const updateExistingProject = async () => {
    if (!selectedProject) {
      toast.error('Please select a project to update');
      return;
    }

    setIsDeploying(true);

    try {
      const endpoint = platform === 'github' ? '/api/github' : '/api/vercel';
      const body = platform === 'github' 
        ? { 
            code, 
            repoName: selectedProject, 
            commitMessage,
            githubToken: apiKeys.githubToken,
            action: 'update'
          }
        : { 
            code, 
            projectId: selectedProject,
            projectName: selectedProject, // Vercel needs projectName even for updates
            vercelToken: apiKeys.vercelToken,
            action: 'update'
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        handleDeploymentSuccess(data);
      }
    } catch (error) {
      toast.error(`Failed to update ${platform === 'github' ? 'repository' : 'project'}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleDeploymentSuccess = (data: any) => {
    if (data.message) {
      toast.success(data.message);
    } else {
      toast.success(`Successfully deployed to ${platform === 'github' ? 'GitHub' : 'Vercel'}!`);
    }
    
    if (data.repoUrl || data.deploymentUrl) {
      const url = data.repoUrl || data.deploymentUrl;
      toast.success(`Opening ${platform === 'github' ? 'repository' : 'deployment'}...`);
      setTimeout(() => {
        window.open(url, '_blank');
      }, 500);
    }
    
    if (data.pagesUrl) {
      setTimeout(() => {
        toast.success(`GitHub Pages: ${data.pagesUrl}`, { duration: 5000 });
      }, 1000);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-lg w-full max-h-[80vh] flex flex-col">
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

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Step 1: Choose deployment type */}
          {!deploymentType && (
            <div className="space-y-3">
              <p className="text-sm text-gray-300 mb-4">
                Would you like to create a new project or update an existing one?
              </p>
              
              <button
                onClick={() => setDeploymentType('new')}
                className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 hover:border-purple-500 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Plus className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="font-medium text-white">Create New Project</p>
                      <p className="text-xs text-gray-400">
                        Start fresh with a new {platform === 'github' ? 'repository' : 'deployment'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </button>
              
              <button
                onClick={() => setDeploymentType('existing')}
                className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 hover:border-purple-500 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FolderOpen className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="font-medium text-white">Update Existing Project</p>
                      <p className="text-xs text-gray-400">
                        Push changes to an existing {platform === 'github' ? 'repository' : 'project'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </button>
            </div>
          )}

          {/* Step 2: New project form */}
          {deploymentType === 'new' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Plus className="w-4 h-4 text-purple-400" />
                <p className="text-sm font-medium text-gray-300">Create New Project</p>
              </div>
              
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
            </div>
          )}

          {/* Step 2: Existing project selection */}
          {deploymentType === 'existing' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <FolderOpen className="w-4 h-4 text-blue-400" />
                <p className="text-sm font-medium text-gray-300">Update Existing Project</p>
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                  <span className="ml-2 text-sm text-gray-400">Loading projects...</span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Project to Update
                    </label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">Choose a project...</option>
                      {platform === 'github' 
                        ? (existingProjects as GitHubRepo[]).map(repo => (
                            <option key={repo.full_name} value={repo.name}>
                              {repo.name} {repo.private ? '(Private)' : ''}
                            </option>
                          ))
                        : (existingProjects as VercelProject[]).map(project => (
                            <option key={project.id} value={project.name}>
                              {project.name}
                            </option>
                          ))
                      }
                    </select>
                  </div>

                  {platform === 'github' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Commit Message
                      </label>
                      <input
                        type="text"
                        value={commitMessage}
                        onChange={(e) => setCommitMessage(e.target.value)}
                        placeholder="Update from AI App Builder"
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  )}
                  
                  {existingProjects.length === 0 && !isLoading && (
                    <div className="flex items-center space-x-2 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      <p className="text-xs text-yellow-400">
                        No projects found. Make sure your {platform} token has the necessary permissions.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {deploymentType && (
            <div className="bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-400">
                {deploymentType === 'new' 
                  ? platform === 'github' 
                    ? 'Your code will be pushed to a new GitHub repository.'
                    : 'Your app will be deployed to a new Vercel project.'
                  : platform === 'github'
                    ? 'Your code will be pushed to the selected repository.'
                    : 'Your app will be deployed to the selected Vercel project.'
                }
              </p>
            </div>
          )}
        </div>

        <div className="flex space-x-3 p-6 border-t border-gray-700">
          {deploymentType && (
            <button
              onClick={() => setDeploymentType(null)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Back
            </button>
          )}
          
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          {deploymentType && (
            <button
              onClick={handleDeploy}
              disabled={isDeploying || (deploymentType === 'new' && !projectName) || (deploymentType === 'existing' && !selectedProject)}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deploying...</span>
                </>
              ) : (
                <span>{deploymentType === 'new' ? 'Create & Deploy' : 'Update'}</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}