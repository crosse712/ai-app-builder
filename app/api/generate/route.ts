import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Clean and extract only valid HTML from AI response
function cleanGeneratedCode(text: string): string {
  let cleanedCode = text;
  
  // Remove markdown code blocks (all variations)
  cleanedCode = cleanedCode.replace(/```[\w]*\n?/gi, '');
  cleanedCode = cleanedCode.replace(/\n?```/gi, '');
  
  // Remove common AI explanations patterns
  cleanedCode = cleanedCode.replace(/^Here's[\s\S]*?:\n*/i, '');
  cleanedCode = cleanedCode.replace(/^I've[\s\S]*?:\n*/i, '');
  cleanedCode = cleanedCode.replace(/^This[\s\S]*?:\n*/i, '');
  cleanedCode = cleanedCode.replace(/^The following[\s\S]*?:\n*/i, '');
  
  // Try to extract HTML document
  const htmlMatch = cleanedCode.match(/<!DOCTYPE\s+html[\s\S]*?<\/html>/i);
  if (htmlMatch) {
    cleanedCode = htmlMatch[0];
  } else {
    // If no DOCTYPE, try to find <html> tags
    const htmlTagMatch = cleanedCode.match(/<html[\s\S]*?<\/html>/i);
    if (htmlTagMatch) {
      cleanedCode = '<!DOCTYPE html>\n' + htmlTagMatch[0];
    }
  }
  
  // Remove any text before <!DOCTYPE
  const doctypeIndex = cleanedCode.indexOf('<!DOCTYPE');
  if (doctypeIndex > 0) {
    cleanedCode = cleanedCode.substring(doctypeIndex);
  }
  
  // Remove any text after </html>
  const htmlEndIndex = cleanedCode.lastIndexOf('</html>');
  if (htmlEndIndex > 0 && htmlEndIndex < cleanedCode.length - 7) {
    cleanedCode = cleanedCode.substring(0, htmlEndIndex + 7);
  }
  
  // Remove any trailing explanations
  cleanedCode = cleanedCode.replace(/\n\n[\s\S]*?Note:[\s\S]*$/i, '');
  cleanedCode = cleanedCode.replace(/\n\n[\s\S]*?This code[\s\S]*$/i, '');
  cleanedCode = cleanedCode.replace(/\n\n[\s\S]*?The above[\s\S]*$/i, '');
  
  // Final cleanup
  cleanedCode = cleanedCode.trim();
  
  // Validate HTML structure
  if (!cleanedCode.startsWith('<!DOCTYPE')) {
    cleanedCode = '<!DOCTYPE html>\n' + cleanedCode;
  }
  
  if (!cleanedCode.includes('<html')) {
    console.warn('Warning: Generated code may be missing HTML tags');
  }
  
  return cleanedCode;
}

// Check if prompt contains a URL to replicate
function extractWebsiteUrl(prompt: string): string | null {
  // Match common URL patterns
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[^\s]*)?)/gi;
  const matches = prompt.match(urlRegex);
  
  if (matches && matches.length > 0) {
    let url = matches[0];
    // Add https:// if not present
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url;
  }
  
  return null;
}

// Check if prompt is asking to replicate/clone/copy a website
function isWebsiteReplicationCommand(prompt: string): boolean {
  const promptLower = prompt.toLowerCase();
  
  // Check for replication keywords
  const replicationKeywords = [
    'replicate', 'clone', 'copy', 'recreate', 'rebuild',
    'make like', 'build like', 'create like', 'similar to',
    'duplicate', 'mirror', 'imitate', 'reproduce'
  ];
  
  // Check if contains URL
  const hasUrl = extractWebsiteUrl(prompt) !== null;
  
  // Check if has replication keyword
  const hasReplicationKeyword = replicationKeywords.some(keyword => promptLower.includes(keyword));
  
  // If URL is present and either has replication keyword or just the URL alone
  return hasUrl && (hasReplicationKeyword || !!prompt.trim().match(/^(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[^\s]*)?$/));
}

// Check if prompt is asking to load a previous project or contains GitHub URL
function isLoadProjectCommand(prompt: string): boolean {
  // Check for GitHub URL
  if (prompt.includes('github.com/')) {
    return true;
  }
  
  const promptLower = prompt.toLowerCase();
  
  // Exclude build/create commands - these should NOT trigger project loading
  const buildKeywords = ['create', 'build', 'make', 'generate', 'develop', 'design', 'construct', 'code me'];
  const hasBuildKeyword = buildKeywords.some(keyword => promptLower.includes(keyword));
  if (hasBuildKeyword) {
    return false; // If user is asking to CREATE/BUILD, it's not a load command
  }
  
  // More specific load patterns
  const loadPhrases = [
    'load my', 'load the', 'open my', 'open the', 
    'show my', 'show me my', 'get my', 'fetch my',
    'continue with', 'continue my', 'resume my',
    'list my projects', 'show all projects', 'my previous',
    'load project', 'open project', 'load repo', 'open repo'
  ];
  
  // Check for explicit load phrases
  const hasLoadPhrase = loadPhrases.some(phrase => promptLower.includes(phrase));
  
  // Only return true if we have a clear load intent
  return hasLoadPhrase;
}

// Analyze prompt to determine relevant image keywords
function analyzePromptForImages(prompt: string): string[] {
  const promptLower = prompt.toLowerCase();
  const keywords: string[] = [];
  
  // App-specific keywords
  if (promptLower.includes('portfolio')) {
    keywords.push('professional', 'workspace', 'laptop', 'design', 'creative');
  } else if (promptLower.includes('restaurant') || promptLower.includes('food')) {
    keywords.push('food', 'restaurant', 'dining', 'cuisine', 'chef');
  } else if (promptLower.includes('travel') || promptLower.includes('booking')) {
    keywords.push('travel', 'destination', 'vacation', 'adventure', 'explore');
  } else if (promptLower.includes('fitness') || promptLower.includes('gym')) {
    keywords.push('fitness', 'workout', 'gym', 'health', 'exercise');
  } else if (promptLower.includes('education') || promptLower.includes('learning')) {
    keywords.push('education', 'study', 'books', 'classroom', 'learning');
  } else if (promptLower.includes('shopping') || promptLower.includes('ecommerce')) {
    keywords.push('shopping', 'products', 'retail', 'fashion', 'store');
  } else if (promptLower.includes('blog') || promptLower.includes('news')) {
    keywords.push('writing', 'blog', 'article', 'journalism', 'news');
  } else if (promptLower.includes('music')) {
    keywords.push('music', 'concert', 'instruments', 'audio', 'performance');
  } else if (promptLower.includes('real estate') || promptLower.includes('property')) {
    keywords.push('realestate', 'house', 'architecture', 'interior', 'home');
  } else if (promptLower.includes('medical') || promptLower.includes('health')) {
    keywords.push('medical', 'healthcare', 'doctor', 'hospital', 'wellness');
  } else if (promptLower.includes('tech') || promptLower.includes('startup')) {
    keywords.push('technology', 'startup', 'innovation', 'coding', 'computer');
  } else if (promptLower.includes('nature') || promptLower.includes('environment')) {
    keywords.push('nature', 'landscape', 'environment', 'forest', 'mountains');
  } else if (promptLower.includes('game') || promptLower.includes('gaming')) {
    keywords.push('gaming', 'videogames', 'esports', 'controller', 'arcade');
  } else if (promptLower.includes('social')) {
    keywords.push('social', 'community', 'people', 'network', 'friends');
  } else if (promptLower.includes('dashboard') || promptLower.includes('analytics')) {
    keywords.push('data', 'analytics', 'charts', 'business', 'dashboard');
  } else {
    // Default keywords for generic apps
    keywords.push('modern', 'technology', 'business', 'professional', 'design');
  }
  
  return keywords;
}

// Extract tech stack from prompt
function extractTechStack(prompt: string): string {
  const promptLower = prompt.toLowerCase();

  // Check for UI frameworks first (more specific)
  // shadcn/ui - React + Tailwind + Radix
  if (promptLower.includes('shadcn') || promptLower.includes('shadcn/ui') || promptLower.includes('shadcn ui')) {
    return 'shadcn';
  }

  // DaisyUI - Tailwind component library
  if (promptLower.includes('daisy') || promptLower.includes('daisyui')) {
    return 'daisyui';
  }

  // Flowbite - Modern Tailwind components
  if (promptLower.includes('flowbite')) {
    return 'flowbite';
  }

  // NextUI - Beautiful React + Tailwind
  if (promptLower.includes('nextui') || promptLower.includes('next ui')) {
    return 'nextui';
  }

  // Mantine - Full-featured React
  if (promptLower.includes('mantine')) {
    return 'mantine';
  }

  // Ant Design
  if (promptLower.includes('ant design') || promptLower.includes('antd')) {
    return 'antd';
  }

  // Material UI / MUI
  if (promptLower.includes('material ui') || promptLower.includes('mui') ||
      (promptLower.includes('material') && promptLower.includes('design'))) {
    return 'mui';
  }

  // Chakra UI
  if (promptLower.includes('chakra')) {
    return 'chakra';
  }

  // Bootstrap
  if (promptLower.includes('bootstrap')) {
    return 'bootstrap';
  }

  // Bulma
  if (promptLower.includes('bulma')) {
    return 'bulma';
  }

  // Alpine.js - Minimal reactive framework
  if (promptLower.includes('alpine')) {
    return 'alpine';
  }

  // HTMX - Modern web without much JS
  if (promptLower.includes('htmx')) {
    return 'htmx';
  }

  // Aceternity UI - Beautiful animations
  if (promptLower.includes('aceternity')) {
    return 'aceternity';
  }

  // Magic UI
  if (promptLower.includes('magic ui') || promptLower.includes('magicui')) {
    return 'magicui';
  }

  // Check for base framework mentions
  if (promptLower.includes('next.js') || promptLower.includes('nextjs') || promptLower.includes('next')) {
    return 'nextjs';
  }
  if (promptLower.includes('nuxt.js') || promptLower.includes('nuxtjs') || promptLower.includes('nuxt')) {
    return 'nuxtjs';
  }
  if (promptLower.includes('tailwind only') || promptLower.includes('pure tailwind') || promptLower.includes('just tailwind')) {
    return 'tailwind';
  }
  if (promptLower.includes('tailwind ui') || promptLower.includes('tailwindui')) {
    return 'tailwind-ui';
  }
  if (promptLower.includes('tailwind') && promptLower.includes('components')) {
    return 'tailwind-ui';
  }
  // Check if Tailwind is mentioned prominently without other frameworks
  if (promptLower.includes('tailwind') &&
      !promptLower.includes('react') &&
      !promptLower.includes('vue') &&
      !promptLower.includes('next') &&
      !promptLower.includes('svelte') &&
      !promptLower.includes('angular')) {
    return 'tailwind';
  }
  if (promptLower.includes('vite') || promptLower.includes('react vite')) {
    return 'vite-react';
  }
  if (promptLower.includes('vue') && promptLower.includes('vite')) {
    return 'vite-vue';
  }
  if (promptLower.includes('vue')) {
    return 'vue';
  }
  if (promptLower.includes('angular')) {
    return 'angular';
  }
  if (promptLower.includes('svelte')) {
    return 'svelte';
  }
  if (promptLower.includes('react')) {
    return 'vite-react'; // Default React to Vite setup
  }
  if (promptLower.includes('vanilla') || promptLower.includes('plain') || promptLower.includes('html')) {
    return 'vanilla';
  }

  // Default to React with Vite for modern development
  return 'vite-react';
}

// Extract project name from natural language
async function extractProjectInfo(prompt: string, apiKey: string): Promise<{ projectName?: string, listProjects?: boolean, githubUrl?: string }> {
  // First check if it's a GitHub URL
  const githubUrlMatch = prompt.match(/github\.com\/([^\/\s]+\/[^\/\s]+)/);
  if (githubUrlMatch) {
    return { githubUrl: githubUrlMatch[0] };
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const extractPrompt = `Given this user request about loading a project: "${prompt}"
  
  Determine if the user wants to:
  1. List all their projects (return: {"listProjects": true})
  2. Load a specific project (return: {"projectName": "extracted-name"})
  3. Load a GitHub URL (return: {"githubUrl": "url"})
  
  Extract the project name if mentioned. Common patterns:
  - "load my calculator app" -> calculator
  - "open the todo list project" -> todo-list
  - "continue with yesterday's timer" -> timer
  - "show me all my projects" -> listProjects: true
  - "list my projects" -> listProjects: true
  - "github.com/user/repo" -> githubUrl: "github.com/user/repo"
  
  IMPORTANT: This should ONLY extract project loading intents, NOT creation intents.
  If the user says "create", "build", or "make", they are NOT trying to load a project.
  
  Return ONLY a JSON object, no other text.`;

  try {
    const result = await model.generateContent(extractPrompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Clean and parse JSON
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to extract project info:', error);
    return { listProjects: true }; // Default to listing projects
  }
}

// Analyze if the prompt is asking for code generation or just conversation
async function analyzeRequestIntent(prompt: string, apiKey: string, projectContext?: string): Promise<{
  intent: 'code_generation' | 'code_modification' | 'conversation' | 'explanation';
  details?: string;
}> {
  const promptLower = prompt.toLowerCase();
  
  // Quick checks for obvious patterns to avoid API call
  const codeGenerationKeywords = ['create', 'build', 'make', 'generate', 'develop', 'design', 'construct', 'implement', 'write', 'start'];
  const codeModificationKeywords = ['change', 'update', 'modify', 'add', 'remove', 'delete', 'fix', 'improve', 'enhance', 'refactor', 'expand', 'extend', 'include', 'insert', 'append'];
  const conversationKeywords = ['thanks', 'thank you', 'hello', 'hi', 'hey', 'good', 'great', 'awesome', 'nice', 'ok', 'okay', 'yes', 'no'];
  const explanationKeywords = ['how does', 'what is', 'why', 'explain', 'tell me about', 'understand', 'clarify', 'what does'];
  
  // Check for code generation
  if (codeGenerationKeywords.some(keyword => promptLower.includes(keyword)) && 
      (promptLower.includes('app') || promptLower.includes('website') || promptLower.includes('page') || 
       promptLower.includes('component') || promptLower.includes('interface') || promptLower.includes('form'))) {
    return { intent: 'code_generation', details: 'User wants to create new code' };
  }
  
  // Check for code modification
  if (codeModificationKeywords.some(keyword => promptLower.includes(keyword))) {
    return { intent: 'code_modification', details: 'User wants to modify existing code' };
  }
  
  // Check for conversation
  if (conversationKeywords.some(keyword => promptLower.startsWith(keyword)) || promptLower.length < 20) {
    return { intent: 'conversation', details: 'General conversation' };
  }
  
  // Check for explanation
  if (explanationKeywords.some(keyword => promptLower.includes(keyword))) {
    return { intent: 'explanation', details: 'User wants an explanation' };
  }
  
  // For ambiguous cases, use AI
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const analysisPrompt = `Analyze this user request and determine the intent.
  
  User request: "${prompt}"
  ${projectContext ? `Current project context: ${projectContext}` : ''}
  
  Determine if the user is:
  1. Asking to generate NEW code from scratch (intent: "code_generation")
  2. Asking to MODIFY or UPDATE existing code (intent: "code_modification")
  3. Having a general conversation or asking questions (intent: "conversation")
  4. Asking for an explanation of code or concepts (intent: "explanation")
  
  Common patterns:
  - "Create/Build/Make a..." -> code_generation
  - "Change/Update/Modify/Add feature to..." -> code_modification
  - "How does.../What is.../Can you explain..." -> explanation
  - "Thanks/Hello/What do you think..." -> conversation
  - "Fix the bug/Add a button/Change the color" -> code_modification
  
  IMPORTANT: If the user mentions creating, building, or making something new (like a website, app, etc.), it's ALWAYS code_generation, NOT a load project command.
  
  Return ONLY a JSON object like: {"intent": "code_generation", "details": "user wants a todo app"}
  No other text, just the JSON.`;

  try {
    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Clean and parse JSON
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to analyze intent:', error);
    // Default to code generation if uncertain
    return { intent: 'code_generation' };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, apiKey, githubToken, commentLevel, projectContext, conversationHistory, currentCode } = body;

    if (!apiKey || apiKey === 'test-key') {
      return NextResponse.json(
        { error: 'Google AI API key is required. Please add it in Settings.' },
        { status: 400 }
      );
    }

    // Check if this is a website replication command
    if (isWebsiteReplicationCommand(prompt)) {
      const targetUrl = extractWebsiteUrl(prompt);
      if (!targetUrl) {
        return NextResponse.json(
          { error: 'Could not extract a valid URL from your request.' },
          { status: 400 }
        );
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      // Extract the preferred tech stack from prompt
      const techStack = extractTechStack(prompt);
      
      // Get framework-specific instructions for replication
      let frameworkSetup = '';
      if (techStack === 'vite-react') {
        frameworkSetup = `Use React with hooks, include React/ReactDOM/Babel via CDN, use <script type="text/babel">`;
      } else if (techStack === 'vue') {
        frameworkSetup = `Use Vue 3 Composition API via CDN, create reactive components with ref() and reactive()`;
      } else if (techStack === 'tailwind' || techStack === 'tailwind-ui') {
        frameworkSetup = `Use pure Tailwind CSS with CDN, utilize all Tailwind utilities for exact styling replication`;
      } else if (techStack === 'nextjs') {
        frameworkSetup = `Simulate Next.js patterns in single HTML, use React with Next.js-like component structure`;
      } else if (techStack === 'svelte') {
        frameworkSetup = `Simulate Svelte reactivity patterns using vanilla JS in a Svelte-like structure`;
      } else {
        frameworkSetup = `Use modern HTML5/CSS3/JavaScript ES6+ with best practices`;
      }
      
      // Create a comprehensive prompt for website replication
      const replicationPrompt = `You are an EXPERT web developer with a PHOTOGRAPHIC MEMORY for design details.

      CRITICAL MISSION: EXACTLY REPLICATE the website at ${targetUrl}
      FRAMEWORK TO USE: ${techStack}
      SETUP: ${frameworkSetup}
      
      REPLICATION PROTOCOL:
      =====================================
      
      1. VISUAL ANALYSIS - Capture EVERY detail:
         ✓ Exact colors (use same hex/rgb values if visible)
         ✓ Exact spacing (padding, margins, gaps)
         ✓ Exact typography (font families, sizes, weights)
         ✓ Exact layout structure (grid, flexbox patterns)
         ✓ Exact animations and transitions
         ✓ Exact responsive breakpoints
         ✓ Exact shadow and border styles
      
      2. STRUCTURAL REPLICATION:
         ✓ Navigation bar - exact same style, position, behavior
         ✓ Hero section - exact same layout, height, background
         ✓ Content sections - preserve all sections in order
         ✓ Cards/Features - exact same grid, spacing, hover effects
         ✓ Footer - exact same layout and link structure
         ✓ Modals/Dropdowns - if visible, replicate exactly
      
      3. CONTENT REPLACEMENT RULES:
         ✓ Company name → "TechCorp" or similar generic
         ✓ Real text → Professional Lorem Ipsum variations
         ✓ Real images → High-quality Unsplash images:
           - Hero: https://source.unsplash.com/1920x1080/?modern,technology
           - Features: https://source.unsplash.com/800x600/?abstract,business
           - Team: https://i.pravatar.cc/300?img={1-70}
         ✓ Icons → Keep same style (use FontAwesome or similar)
         ✓ Logos → Generic placeholder logos
      
      4. TECHNICAL REQUIREMENTS:
         ✓ Single HTML file with ALL code embedded
         ✓ Include all necessary CDN links in <head>
         ✓ Inline all CSS in <style> tags
         ✓ Embed all JavaScript in <script> tags
         ✓ Mobile-responsive exactly like original
         ✓ Cross-browser compatible
         ✓ Smooth animations and transitions
      
      5. ${techStack.toUpperCase()} SPECIFIC REQUIREMENTS:
      ${techStack === 'vite-react' ? `
         - Create React components for each section
         - Use useState for interactive elements
         - Use useEffect for animations
         - Proper component composition` : ''}
      ${techStack === 'vue' ? `
         - Create Vue components with Composition API
         - Use ref() for reactive state
         - Implement v-if, v-for directives
         - Proper component reactivity` : ''}
      ${techStack === 'tailwind' ? `
         - Use Tailwind utilities for EVERYTHING
         - Custom CSS only if absolutely needed
         - Use Tailwind's animation classes
         - Implement dark mode if original has it` : ''}
      
      QUALITY STANDARDS:
      ✓ Pixel-perfect layout matching
      ✓ Exact color scheme replication
      ✓ Smooth, professional animations
      ✓ Clean, maintainable code
      ✓ Fully functional interactions
      
      FINAL CHECK:
      The output should look IDENTICAL to ${targetUrl} but with generic content.
      Someone viewing both should say "These are the same design!"
      
      Generate the COMPLETE HTML code that EXACTLY replicates the website.`;
      
      const result = await model.generateContent(replicationPrompt);
      const response = await result.response;
      const rawCode = response.text();
      
      // Use the cleaning function to extract only HTML
      const generatedCode = cleanGeneratedCode(rawCode);
      
      return NextResponse.json({ 
        code: generatedCode,
        intent: 'website_replication',
        sourceUrl: targetUrl,
        message: `Successfully replicated design from ${targetUrl} using ${techStack}`
      });
    }

    // Check if this is a load project command
    if (isLoadProjectCommand(prompt)) {
      if (!githubToken) {
        return NextResponse.json(
          { 
            error: 'GitHub token required to load projects. Please add it in Settings.',
            isProjectCommand: true,
            requiresGitHub: true
          },
          { status: 400 }
        );
      }

      // Extract project information using AI
      const projectInfo = await extractProjectInfo(prompt, apiKey);
      
      if (projectInfo.listProjects) {
        // Return a special response to trigger project listing in the UI
        return NextResponse.json({
          action: 'list_projects',
          message: 'Fetching your GitHub projects...',
        });
      } else if (projectInfo.githubUrl) {
        // Return a special response to trigger URL loading
        return NextResponse.json({
          action: 'load_url',
          githubUrl: projectInfo.githubUrl,
          message: `Loading from GitHub: ${projectInfo.githubUrl}...`,
        });
      } else if (projectInfo.projectName) {
        // Return a special response to trigger project loading
        return NextResponse.json({
          action: 'load_project',
          projectName: projectInfo.projectName,
          message: `Looking for project: ${projectInfo.projectName}...`,
        });
      }
    }

    // Analyze the intent of the request
    const intentAnalysis = await analyzeRequestIntent(prompt, apiKey, projectContext);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    // For code modifications, ensure we have the current code context
    if (intentAnalysis.intent === 'code_modification' && !currentCode) {
      // Request current code from frontend if not provided
      return NextResponse.json({ 
        requiresCurrentCode: true,
        intent: intentAnalysis.intent,
        message: 'Please provide the current code to modify'
      });
    }
    
    // If it's just conversation or explanation, provide a helpful response without code
    if (intentAnalysis.intent === 'conversation' || intentAnalysis.intent === 'explanation') {
      const conversationPrompt = `You are an AI assistant helping with web development.
      ${projectContext ? `Current project: ${projectContext}` : ''}
      
      User message: ${prompt}
      
      Provide a helpful, friendly response. If they're asking for an explanation, be clear and educational.
      Keep your response concise but informative. Do NOT generate code unless specifically asked.
      
      If they're asking about the current project, reference it by name and acknowledge what you're building together.`;
      
      const result = await model.generateContent(conversationPrompt);
      const response = await result.response;
      const text = response.text();
      
      return NextResponse.json({ 
        response: text,
        intent: intentAnalysis.intent,
        isConversation: true 
      });
    }
    
    // If it's code modification, we need to consider the existing code context
    if (intentAnalysis.intent === 'code_modification') {
      // This will be handled by the frontend to pass the current code
      // For now, we'll treat it as a code generation with context
    }
    
    // Regular code generation flow

    const commentInstructions = commentLevel === 'simple' 
      ? `CRITICAL REQUIREMENT - EDUCATIONAL COMMENTS (Simple Mode):
    - Add brief, clear comments to explain major sections
    - Focus on WHAT each section does
    - Keep comments short and to the point
    - Comment style examples:
      * HTML: <!-- Header section -->
      * CSS: /* Button styles */
      * JS: // Handle form submission`
      : `CRITICAL REQUIREMENT - EDUCATIONAL COMMENTS (Detailed Mode):
    - Add helpful comments throughout the code to teach beginners
    - Every section should have a comment explaining what it does
    - Use simple, beginner-friendly language in comments
    - Explain WHY not just WHAT (e.g., "// We use flexbox here to center items both horizontally and vertically")
    - Add comments for:
      * Each HTML section explaining its purpose
      * CSS properties explaining what they do
      * JavaScript functions explaining their logic
      * Any complex or interesting techniques
    
    Comment style examples:
    - HTML: <!-- Navigation bar - contains links to different sections -->
    - CSS: /* Flexbox centers the content and makes it responsive */
    - JS: // This function handles button clicks and updates the display`;

    // Extract tech stack from prompt or use default modern stack
    const techStack = extractTechStack(prompt);
    
    let frameworkInstructions = '';
    if (techStack === 'vite-react') {
      frameworkInstructions = `CRITICAL: Generate a PRODUCTION-READY React application with Vite setup.
    
    FRAMEWORK REQUIREMENTS:
    - Use React 18+ with functional components and hooks (useState, useEffect, etc.)
    - Create a SINGLE HTML file that works immediately when opened
    - Include React, ReactDOM via CDN (unpkg or jsdelivr)
    - Use inline <script type="text/babel"> for JSX transformation
    - Include Babel standalone for JSX transpilation
    - Use modern ES6+ JavaScript features
    - Implement Tailwind CSS via CDN for styling
    - Structure: Single HTML with embedded CSS and JavaScript
    
    CODE STRUCTURE:
    <!DOCTYPE html>
    <html>
    <head>
      <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
      <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
      <div id="root"></div>
      <script type="text/babel">
        // React components and logic here
        const App = () => { ... };
        ReactDOM.createRoot(document.getElementById('root')).render(<App />);
      </script>
    </body>
    </html>
    
    - Make it fully functional and ready to run
    - Include proper state management
    - Add event handlers and interactivity`;
    } else if (techStack === 'nextjs') {
      frameworkInstructions = `Generate a Next.js 14 application:
    
    FRAMEWORK REQUIREMENTS:
    - Use App Router (not Pages Router)
    - React Server Components by default
    - 'use client' directive for interactive components
    - Tailwind CSS for styling
    - TypeScript preferred
    - Create a SINGLE HTML preview file that simulates Next.js features
    
    For single-file preview:
    - Include React via CDN
    - Simulate routing with React state
    - Use Tailwind CDN
    - Show typical Next.js patterns (layouts, loading states, etc.)`;
    } else if (techStack === 'nuxtjs') {
      frameworkInstructions = `Generate a Nuxt.js 3 application:
    
    FRAMEWORK REQUIREMENTS:
    - Vue 3 Composition API
    - Single File Components structure
    - Tailwind CSS for styling
    - Auto-imports for components and composables
    - Create a SINGLE HTML file with Vue 3 via CDN
    
    For single-file preview:
    - Include Vue 3 via CDN
    - Use inline template syntax
    - Include Tailwind CDN
    - Show Vue reactivity and components`;
    } else if (techStack === 'vue') {
      frameworkInstructions = `Generate a Vue 3 application:
    
    FRAMEWORK REQUIREMENTS:
    - Use Vue 3 Composition API with <script setup>
    - Single File Component structure (but in HTML)
    - Reactive data with ref() and reactive()
    - Include Vue 3 via CDN
    - Tailwind CSS for styling
    
    CODE STRUCTURE:
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
      <div id="app">{{ message }}</div>
      <script>
        const { createApp, ref, reactive, computed, onMounted } = Vue;
        createApp({
          setup() {
            // Vue 3 Composition API logic here
            return { ... };
          }
        }).mount('#app');
      </script>
    </body>
    </html>`;
    } else if (techStack === 'vite-vue') {
      frameworkInstructions = `Generate a Vue 3 + Vite application:
    
    FRAMEWORK REQUIREMENTS:
    - Vue 3 with Composition API
    - Vite build tool optimizations
    - <script setup> syntax
    - TypeScript support
    - Tailwind CSS
    - Create single HTML with Vue 3 via CDN
    - Show Vite + Vue best practices`;
    } else if (techStack === 'angular') {
      frameworkInstructions = `Generate an Angular application:
    
    FRAMEWORK REQUIREMENTS:
    - Angular 17+ with standalone components
    - TypeScript strictly typed
    - RxJS for reactive programming
    - Angular Material or Tailwind CSS
    - Dependency injection
    
    For single-file preview (simplified):
    - Create HTML with Angular-like syntax
    - Include basic TypeScript patterns
    - Show component structure
    - Use modern JavaScript to simulate Angular features`;
    } else if (techStack === 'svelte') {
      frameworkInstructions = `Generate a Svelte application:
    
    FRAMEWORK REQUIREMENTS:
    - Svelte 4+ syntax
    - Reactive declarations with $:
    - Component props and events
    - Stores for state management
    - Tailwind CSS for styling
    
    For single-file preview:
    - Create HTML that demonstrates Svelte patterns
    - Include reactive JavaScript
    - Show Svelte-like syntax in comments
    - Use vanilla JS to simulate Svelte reactivity`;
    } else if (techStack === 'tailwind') {
      frameworkInstructions = `Generate a PURE Tailwind CSS application:
    
    FRAMEWORK REQUIREMENTS:
    - HTML5 with Tailwind CSS ONLY (no React, Vue, etc.)
    - Use Tailwind CDN with all features enabled
    - Advanced Tailwind techniques:
      * Custom animations with animate-*
      * Gradients and backdrop filters
      * Grid and Flexbox layouts
      * Responsive design with sm:, md:, lg:, xl:
      * Dark mode support with dark:
      * Hover, focus, and active states
    - Minimal vanilla JavaScript for interactivity
    - Alpine.js via CDN for declarative behavior (optional)
    
    CODE STRUCTURE:
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          theme: {
            extend: {
              animation: { ... },
              colors: { ... }
            }
          }
        }
      </script>
      <!-- Optional: Alpine.js for interactivity -->
      <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"></script>
    </head>
    <body>
      <!-- Pure Tailwind components -->
    </body>
    </html>
    
    COMPONENT PATTERNS:
    - Cards with shadows and hover effects
    - Responsive navigation with mobile menu
    - Hero sections with gradients
    - Forms with validation states
    - Modals and dropdowns
    - Animated transitions`;
    } else if (techStack === 'tailwind-ui') {
      frameworkInstructions = `Generate Tailwind UI-style components:
    
    REQUIREMENTS:
    - Professional Tailwind CSS components
    - Complex, production-ready UI patterns
    - Advanced Tailwind utilities
    - Headless UI patterns (simulated)
    - Beautiful animations and transitions
    - Accessibility best practices
    - Professional color schemes
    - Component variants (primary, secondary, etc.)
    
    COMPONENTS TO INCLUDE:
    - Navigation with dropdowns
    - Feature sections
    - Pricing tables
    - Testimonials
    - CTAs with gradients
    - Form layouts
    - Stats sections
    - Footer with links`;
    } else if (techStack === 'shadcn') {
      frameworkInstructions = `Generate a shadcn/ui application (React + Tailwind + Radix):

    FRAMEWORK REQUIREMENTS:
    - React 18+ with functional components and hooks
    - Tailwind CSS for styling
    - Radix UI primitives for accessible components
    - Beautiful, modern, accessible components
    - Dark mode support
    - Include React, ReactDOM, Babel via CDN
    - Include Tailwind CSS via CDN

    SHADCN/UI STYLE GUIDELINES:
    - Use subtle borders and shadows (border-neutral-200, shadow-sm)
    - Rounded corners (rounded-lg, rounded-md)
    - Professional color scheme (neutral, slate, zinc)
    - Smooth transitions and hover states
    - Accessible components with proper ARIA labels
    - Button variants: default, destructive, outline, ghost
    - Card components with proper spacing
    - Form elements with labels and validation states

    COMPONENTS TO EMULATE:
    - Buttons with variants (primary, secondary, outline, ghost)
    - Cards with headers and footers
    - Input fields with labels and error states
    - Dropdowns and select menus
    - Modals/Dialogs with overlay
    - Tabs and navigation
    - Badges and tags
    - Alert components

    CODE STRUCTURE:
    <!DOCTYPE html>
    <html>
    <head>
      <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
      <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                border: "hsl(214.3 31.8% 91.4%)",
                input: "hsl(214.3 31.8% 91.4%)",
                ring: "hsl(222.2 84% 4.9%)",
                background: "hsl(0 0% 100%)",
                foreground: "hsl(222.2 84% 4.9%)",
                primary: { DEFAULT: "hsl(222.2 47.4% 11.2%)", foreground: "hsl(210 40% 98%)" },
                secondary: { DEFAULT: "hsl(210 40% 96.1%)", foreground: "hsl(222.2 47.4% 11.2%)" },
                muted: { DEFAULT: "hsl(210 40% 96.1%)", foreground: "hsl(215.4 16.3% 46.9%)" },
                accent: { DEFAULT: "hsl(210 40% 96.1%)", foreground: "hsl(222.2 47.4% 11.2%)" }
              },
              borderRadius: { lg: "0.5rem", md: "calc(0.5rem - 2px)", sm: "calc(0.5rem - 4px)" }
            }
          }
        }
      </script>
    </head>
    <body>
      <div id="root"></div>
      <script type="text/babel">
        // shadcn/ui-style React components here
      </script>
    </body>
    </html>`;
    } else if (techStack === 'daisyui') {
      frameworkInstructions = `Generate a DaisyUI application (Tailwind component library):

    FRAMEWORK REQUIREMENTS:
    - HTML5 with DaisyUI + Tailwind CSS
    - Use DaisyUI component classes
    - Beautiful, pre-styled components
    - Theme support built-in
    - Include Tailwind CSS CDN
    - Include DaisyUI via CDN

    DAISYUI COMPONENTS TO USE:
    - Buttons: btn, btn-primary, btn-secondary, btn-accent, btn-ghost
    - Cards: card, card-body, card-title, card-actions
    - Navbar: navbar, navbar-start, navbar-center, navbar-end
    - Forms: input, select, textarea, checkbox, radio, toggle
    - Alerts: alert, alert-info, alert-success, alert-warning, alert-error
    - Badges: badge, badge-primary, badge-secondary
    - Modals: modal, modal-box, modal-action
    - Tabs: tabs, tab, tab-active
    - Hero: hero, hero-content
    - Stats: stats, stat, stat-title, stat-value

    CODE STRUCTURE:
    <!DOCTYPE html>
    <html data-theme="light">
    <head>
      <link href="https://cdn.jsdelivr.net/npm/daisyui@4.4.19/dist/full.min.css" rel="stylesheet">
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
      <!-- Use DaisyUI component classes -->
      <button class="btn btn-primary">Click me</button>
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Card title</h2>
          <p>Card content</p>
        </div>
      </div>
    </body>
    </html>

    THEMES: Use data-theme attribute (light, dark, cupcake, bumblebee, emerald, corporate, etc.)`;
    } else if (techStack === 'flowbite') {
      frameworkInstructions = `Generate a Flowbite application (Modern Tailwind components):

    FRAMEWORK REQUIREMENTS:
    - HTML5 with Flowbite + Tailwind CSS
    - Modern, production-ready components
    - Include Tailwind CSS CDN
    - Include Flowbite JavaScript for interactivity

    FLOWBITE COMPONENTS:
    - Buttons with icons and loading states
    - Cards with images and CTAs
    - Navbar with dropdowns
    - Modals and drawers
    - Forms with validation
    - Dropdowns and tooltips
    - Alerts and toasts
    - Breadcrumbs and pagination
    - Timelines and progress bars

    CODE STRUCTURE:
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.0/flowbite.min.css" rel="stylesheet">
    </head>
    <body>
      <!-- Flowbite components -->
      <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.0/flowbite.min.js"></script>
    </body>
    </html>

    DESIGN PRINCIPLES:
    - Clean, modern aesthetics
    - Blue as primary color (#3F83F8)
    - Subtle shadows and borders
    - Smooth transitions
    - Responsive design`;
    } else if (techStack === 'nextui') {
      frameworkInstructions = `Generate a NextUI application (Beautiful React + Tailwind):

    FRAMEWORK REQUIREMENTS:
    - React 18+ with hooks
    - NextUI component library style
    - Beautiful, modern design with Framer Motion animations
    - Dark mode support
    - Tailwind CSS for styling
    - Include React, ReactDOM, Babel via CDN

    NEXTUI DESIGN STYLE:
    - Smooth animations and transitions
    - Glassmorphism effects
    - Gradient accents
    - Rounded corners (rounded-xl, rounded-2xl)
    - Shadow layering for depth
    - Color scheme: Purple/Blue gradients for accents
    - Modern, clean spacing

    COMPONENTS TO EMULATE:
    - Buttons with loading states and icons
    - Cards with blur backgrounds
    - Input fields with animated labels
    - Modals with backdrop blur
    - Navigation with active states
    - Avatars and avatar groups
    - Badges with dot indicators
    - Progress bars with gradients

    CODE STRUCTURE:
    <!DOCTYPE html>
    <html>
    <head>
      <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
      <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
      </style>
    </head>
    <body class="bg-gradient-to-br from-gray-50 to-gray-100">
      <div id="root"></div>
      <script type="text/babel">
        // NextUI-style React components with beautiful animations
      </script>
    </body>
    </html>`;
    } else if (techStack === 'mantine') {
      frameworkInstructions = `Generate a Mantine UI application (Full-featured React):

    FRAMEWORK REQUIREMENTS:
    - React 18+ with hooks
    - Mantine UI component style
    - Comprehensive form handling
    - Rich component library
    - Theme customization
    - Include React, ReactDOM, Babel via CDN

    MANTINE DESIGN PRINCIPLES:
    - Clean, professional design
    - Blue as primary color (#228BE6)
    - Consistent spacing system (4px base)
    - Paper components with elevation
    - Smooth transitions
    - Accessible components

    COMPONENTS TO EMULATE:
    - Button with variants and sizes
    - TextInput with icons and validation
    - Select and MultiSelect
    - Modal and Drawer
    - Tabs and Accordion
    - Table with sorting
    - Notifications
    - DatePicker and TimeInput
    - Card and Paper
    - Badge and Chip

    CODE STRUCTURE:
    <!DOCTYPE html>
    <html>
    <head>
      <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
      <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-50">
      <div id="root"></div>
      <script type="text/babel">
        // Mantine-style React components
      </script>
    </body>
    </html>`;
    } else if (techStack === 'antd') {
      frameworkInstructions = `Generate an Ant Design application (Enterprise-grade UI):

    FRAMEWORK REQUIREMENTS:
    - React 18+ with hooks
    - Ant Design component style
    - Enterprise-level design system
    - Comprehensive components
    - Professional aesthetics
    - Include React, ReactDOM, Babel via CDN
    - Include Ant Design CSS

    ANT DESIGN PRINCIPLES:
    - Enterprise-grade design
    - Blue primary color (#1890FF)
    - Structured layouts
    - Data-dense interfaces
    - Professional color palette
    - Consistent spacing (8px grid)

    COMPONENTS TO EMULATE:
    - Button with types (primary, default, dashed, text, link)
    - Form with validation
    - Table with pagination and sorting
    - Modal and Drawer
    - Menu and Dropdown
    - Tabs and Steps
    - Alert and Message
    - DatePicker and TimePicker
    - Upload and Transfer
    - Breadcrumb and Pagination

    CODE STRUCTURE:
    <!DOCTYPE html>
    <html>
    <head>
      <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
      <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/5.11.5/reset.min.css">
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
      <div id="root"></div>
      <script type="text/babel">
        // Ant Design-style React components
      </script>
    </body>
    </html>`;
    } else if (techStack === 'mui') {
      frameworkInstructions = `Generate a Material UI (MUI) application:

    FRAMEWORK REQUIREMENTS:
    - React 18+ with hooks
    - Material Design 3 principles
    - Material UI component style
    - Elevation and shadows
    - Include React, ReactDOM, Babel via CDN

    MATERIAL DESIGN PRINCIPLES:
    - Material Design 3 aesthetics
    - Primary color (#1976D2 - Blue)
    - Elevation system (shadows for depth)
    - Ripple effects on interactions
    - Rounded corners (4px default)
    - Typography scale

    COMPONENTS TO EMULATE:
    - Button with variants (contained, outlined, text)
    - Card with elevation
    - TextField with labels
    - AppBar and Toolbar
    - Drawer and Dialog
    - Tabs and BottomNavigation
    - Chip and Avatar
    - Snackbar and Alert
    - List and ListItem
    - Menu and Select

    CODE STRUCTURE:
    <!DOCTYPE html>
    <html>
    <head>
      <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
      <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap">
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="font-roboto">
      <div id="root"></div>
      <script type="text/babel">
        // Material UI-style React components
      </script>
    </body>
    </html>`;
    } else if (techStack === 'chakra') {
      frameworkInstructions = `Generate a Chakra UI application:

    FRAMEWORK REQUIREMENTS:
    - React 18+ with hooks
    - Chakra UI component style
    - Accessible, composable components
    - Theme-aware design
    - Include React, ReactDOM, Babel via CDN

    CHAKRA UI PRINCIPLES:
    - Simple, modular, accessible
    - Teal as primary color (#319795)
    - Consistent spacing (4px base)
    - Light/dark mode support
    - Flexible composition

    COMPONENTS TO EMULATE:
    - Button with color schemes
    - Box and Stack for layouts
    - Input and FormControl
    - Modal and Drawer
    - Tabs and Accordion
    - Menu and Popover
    - Alert and Toast
    - Badge and Tag
    - Card and Divider

    CODE STRUCTURE:
    <!DOCTYPE html>
    <html>
    <head>
      <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
      <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
      <div id="root"></div>
      <script type="text/babel">
        // Chakra UI-style React components
      </script>
    </body>
    </html>`;
    } else if (techStack === 'bootstrap') {
      frameworkInstructions = `Generate a Bootstrap 5 application:

    FRAMEWORK REQUIREMENTS:
    - HTML5 with Bootstrap 5
    - Responsive grid system
    - Pre-built components
    - Include Bootstrap CSS and JS via CDN
    - jQuery not required (Bootstrap 5)

    BOOTSTRAP COMPONENTS:
    - Buttons (btn, btn-primary, btn-secondary, etc.)
    - Cards (card, card-body, card-title)
    - Navbar (navbar, navbar-expand-lg)
    - Forms (form-control, form-label, form-check)
    - Modals (modal, modal-dialog, modal-content)
    - Alerts (alert, alert-primary, alert-success)
    - Badges (badge, bg-primary)
    - Carousel for image sliders
    - Accordion for collapsible content
    - Tabs (nav-tabs, tab-content)

    CODE STRUCTURE:
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css">
    </head>
    <body>
      <!-- Bootstrap components -->
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>

    GRID SYSTEM: Use container, row, col-* classes for responsive layouts`;
    } else if (techStack === 'bulma') {
      frameworkInstructions = `Generate a Bulma application:

    FRAMEWORK REQUIREMENTS:
    - HTML5 with Bulma CSS
    - Pure CSS framework (no JavaScript)
    - Flexbox-based grid system
    - Modern, clean design
    - Include Bulma CSS via CDN

    BULMA COMPONENTS:
    - Buttons (button, is-primary, is-success, etc.)
    - Box and Card (box, card, card-content)
    - Navbar (navbar, navbar-menu, navbar-item)
    - Forms (field, control, input, select)
    - Columns (columns, column, is-*-desktop)
    - Hero (hero, hero-body, is-fullheight)
    - Panel (panel, panel-heading, panel-block)
    - Modal (modal, modal-content, modal-background)
    - Tabs (tabs, is-boxed, is-toggle)
    - Message (message, message-header, message-body)

    CODE STRUCTURE:
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    </head>
    <body>
      <!-- Bulma components -->
    </body>
    </html>

    GRID: Use columns and column with size modifiers (is-half, is-one-third, etc.)`;
    } else if (techStack === 'alpine') {
      frameworkInstructions = `Generate an Alpine.js application:

    FRAMEWORK REQUIREMENTS:
    - HTML5 with Alpine.js (minimal JavaScript framework)
    - Declarative reactivity in HTML
    - Use x-data, x-bind, x-on, x-show, x-if directives
    - Tailwind CSS for styling
    - Include Alpine.js via CDN

    ALPINE.JS DIRECTIVES:
    - x-data: Declare component data
    - x-on (@): Event listeners (@click, @submit)
    - x-bind (:): Bind attributes (:class, :disabled)
    - x-show: Toggle visibility
    - x-if: Conditional rendering
    - x-for: Loop through items
    - x-model: Two-way data binding
    - x-text: Set text content
    - x-html: Set HTML content

    CODE STRUCTURE:
    <!DOCTYPE html>
    <html>
    <head>
      <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
      <!-- Alpine.js reactive components -->
      <div x-data="{ open: false, count: 0, items: [] }">
        <button @click="open = !open" class="btn">Toggle</button>
        <div x-show="open" x-transition>Content</div>
        <p x-text="count"></p>
      </div>
    </body>
    </html>

    PATTERNS:
    - Dropdowns with x-show
    - Modals with x-show and backdrop
    - Tabs with x-data
    - Forms with x-model
    - Counters and toggles`;
    } else if (techStack === 'htmx') {
      frameworkInstructions = `Generate an HTMX application:

    FRAMEWORK REQUIREMENTS:
    - HTML5 with HTMX (hypermedia-driven)
    - Modern web apps without much JavaScript
    - Use hx-get, hx-post, hx-swap attributes
    - Tailwind CSS for styling
    - Include HTMX via CDN

    HTMX ATTRIBUTES:
    - hx-get: Issue GET request
    - hx-post: Issue POST request
    - hx-put, hx-delete: Other HTTP methods
    - hx-trigger: Event that triggers request (click, submit, etc.)
    - hx-target: Where to place response
    - hx-swap: How to swap content (innerHTML, outerHTML, etc.)
    - hx-indicator: Show loading indicator
    - hx-boost: Progressive enhancement

    CODE STRUCTURE:
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://unpkg.com/htmx.org@1.9.10"></script>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
      <!-- HTMX-powered components -->
      <button hx-get="/api/data"
              hx-target="#result"
              hx-swap="innerHTML"
              class="btn">
        Load Data
      </button>
      <div id="result"></div>

      <!-- Simulated endpoints using inline data -->
      <div hx-get="/fake-endpoint" hx-trigger="click" style="display:none">
        <p>Loaded content</p>
      </div>
    </body>
    </html>

    PATTERNS:
    - Infinite scroll
    - Load more buttons
    - Form submissions
    - Live search
    - Polling for updates`;
    } else if (techStack === 'aceternity') {
      frameworkInstructions = `Generate an Aceternity UI application (Beautiful animations):

    FRAMEWORK REQUIREMENTS:
    - React 18+ with hooks
    - Framer Motion for animations
    - Tailwind CSS for styling
    - Beautiful, modern components with stunning animations
    - Include React, ReactDOM, Babel, Framer Motion via CDN

    ACETERNITY DESIGN STYLE:
    - Dark mode by default
    - Gradient backgrounds
    - Animated borders and glows
    - Particle effects
    - Smooth transitions
    - Glassmorphism
    - 3D transforms

    COMPONENTS TO CREATE:
    - Hero sections with animated gradients
    - Cards with hover effects and 3D tilt
    - Buttons with ripple and glow effects
    - Navigation with animated underlines
    - Backgrounds with moving gradients
    - Text with gradient animations
    - Floating elements
    - Beam animations

    CODE STRUCTURE:
    <!DOCTYPE html>
    <html class="dark">
    <head>
      <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
      <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @keyframes gradient { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .animate-gradient { animation: gradient 15s ease infinite; background-size: 200% 200%; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
      </style>
    </head>
    <body class="bg-black text-white">
      <div id="root"></div>
      <script type="text/babel">
        // Aceternity-style React components with beautiful animations
      </script>
    </body>
    </html>`;
    } else if (techStack === 'magicui') {
      frameworkInstructions = `Generate a Magic UI application (Stunning components):

    FRAMEWORK REQUIREMENTS:
    - React 18+ with hooks
    - Tailwind CSS for styling
    - Beautiful, magical animations
    - Modern, eye-catching design
    - Include React, ReactDOM, Babel via CDN

    MAGIC UI STYLE:
    - Vibrant gradients
    - Smooth animations
    - Interactive hover effects
    - Modern glassmorphism
    - Colorful accents
    - Particle effects
    - Animated backgrounds

    COMPONENTS TO CREATE:
    - Animated buttons with shine effects
    - Cards with gradient borders
    - Hero sections with animated text
    - Navigation with smooth transitions
    - Input fields with focus animations
    - Badges with pulse effects
    - Modals with backdrop blur
    - Stats with number animations

    CODE STRUCTURE:
    <!DOCTYPE html>
    <html>
    <head>
      <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
      <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .animate-shimmer { animation: shimmer 2s infinite; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); background-size: 200% 100%; }
      </style>
    </head>
    <body class="bg-gradient-to-br from-purple-50 to-pink-50">
      <div id="root"></div>
      <script type="text/babel">
        // Magic UI-style React components
      </script>
    </body>
    </html>`;
    } else if (techStack === 'vanilla') {
      frameworkInstructions = `Generate vanilla HTML/CSS/JavaScript:

    REQUIREMENTS:
    - Pure HTML5 with semantic elements
    - Modern CSS3 (Grid, Flexbox, Custom Properties)
    - Vanilla JavaScript ES6+ (no frameworks)
    - No external dependencies except CDN for fonts/icons
    - Clean, modular code with comments
    - Mobile-responsive design`;
    } else {
      frameworkInstructions = `Generate code using ${techStack} framework with production-ready best practices.`;
    }
    
    // Check if this is a modification request with existing code
    const isModification = intentAnalysis.intent === 'code_modification' || 
                          (currentCode && currentCode.length > 100);
    
    const layoutPreservationRules = isModification ? `
    CRITICAL LAYOUT PRESERVATION RULES:
    ================================
    1. NEVER change the existing layout, design, theme, or Tailwind classes unless explicitly requested
    2. Preserve ALL existing styling, colors, spacing, and visual appearance
    3. When adding new content or features:
       - Inject them into the existing structure
       - Match the existing design patterns and styling
       - Use the same CSS classes and styling conventions
    4. When updating text or data:
       - Only change the content itself
       - Keep all wrapper elements and classes intact
    5. When adding new sections:
       - Follow the existing design language
       - Copy styling patterns from similar existing sections
    6. Explicit design change keywords: "change design", "update layout", "switch theme", "redesign", "new style"
    7. If none of these keywords are present, PRESERVE THE CURRENT DESIGN
    
    Current code to modify:
    ${currentCode ? '```\n' + currentCode + '\n```' : 'No existing code provided'}
    
    User is asking to: ${prompt}
    
    IMPORTANT: Maintain the exact same visual appearance while implementing the requested changes.
    ` : '';
    
    const systemPrompt = `You are an EXPERT web developer creating PRODUCTION-READY, FULLY FUNCTIONAL code.
    
    ${layoutPreservationRules}
    
    ${frameworkInstructions}
    
    ${commentInstructions}
    
    CRITICAL CODE GENERATION RULES:
    ================================
    1. **ALWAYS generate COMPLETE, WORKING code** - no placeholders, no pseudocode, no "..." 
    2. **Code must run IMMEDIATELY** when opened in a browser - zero configuration needed
    3. **Include ALL necessary CDN links** for libraries (React, Vue, Tailwind, etc.)
    4. **Write REAL functionality** - forms should work, buttons should have actions, state should update
    5. **Use PROPER framework syntax** - respect each framework's conventions and best practices
    6. **Single HTML file output** with all CSS and JavaScript embedded
    7. **NO MISSING DEPENDENCIES** - if you use a library, include its CDN link
    8. **FULL implementations** - don't skip parts or use comments like "// Add more items here"
    
    FRAMEWORK-SPECIFIC ACCURACY:
    ============================
    - React: Use hooks (useState, useEffect), functional components, JSX with Babel
    - Vue: Use Composition API, reactive refs, proper template syntax
    - Angular: TypeScript patterns, decorators syntax (simulated in vanilla JS)
    - Svelte: Reactive statements, component structure (simulated)
    - Next.js/Nuxt.js: SSR patterns, file-based routing concepts (simulated)
    
    VISUAL & UX REQUIREMENTS:
    ========================
    - Use Tailwind CSS classes for ALL styling (via CDN)
    - Include smooth transitions and hover effects
    - Implement proper responsive design (mobile-first)
    - Add loading states and error handling
    - Use professional color schemes and spacing
    
    IMAGE REQUIREMENTS:
    ==================
    - Use Unsplash API: https://source.unsplash.com/800x600/?{keyword}
    - User avatars: https://i.pravatar.cc/150?img={1-70}
    - Placeholders: https://via.placeholder.com/400x300
    - Include alt text for accessibility
    
    DATA & CONTENT:
    ==============
    - Use REALISTIC data (names, prices, descriptions)
    - Include at least 5-10 items for lists/grids
    - Add proper form validation
    - Implement actual search/filter functionality when requested
    
    OUTPUT FORMAT:
    =============
    - Start with <!DOCTYPE html>
    - Include all meta tags and CDN links in <head>
    - Embed all CSS in <style> tags
    - Embed all JavaScript in <script> tags
    - NO external file references
    - NO import/export statements (use global scope)
    
    QUALITY CHECKLIST:
    ==================
    ✓ Code runs without errors
    ✓ All features are functional
    ✓ Responsive on all devices
    ✓ Proper error handling
    ✓ Clean, readable code
    ✓ Framework conventions followed
    ✓ No placeholder content
    ✓ Complete implementation
    
    Return ONLY the complete HTML code. No explanations, no markdown, no code blocks.`;

    // Analyze the prompt to determine relevant image keywords
    const imageKeywords = analyzePromptForImages(prompt);
    
    const enhancedSystemPrompt = systemPrompt.replace(
      'Replace {keyword} with relevant terms',
      `Use these specific keywords for images: ${imageKeywords.join(', ')}`
    );
    
    // Add conversation context if available
    let contextualPrompt = prompt;
    if (conversationHistory && conversationHistory.length > 0) {
      const relevantHistory = conversationHistory.slice(-5); // Last 5 exchanges for context
      const contextStr = relevantHistory
        .map((msg: any) => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
        .join('\n');
      contextualPrompt = `Previous context:\n${contextStr}\n\nCurrent request: ${prompt}\n\nIMPORTANT: If the user is asking to modify or update something from the conversation, make sure to incorporate those changes into the generated code while PRESERVING the existing layout and design.`;
    }
    
    const fullPrompt = `${enhancedSystemPrompt}\n\nUser request: ${contextualPrompt}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const rawText = response.text();
    
    // Use the cleaning function to extract only HTML
    const cleanedCode = cleanGeneratedCode(rawText);

    return NextResponse.json({ 
      code: cleanedCode,
      intent: intentAnalysis.intent,
      isCodeUpdate: intentAnalysis.intent === 'code_modification'
    });
  } catch (error: any) {
    console.error('Generation error:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('API key not valid') || error.message?.includes('API_KEY_INVALID')) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your Gemini API key in Settings. Get your free API key from https://aistudio.google.com/apikey' },
        { status: 401 }
      );
    }
    
    if (error.message?.includes('quota') || error.message?.includes('RATE_LIMIT')) {
      return NextResponse.json(
        { error: 'API quota exceeded. Please check your Google AI Studio account or wait a moment and try again.' },
        { status: 429 }
      );
    }

    if (error.message?.includes('PERMISSION_DENIED')) {
      return NextResponse.json(
        { error: 'Permission denied. Please ensure your API key has the correct permissions.' },
        { status: 403 }
      );
    }

    if (error.message?.includes('MODEL_NOT_FOUND')) {
      return NextResponse.json(
        { error: 'Model not found. The Gemini model may be unavailable in your region.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to generate code. Please check your API key and try again.' },
      { status: 500 }
    );
  }
}