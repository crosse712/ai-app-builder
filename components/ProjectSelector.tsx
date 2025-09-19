'use client';

import { useState, useEffect } from 'react';
import { X, FolderOpen, Clock, Github, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Project {
  name: string;
  fullName?: string;
  description?: string;
  url: string;
  updatedAt: string;
  createdAt: string;
  language?: string;
  private?: boolean;
}

interface ProjectSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (code: string, projectName: string) => void;
  githubToken: string;
}

export default function ProjectSelector({ isOpen, onClose, onSelectProject, githubToken }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProject, setLoadingProject] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/github/repos?token=${githubToken}&action=list`);
      const data = await response.json();
      
      if (data.error) {
        toast.error(data.error);
      } else {
        setProjects(data.repos || []);
        if (data.repos.length === 0) {
          toast('No projects found. Deploy some apps to GitHub first!');
        }
      }
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const loadProject = async (repoName: string) => {
    setLoadingProject(repoName);
    try {
      const response = await fetch(`/api/github/repos?token=${githubToken}&action=fetch&repo=${repoName}`);
      const data = await response.json();
      
      if (data.error) {
        toast.error(data.error);
      } else {
        onSelectProject(data.code, repoName);
        toast.success(`Loaded project: ${repoName}`);
        onClose();
      }
    } catch (error) {
      toast.error('Failed to load project');
    } finally {
      setLoadingProject(null);
    }
  };

  // Fetch projects when modal opens
  useEffect(() => {
    if (isOpen && projects.length === 0) {
      fetchProjects();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Github className="w-5 h-5 text-white" />
            <h2 className="text-xl font-semibold text-white">Your GitHub Projects</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-3" />
              <p className="text-gray-400">Loading your projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-gray-400 text-center">
                No projects found.<br />
                Deploy some apps to GitHub to see them here!
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {projects.map((project) => (
                <div
                  key={project.name}
                  className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer group"
                  onClick={() => loadProject(project.fullName || project.name)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1 group-hover:text-purple-400 transition-colors">
                        {project.name}
                      </h3>
                      {project.description && project.description !== 'No description' && (
                        <p className="text-gray-400 text-sm mb-2">{project.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Updated {formatDate(project.updatedAt)}</span>
                        </span>
                        {project.language && (
                          <span className="text-purple-400">{project.language}</span>
                        )}
                        {project.private && (
                          <span className="text-yellow-400">Private</span>
                        )}
                      </div>
                    </div>
                    {loadingProject === (project.fullName || project.name) ? (
                      <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                    ) : (
                      <FolderOpen className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-900">
          <p className="text-xs text-gray-400 text-center">
            Tip: Type "show my projects" or "load my calculator app" in the prompt to quickly access your work
          </p>
        </div>
      </div>
    </div>
  );
}