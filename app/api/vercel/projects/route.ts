import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const vercelToken = authHeader?.replace('Bearer ', '');
    
    if (!vercelToken) {
      return NextResponse.json(
        { error: 'Vercel token is required' },
        { status: 401 }
      );
    }

    // Fetch projects from Vercel API
    const response = await fetch('https://api.vercel.com/v9/projects', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${vercelToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid Vercel token' },
          { status: 401 }
        );
      }
      throw new Error('Failed to fetch projects');
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      projects: data.projects || [] 
    });
  } catch (error: any) {
    console.error('Vercel API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Vercel projects' },
      { status: 500 }
    );
  }
}