import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { code, projectName, projectId, vercelToken, action } = await req.json();
    
    if (!vercelToken) {
      return NextResponse.json(
        { error: 'Vercel token is required. Please add it in Settings.' },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required.' },
        { status: 400 }
      );
    }
    
    if (action === 'create' && !projectName) {
      return NextResponse.json(
        { error: 'Project name is required for creating new project.' },
        { status: 400 }
      );
    }

    // Prepare deployment files (needed for both create and update)
    const files = [
      {
        file: 'index.html',
        data: code,
      },
      {
        file: 'vercel.json',
        data: JSON.stringify({
          "version": 2,
          "builds": [
            {
              "src": "index.html",
              "use": "@vercel/static"
            }
          ],
          "routes": [
            {
              "src": "/(.*)",
              "dest": "/index.html"
            }
          ]
        }, null, 2),
      }
    ];

    // Handle different actions
    if (action === 'create') {
      // Sanitize project name for Vercel (lowercase, alphanumeric and hyphens only)
      const sanitizedProjectName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-');

      // Create deployment using Vercel API v13
      const deploymentResponse = await fetch('https://api.vercel.com/v13/deployments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sanitizedProjectName,
          files,
          projectSettings: {
            framework: null,
            buildCommand: '',
            outputDirectory: '',
            installCommand: '',
            devCommand: '',
          },
          target: 'production',
          public: true,
        }),
      });

    if (!deploymentResponse.ok) {
      const errorData = await deploymentResponse.json();
      console.error('Vercel deployment error:', errorData);
      
      if (deploymentResponse.status === 401) {
        return NextResponse.json(
          { error: 'Invalid Vercel token. Please check your token in Settings.' },
          { status: 401 }
        );
      }
      
      if (errorData.error?.code === 'forbidden') {
        return NextResponse.json(
          { error: 'Access forbidden. Please check your Vercel token permissions.' },
          { status: 403 }
        );
      }
      
      if (errorData.error?.code === 'bad_request') {
        return NextResponse.json(
          { error: errorData.error.message || 'Invalid request. Please check your project name.' },
          { status: 400 }
        );
      }
      
      throw new Error(errorData.error?.message || errorData.message || 'Failed to deploy to Vercel');
    }

      const deployment = await deploymentResponse.json();

      // Construct URLs
      const deploymentUrl = deployment.url ? `https://${deployment.url}` : null;
      const dashboardUrl = deployment.id ? `https://vercel.com/${deployment.ownerId || 'dashboard'}/${sanitizedProjectName}` : null;

      return NextResponse.json({
        success: true,
        deploymentUrl: deploymentUrl,
        inspectorUrl: dashboardUrl,
        message: 'New project created! Your app will be live in a few seconds.',
      });
      
    } else if (action === 'update') {
      // Update existing Vercel project
      if (!projectName && !projectId) {
        return NextResponse.json(
          { error: 'Project name is required for updating' },
          { status: 400 }
        );
      }
      
      // Use projectName (which is actually the project name from the dropdown)
      const projectToUpdate = projectName || projectId;
      
      // Deploy to existing project
      const deploymentResponse = await fetch('https://api.vercel.com/v13/deployments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectToUpdate, // Use the project name
          files,
          target: 'production',
        }),
      });
      
      if (!deploymentResponse.ok) {
        const errorData = await deploymentResponse.json();
        console.error('Vercel deployment error:', errorData);
        
        if (deploymentResponse.status === 404) {
          return NextResponse.json(
            { error: 'Project not found. It may have been deleted.' },
            { status: 404 }
          );
        }
        
        throw new Error(errorData.error?.message || 'Failed to deploy to existing project');
      }
      
      const deployment = await deploymentResponse.json();
      
      return NextResponse.json({
        success: true,
        deploymentUrl: deployment.url ? `https://${deployment.url}` : null,
        message: 'Project updated successfully! New deployment is live.',
      });
      
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "create" or "update".' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Vercel deployment error:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('token')) {
      return NextResponse.json(
        { error: 'Invalid Vercel token. Please check your token in Settings.' },
        { status: 401 }
      );
    }
    
    if (error.message?.includes('already exists') || error.message?.includes('conflict')) {
      return NextResponse.json(
        { error: 'Project name already exists. Please choose a different name.' },
        { status: 400 }
      );
    }
    
    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Vercel API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to deploy to Vercel. Please check your settings and try again.' },
      { status: 500 }
    );
  }
}