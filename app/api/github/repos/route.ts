import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

// Extract repo info from GitHub URL
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/\?]+)/,
    /^([^\/]+)\/([^\/]+)$/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
      };
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const githubToken = searchParams.get('token');
    const repoName = searchParams.get('repo');
    const repoUrl = searchParams.get('url');
    const action = searchParams.get('action'); // 'list' or 'fetch'

    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub token is required' },
        { status: 400 }
      );
    }

    const octokit = new Octokit({ auth: githubToken });

    if (action === 'list') {
      // List all repositories (not just filtered ones)
      const { data: user } = await octokit.users.getAuthenticated();
      const { data: repos } = await octokit.repos.listForAuthenticatedUser({
        per_page: 100,
        sort: 'updated',
        direction: 'desc',
      });

      // Return all repos with better metadata
      const appRepos = repos.map(repo => ({
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || 'No description',
        url: repo.html_url,
        updatedAt: repo.updated_at,
        createdAt: repo.created_at,
        hasIndex: false, // Will be checked if needed
        language: repo.language,
        private: repo.private,
      }));

      return NextResponse.json({ repos: appRepos });
      
    } else if (action === 'fetch') {
      let owner: string;
      let repo: string;
      
      // Handle GitHub URL
      if (repoUrl) {
        const parsed = parseGitHubUrl(repoUrl);
        if (!parsed) {
          return NextResponse.json(
            { error: 'Invalid GitHub URL format' },
            { status: 400 }
          );
        }
        owner = parsed.owner;
        repo = parsed.repo;
      } else if (repoName) {
        // Handle repo name (could be "owner/repo" or just "repo")
        if (repoName.includes('/')) {
          const parts = repoName.split('/');
          owner = parts[0];
          repo = parts[1];
        } else {
          // Use authenticated user as owner
          const { data: user } = await octokit.users.getAuthenticated();
          owner = user.login;
          repo = repoName;
        }
      } else {
        return NextResponse.json(
          { error: 'Repository name or URL is required' },
          { status: 400 }
        );
      }
      
      try {
        // Try to fetch index.html first
        try {
          const { data: file } = await octokit.repos.getContent({
            owner,
            repo,
            path: 'index.html',
          });

          if ('content' in file) {
            const content = Buffer.from(file.content, 'base64').toString('utf-8');
            return NextResponse.json({ 
              code: content,
              repoName: `${owner}/${repo}`,
              source: 'index.html'
            });
          }
        } catch (indexError) {
          // If index.html doesn't exist, try README.md
          try {
            const { data: readme } = await octokit.repos.getContent({
              owner,
              repo,
              path: 'README.md',
            });

            if ('content' in readme) {
              const readmeContent = Buffer.from(readme.content, 'base64').toString('utf-8');
              
              // Look for code blocks in README
              const codeBlockMatch = readmeContent.match(/```(?:html|javascript|js|css)?\n([\s\S]*?)```/);
              if (codeBlockMatch) {
                return NextResponse.json({ 
                  code: codeBlockMatch[1],
                  repoName: `${owner}/${repo}`,
                  source: 'README.md code block'
                });
              }
              
              // If no code block, return a message
              return NextResponse.json({ 
                code: `<!-- No index.html found in ${owner}/${repo} -->\n<!-- README content: -->\n<!--\n${readmeContent}\n-->`,
                repoName: `${owner}/${repo}`,
                source: 'README.md',
                isReadme: true
              });
            }
          } catch (readmeError) {
            // Try to list all HTML files in the repo
            try {
              const { data: contents } = await octokit.repos.getContent({
                owner,
                repo,
                path: '',
              });

              if (Array.isArray(contents)) {
                const htmlFiles = contents.filter(item => 
                  item.type === 'file' && item.name.endsWith('.html')
                );
                
                if (htmlFiles.length > 0) {
                  // Get the first HTML file
                  const { data: file } = await octokit.repos.getContent({
                    owner,
                    repo,
                    path: htmlFiles[0].path,
                  });

                  if ('content' in file) {
                    const content = Buffer.from(file.content, 'base64').toString('utf-8');
                    return NextResponse.json({ 
                      code: content,
                      repoName: `${owner}/${repo}`,
                      source: htmlFiles[0].name
                    });
                  }
                }
              }
            } catch (listError) {
              // Continue to error response
            }
          }
        }
        
        return NextResponse.json(
          { error: `No HTML files found in repository ${owner}/${repo}` },
          { status: 404 }
        );
      } catch (error: any) {
        console.error('GitHub fetch error:', error);
        return NextResponse.json(
          { error: `Repository ${owner}/${repo} not found or not accessible` },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "list" or "fetch"' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('GitHub repos error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to access GitHub' },
      { status: 500 }
    );
  }
}