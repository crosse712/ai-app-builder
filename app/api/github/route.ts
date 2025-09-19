import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export async function POST(req: NextRequest) {
  try {
    const { code, repoName, description, isPrivate, githubToken, action, commitMessage } = await req.json();
    
    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub token is required. Please add it in Settings.' },
        { status: 400 }
      );
    }

    if (!repoName || !code) {
      return NextResponse.json(
        { error: 'Repository name and code are required.' },
        { status: 400 }
      );
    }

    const octokit = new Octokit({ auth: githubToken });

    // Get authenticated user
    let user;
    try {
      const response = await octokit.users.getAuthenticated();
      user = response.data;
    } catch (error: any) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Invalid GitHub token. Please check your token in Settings.' },
          { status: 401 }
        );
      }
      throw error;
    }

    // Handle different actions
    if (action === 'create') {
      // Create new repository
      let repo;
      try {
        const response = await octokit.repos.createForAuthenticatedUser({
          name: repoName,
          description: description || `Created with AI App Builder`,
          private: isPrivate,
          auto_init: false, // We'll add our file directly
        });
        repo = response.data;
      } catch (error: any) {
        if (error.status === 422 && error.message?.includes('already exists')) {
          return NextResponse.json(
            { error: `Repository "${repoName}" already exists. Please choose a different name.` },
            { status: 400 }
          );
        }
        throw error;
      }
      
      // Wait a moment for repo to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create or update the main file
      const content = Buffer.from(code).toString('base64');
      
      try {
        await octokit.repos.createOrUpdateFileContents({
          owner: user.login,
          repo: repoName,
          path: 'index.html',
          message: 'Initial commit from AI App Builder',
          content,
        });
      } catch (error: any) {
        console.error('Error creating file:', error);
      }
      
      // Enable GitHub Pages for public repos
      let pagesUrl = null;
      if (!isPrivate) {
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          await octokit.repos.createPagesSite({
            owner: user.login,
            repo: repoName,
            source: {
              branch: 'main',
              path: '/',
            },
          });
          pagesUrl = `https://${user.login}.github.io/${repoName}/`;
        } catch (error: any) {
          console.log('GitHub Pages setup:', error.message);
          pagesUrl = `https://${user.login}.github.io/${repoName}/`;
        }
      }
      
      return NextResponse.json({
        success: true,
        repoUrl: repo.html_url,
        pagesUrl: pagesUrl,
        message: pagesUrl 
          ? 'Repository created! GitHub Pages may take a few minutes to become available.'
          : 'Private repository created successfully!',
      });
      
    } else if (action === 'update') {
      // Update existing repository
      const content = Buffer.from(code).toString('base64');
      
      try {
        // First, try to get the current file to get its SHA
        let sha;
        try {
          const { data: fileData } = await octokit.repos.getContent({
            owner: user.login,
            repo: repoName,
            path: 'index.html',
          });
          
          if ('sha' in fileData) {
            sha = fileData.sha;
          }
        } catch (error) {
          // File doesn't exist, we'll create it
          console.log('File does not exist, creating new file');
        }
        
        // Update or create the file
        await octokit.repos.createOrUpdateFileContents({
          owner: user.login,
          repo: repoName,
          path: 'index.html',
          message: commitMessage || 'Update from AI App Builder',
          content,
          sha: sha, // Include SHA if updating existing file
        });
        
        // Get repo info for the URL
        const { data: repo } = await octokit.repos.get({
          owner: user.login,
          repo: repoName,
        });
        
        return NextResponse.json({
          success: true,
          repoUrl: repo.html_url,
          message: 'Repository updated successfully!',
        });
        
      } catch (error: any) {
        console.error('Error updating repository:', error);
        if (error.status === 404) {
          return NextResponse.json(
            { error: `Repository "${repoName}" not found.` },
            { status: 404 }
          );
        }
        throw error;
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "create" or "update".'},
        { status: 400 }
      );
    }

    // This code block was moved into the action === 'create' section above
  } catch (error: any) {
    console.error('GitHub deployment error:', error);
    
    // Provide more specific error messages
    if (error.status === 404) {
      return NextResponse.json(
        { error: 'GitHub API endpoint not found. Please check your token permissions.' },
        { status: 404 }
      );
    }
    
    if (error.status === 403) {
      return NextResponse.json(
        { error: 'GitHub API rate limit exceeded or insufficient permissions. Please check your token.' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to deploy to GitHub' },
      { status: 500 }
    );
  }
}