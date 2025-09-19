import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  
  // Check for specific framework mentions
  if (promptLower.includes('next.js') || promptLower.includes('nextjs')) {
    return 'nextjs';
  }
  if (promptLower.includes('vite')) {
    return 'vite';
  }
  if (promptLower.includes('react') && !promptLower.includes('vite')) {
    return 'react';
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
  if (promptLower.includes('vanilla') || promptLower.includes('plain')) {
    return 'vanilla';
  }
  
  // Default to modern React+Vite stack for better looking apps
  return 'modern';
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

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google AI API key is required. Please add it in Settings.' },
        { status: 400 }
      );
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
    if (techStack === 'modern') {
      frameworkInstructions = `Generate a modern, production-ready application using:
    - React with functional components and hooks
    - Vite-style modern development approach
    - Tailwind CSS for styling (use inline classes)
    - Modern JavaScript (ES6+/ES2022)
    - Create a single HTML file with all code embedded
    - Include React and Tailwind via CDN links
    - Use modern UI patterns with gradients, shadows, and animations
    - Make it visually appealing with a professional design
    - Include hero sections with beautiful background images
    - Add image galleries or cards with relevant photos
    - Mention it's built with modern tools like Vite for optimal performance`;
    } else if (techStack === 'nextjs') {
      frameworkInstructions = `Generate a Next.js application with:
    - React functional components
    - Tailwind CSS for styling
    - App Router patterns
    - Server and client components where appropriate
    - Create a single HTML file for preview with embedded code`;
    } else if (techStack === 'vite') {
      frameworkInstructions = `Generate a Vite-powered application with:
    - Vite as the build tool with ultra-fast HMR (Hot Module Replacement)
    - React with TypeScript for type safety
    - Tailwind CSS for styling
    - Modern ES modules
    - Optimized production builds
    - Create a single HTML file that demonstrates Vite's capabilities
    - Include Vite's logo and mention it's powered by Vite
    - Use modern JavaScript features (ES2022+)
    - Add smooth animations and transitions
    - Include dev server features like instant updates`;
    } else if (techStack === 'react') {
      frameworkInstructions = `Generate a React application with:
    - Functional components and hooks
    - Tailwind CSS or modern inline styles
    - Create a single HTML file with React via CDN`;
    } else if (techStack === 'vanilla') {
      frameworkInstructions = `Generate vanilla HTML/CSS/JavaScript with:
    - Modern, clean HTML5
    - CSS3 with flexbox/grid
    - Vanilla JavaScript (no frameworks)`;
    } else {
      frameworkInstructions = `Generate code using ${techStack} framework with modern best practices.`;
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
    
    const systemPrompt = `You are an expert web developer who is also a patient teacher. Generate clean, modern, and functional code for the requested application.
    
    ${layoutPreservationRules}
    
    ${frameworkInstructions}
    
    ${commentInstructions}
    
    CRITICAL REQUIREMENT - VISUAL CONTENT:
    - ALWAYS include relevant images that match the user's request
    - Use Unsplash for high-quality, contextual images: https://source.unsplash.com/800x600/?{keyword}
    - Replace {keyword} with relevant terms based on the app (e.g., "technology", "nature", "business", "food", "travel")
    - For user avatars, use: https://i.pravatar.cc/150?img={number} (use random numbers 1-70)
    - For placeholder images when needed: https://via.placeholder.com/400x300/667eea/ffffff?text={text}
    - Include multiple relevant images to make the app visually appealing
    - Use images in hero sections, cards, galleries, backgrounds, etc.
    
    Image Usage Examples:
    - Portfolio app: Use professional headshots, work samples, office images
    - E-commerce: Product images, shopping, retail
    - Restaurant: Food, dining, chef, restaurant interior
    - Travel: Destinations, landscapes, adventures
    - Blog: Topic-relevant images for each post
    - Dashboard: Charts can use Chart.js but also include relevant background images
    
    Other guidelines:
    - Generate complete, working code
    - Include proper styling with inline styles or embedded CSS
    - Make the code production-ready
    - Include error handling
    - Add responsive design
    - Follow best practices for the chosen framework
    - For HTML, create a complete HTML file with embedded CSS and JavaScript
    - Make sure the code is self-contained and can run immediately
    - Images should load immediately from the URLs provided
    
    SMART INFERENCE RULES:
    - Be intelligent about user intent
    - If they ask to "add a testimonials section", infer they want customer testimonials with quotes
    - If they ask to "update the hero text", only change the text content, not the design
    - If they say "make it better", enhance content and features but keep the same design
    - If they say "add more products", add more items matching the existing product card style
    - Always exceed expectations with quality content while preserving the design
    
    Return ONLY the code (with educational comments) without markdown code blocks or any markdown formatting like \`\`\`html or \`\`\`.`;

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
    const text = response.text();
    
    // Clean up the response - remove any markdown code blocks if present
    let cleanedCode = text;
    
    // Remove markdown code blocks
    cleanedCode = cleanedCode.replace(/```[\w]*\n/g, '');
    cleanedCode = cleanedCode.replace(/```$/g, '');
    cleanedCode = cleanedCode.trim();

    return NextResponse.json({ 
      code: cleanedCode,
      intent: intentAnalysis.intent,
      isCodeUpdate: intentAnalysis.intent === 'code_modification'
    });
  } catch (error: any) {
    console.error('Generation error:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('API key not valid')) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your Gemini API key in Settings.' },
        { status: 401 }
      );
    }
    
    if (error.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'API quota exceeded. Please check your Google AI Studio account.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to generate code. Please try again.' },
      { status: 500 }
    );
  }
}