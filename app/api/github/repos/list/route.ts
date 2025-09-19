import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const githubToken = authHeader?.replace('Bearer ', '');
    
    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub token is required' },
        { status: 401 }
      );
    }

    const octokit = new Octokit({ auth: githubToken });
    
    try {
      const { data: repos } = await octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
        type: 'owner'
      });
      
      // Format repos for the dropdown
      const formattedRepos = repos.map(repo => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        private: repo.private,
        updated_at: repo.updated_at
      }));
      
      return NextResponse.json({ repos: formattedRepos });
    } catch (error: any) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Invalid GitHub token. Please check your token in Settings.' },
          { status: 401 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}