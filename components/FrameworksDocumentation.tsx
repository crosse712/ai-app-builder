'use client';

import React, { useState } from 'react';
import { X, Search, Code, Sparkles, Zap, Building, Palette, Rocket } from 'lucide-react';

interface Framework {
  id: string;
  name: string;
  category: 'modern' | 'lightweight' | 'enterprise' | 'classic' | 'animation';
  icon: string;
  description: string;
  howToUse: string;
  examplePrompt: string;
  promptExamples: {
    title: string;
    prompt: string;
    description: string;
  }[];
  features: string[];
  bestFor: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  style: string;
  cdnLinks?: string[];
}

const frameworks: Framework[] = [
  // Modern UI Frameworks
  {
    id: 'shadcn',
    name: 'shadcn/ui',
    category: 'modern',
    icon: '🎨',
    description: 'Beautiful, accessible components built with React, Tailwind CSS, and Radix UI. The most popular modern UI library in 2024.',
    howToUse: 'Simply mention "shadcn", "shadcn/ui", or "shadcn ui" in your prompt.',
    examplePrompt: 'Create a modern dashboard with shadcn/ui',
    promptExamples: [
      {
        title: 'Dashboard with Cards',
        prompt: 'Build a dashboard using shadcn/ui with cards showing stats, charts, and a data table',
        description: 'Creates a professional dashboard with shadcn card components, subtle borders, and clean layout'
      },
      {
        title: 'Login Form',
        prompt: 'Create a login page with shadcn ui including email and password fields with validation',
        description: 'Generates a clean login form with proper labels, error states, and accessible form elements'
      },
      {
        title: 'Settings Page',
        prompt: 'Make a settings page using shadcn with tabs for profile, notifications, and security',
        description: 'Builds a tabbed interface with shadcn styling, form inputs, and button variants'
      },
      {
        title: 'E-commerce Product Page',
        prompt: 'Build a product details page with shadcn/ui showing images, description, price, and add to cart',
        description: 'Creates a modern product page with image gallery, ghost buttons, and card layouts'
      }
    ],
    features: [
      'Accessible components with ARIA labels',
      'Professional color schemes (neutral, slate, zinc)',
      'Multiple button variants (default, destructive, outline, ghost)',
      'Card components with proper spacing',
      'Form elements with validation states',
      'Dark mode support'
    ],
    bestFor: 'Modern web applications, SaaS products, professional dashboards',
    difficulty: 'Medium',
    style: 'Professional, subtle, accessible'
  },
  {
    id: 'daisyui',
    name: 'DaisyUI',
    category: 'modern',
    icon: '🌼',
    description: 'The most popular Tailwind CSS component library with 50+ gorgeous pre-styled components and built-in themes.',
    howToUse: 'Mention "daisyui" or "daisy" in your prompt.',
    examplePrompt: 'Build a landing page using DaisyUI with the dark theme',
    promptExamples: [
      {
        title: 'Colorful Landing Page',
        prompt: 'Create a landing page with DaisyUI using the cupcake theme with hero section and feature cards',
        description: 'Generates a colorful, playful landing page with DaisyUI\'s cupcake theme'
      },
      {
        title: 'Todo App with Stats',
        prompt: 'Build a todo app using DaisyUI with stats cards showing completed tasks',
        description: 'Creates an interactive todo list with DaisyUI stat components and badges'
      },
      {
        title: 'Contact Form',
        prompt: 'Make a contact form with daisyui including name, email, message fields and submit button',
        description: 'Builds a beautiful form with DaisyUI form controls and button styles'
      },
      {
        title: 'Pricing Page',
        prompt: 'Create a pricing page using DaisyUI with 3 pricing tiers and comparison table',
        description: 'Generates pricing cards with badges, lists, and call-to-action buttons'
      }
    ],
    features: [
      '50+ beautiful components',
      'Built-in themes (light, dark, cupcake, bumblebee, emerald, corporate)',
      'Pure Tailwind CSS classes',
      'Easy to customize',
      'Responsive by default',
      'No JavaScript dependencies'
    ],
    bestFor: 'Rapid prototyping, colorful designs, themed applications',
    difficulty: 'Easy',
    style: 'Colorful, playful, themed'
  },
  {
    id: 'flowbite',
    name: 'Flowbite',
    category: 'modern',
    icon: '💎',
    description: 'Modern Tailwind CSS components with beautiful design and production-ready code.',
    howToUse: 'Mention "flowbite" in your prompt.',
    examplePrompt: 'Create a portfolio site with Flowbite components',
    promptExamples: [
      {
        title: 'Portfolio Website',
        prompt: 'Build a portfolio website using Flowbite with navbar, project cards, and contact section',
        description: 'Creates a professional portfolio with Flowbite navigation, card components, and forms'
      },
      {
        title: 'Blog Platform',
        prompt: 'Create a blog homepage with Flowbite showing article cards, sidebar, and pagination',
        description: 'Generates a clean blog layout with Flowbite cards, badges, and pagination components'
      },
      {
        title: 'Product Showcase',
        prompt: 'Make a product showcase page with Flowbite including image gallery and feature timeline',
        description: 'Builds a product page with Flowbite carousel, timeline, and call-to-action buttons'
      },
      {
        title: 'Team Directory',
        prompt: 'Build a team directory with Flowbite showing member cards with avatars and social links',
        description: 'Creates a team page with Flowbite avatar groups, cards, and icon buttons'
      }
    ],
    features: [
      'Production-ready components',
      'Modern, clean aesthetics',
      'Interactive components with JavaScript',
      'Comprehensive documentation',
      'Forms, modals, dropdowns, tooltips',
      'Timeline and progress components'
    ],
    bestFor: 'Production websites, marketing sites, professional portfolios',
    difficulty: 'Easy',
    style: 'Clean, modern, professional'
  },
  {
    id: 'nextui',
    name: 'NextUI',
    category: 'modern',
    icon: '✨',
    description: 'Beautiful React UI library with stunning animations, glassmorphism effects, and modern design.',
    howToUse: 'Mention "nextui" or "next ui" in your prompt.',
    examplePrompt: 'Build a SaaS dashboard with NextUI',
    promptExamples: [
      {
        title: 'SaaS Dashboard',
        prompt: 'Create a SaaS analytics dashboard with NextUI featuring glassmorphic cards and gradient buttons',
        description: 'Builds a modern dashboard with NextUI glassmorphism, animated charts, and blur effects'
      },
      {
        title: 'App Landing Page',
        prompt: 'Build an app landing page using NextUI with animated hero, feature cards, and pricing section',
        description: 'Generates a stunning landing page with smooth animations and gradient accents'
      },
      {
        title: 'User Profile',
        prompt: 'Make a user profile page with NextUI showing avatar, stats, and tabbed content',
        description: 'Creates a beautiful profile with NextUI avatar groups, badges, and animated tabs'
      },
      {
        title: 'Notification Center',
        prompt: 'Create a notification center using NextUI with backdrop blur modal and animated list items',
        description: 'Builds an elegant notification UI with glassmorphic modal and smooth transitions'
      }
    ],
    features: [
      'Smooth animations and transitions',
      'Glassmorphism effects',
      'Gradient accents',
      'Loading states and animations',
      'Backdrop blur modals',
      'Modern spacing and shadows'
    ],
    bestFor: 'SaaS products, modern web apps, design-focused projects',
    difficulty: 'Medium',
    style: 'Modern, animated, glassmorphic'
  },

  // Lightweight Frameworks
  {
    id: 'alpine',
    name: 'Alpine.js',
    category: 'lightweight',
    icon: '⚡',
    description: 'Minimal JavaScript framework (16KB) for adding reactivity directly to HTML. Think of it as jQuery for the modern web.',
    howToUse: 'Mention "alpine" or "alpinejs" in your prompt.',
    examplePrompt: 'Create a todo app with Alpine.js',
    promptExamples: [
      {
        title: 'Interactive Todo List',
        prompt: 'Build a todo app with Alpine.js featuring add, delete, and mark complete functionality',
        description: 'Creates a reactive todo list using Alpine\'s x-data, x-model, and x-for directives'
      },
      {
        title: 'Modal Dialog',
        prompt: 'Create a modal component with Alpine.js that opens and closes with smooth transitions',
        description: 'Builds an Alpine-powered modal with x-show and x-transition for smooth animations'
      },
      {
        title: 'Dropdown Menu',
        prompt: 'Make a dropdown menu using Alpine.js that toggles on click and closes when clicking outside',
        description: 'Generates an interactive dropdown with Alpine click handlers and conditional rendering'
      },
      {
        title: 'Search Filter',
        prompt: 'Build a search filter with Alpine.js that filters a list of items in real-time',
        description: 'Creates a live search feature using x-model for input binding and x-show for filtering'
      }
    ],
    features: [
      'Declarative reactive data with x-data',
      'Event listeners with @click, @submit',
      'Two-way binding with x-model',
      'Conditional rendering with x-if and x-show',
      'Loops with x-for',
      'Only 16KB minified'
    ],
    bestFor: 'Adding interactivity to static sites, simple SPAs, progressive enhancement',
    difficulty: 'Easy',
    style: 'Minimal JavaScript with Tailwind CSS'
  },
  {
    id: 'htmx',
    name: 'HTMX',
    category: 'lightweight',
    icon: '🚀',
    description: 'Build modern user interfaces with the simplicity and power of hypertext. Modern web apps without much JavaScript.',
    howToUse: 'Mention "htmx" in your prompt.',
    examplePrompt: 'Build a form with HTMX for dynamic updates',
    promptExamples: [
      {
        title: 'Dynamic Form',
        prompt: 'Create a contact form with HTMX that submits without page reload and shows success message',
        description: 'Builds a form using hx-post and hx-swap for AJAX submissions without JavaScript'
      },
      {
        title: 'Infinite Scroll',
        prompt: 'Build an infinite scroll list with HTMX that loads more items when scrolling to bottom',
        description: 'Creates infinite scroll using hx-get, hx-trigger, and hx-swap for dynamic loading'
      },
      {
        title: 'Live Search',
        prompt: 'Make a live search with HTMX that shows results as you type',
        description: 'Generates live search using hx-get with keyup trigger for real-time results'
      },
      {
        title: 'Tab Navigation',
        prompt: 'Create tabbed content with HTMX where clicking tabs loads content dynamically',
        description: 'Builds tab interface using hx-get to load tab content on demand'
      }
    ],
    features: [
      'AJAX requests with HTML attributes',
      'WebSocket and SSE support',
      'CSS transitions for smoothness',
      'History support',
      'Progressive enhancement',
      'Server-side friendly'
    ],
    bestFor: 'Server-side rendered apps, progressive enhancement, simple interactivity',
    difficulty: 'Easy',
    style: 'Hypermedia-driven with Tailwind CSS'
  },

  // Enterprise Frameworks
  {
    id: 'antd',
    name: 'Ant Design',
    category: 'enterprise',
    icon: '🏢',
    description: 'Enterprise-grade UI design system from Alibaba. The most comprehensive React UI library for data-dense interfaces.',
    howToUse: 'Mention "ant design" or "antd" in your prompt.',
    examplePrompt: 'Create an admin dashboard with Ant Design',
    promptExamples: [
      {
        title: 'Admin Dashboard',
        prompt: 'Build an admin dashboard with Ant Design showing user table, statistics, and charts',
        description: 'Creates enterprise dashboard with Ant Design table, cards, and data visualization'
      },
      {
        title: 'Form Builder',
        prompt: 'Create a complex form with Ant Design including validation, steps, and file upload',
        description: 'Generates multi-step form with Ant Design form components, validation, and upload'
      },
      {
        title: 'Data Table Page',
        prompt: 'Make a data management page with antd table featuring sorting, filtering, and pagination',
        description: 'Builds advanced table with Ant Design pagination, filters, and action buttons'
      },
      {
        title: 'Settings Panel',
        prompt: 'Build a settings panel using Ant Design with tabs, switches, and save functionality',
        description: 'Creates comprehensive settings UI with Ant Design tabs, switches, and forms'
      }
    ],
    features: [
      'Enterprise-grade components',
      'Comprehensive form handling',
      'Data tables with pagination and sorting',
      'Professional color palette',
      'Icon library included',
      'Internationalization support'
    ],
    bestFor: 'Enterprise dashboards, admin panels, data-heavy applications',
    difficulty: 'Medium',
    style: 'Professional, enterprise, structured'
  },
  {
    id: 'mui',
    name: 'Material UI (MUI)',
    category: 'enterprise',
    icon: '📱',
    description: 'Google\'s Material Design implemented in React. The most popular React UI framework with elevation, ripple effects, and Material Design 3 principles.',
    howToUse: 'Mention "material ui" or "mui" in your prompt.',
    examplePrompt: 'Build an e-commerce site with Material UI',
    features: [
      'Material Design 3 components',
      'Elevation system with shadows',
      'Ripple effects on interactions',
      'Comprehensive component library',
      'Theming system',
      'Responsive by default'
    ],
    bestFor: 'Google-style apps, mobile-first design, enterprise applications',
    difficulty: 'Medium',
    style: 'Material Design, elevation-based'
  },
  {
    id: 'mantine',
    name: 'Mantine UI',
    category: 'enterprise',
    icon: '🛠️',
    description: 'Full-featured React components library with 100+ customizable components and hooks.',
    howToUse: 'Mention "mantine" in your prompt.',
    examplePrompt: 'Create a CRM dashboard with Mantine',
    features: [
      '100+ hooks and components',
      'Powerful form management',
      'Date pickers and time inputs',
      'Rich text editors',
      'Notifications system',
      'Dark theme built-in'
    ],
    bestFor: 'Full-featured applications, form-heavy apps, data management',
    difficulty: 'Medium',
    style: 'Clean, professional, comprehensive'
  },
  {
    id: 'chakra',
    name: 'Chakra UI',
    category: 'enterprise',
    icon: '🔮',
    description: 'Simple, modular, and accessible component library for React. Build accessible web apps with speed.',
    howToUse: 'Mention "chakra" in your prompt.',
    examplePrompt: 'Build a blog platform with Chakra UI',
    features: [
      'Accessible components (WAI-ARIA)',
      'Composable and flexible',
      'Dark mode out of the box',
      'Style props for rapid styling',
      'Responsive design utilities',
      'TypeScript support'
    ],
    bestFor: 'Accessible applications, composable designs, developer experience',
    difficulty: 'Medium',
    style: 'Simple, accessible, teal accents'
  },

  // Classic CSS Frameworks
  {
    id: 'bootstrap',
    name: 'Bootstrap 5',
    category: 'classic',
    icon: '🅱️',
    description: 'The world\'s most popular CSS framework. Responsive grid system and pre-built components that work everywhere.',
    howToUse: 'Mention "bootstrap" in your prompt.',
    examplePrompt: 'Create a business website with Bootstrap',
    features: [
      'Responsive grid system (12 columns)',
      'Pre-built components',
      'No jQuery required (Bootstrap 5)',
      'Extensive documentation',
      'Icon library (Bootstrap Icons)',
      'Proven and reliable'
    ],
    bestFor: 'Traditional websites, rapid prototyping, familiar framework',
    difficulty: 'Easy',
    style: 'Classic, familiar, professional'
  },
  {
    id: 'bulma',
    name: 'Bulma',
    category: 'classic',
    icon: '💪',
    description: 'Modern CSS framework based on Flexbox. Pure CSS with no JavaScript, clean and modular.',
    howToUse: 'Mention "bulma" in your prompt.',
    examplePrompt: 'Build a landing page with Bulma',
    features: [
      'Pure CSS (no JavaScript)',
      'Flexbox-based grid',
      'Modular design',
      'Modern and clean aesthetics',
      'Easy to learn',
      'Responsive by default'
    ],
    bestFor: 'CSS-only projects, simple sites, clean design',
    difficulty: 'Easy',
    style: 'Modern, clean, minimal'
  },

  // Animation Frameworks
  {
    id: 'aceternity',
    name: 'Aceternity UI',
    category: 'animation',
    icon: '🌟',
    description: 'Stunning React components with beautiful animations, 3D effects, and gradient backgrounds. Perfect for eye-catching landing pages.',
    howToUse: 'Mention "aceternity" in your prompt.',
    examplePrompt: 'Create a stunning landing page with Aceternity UI',
    features: [
      'Animated gradients and borders',
      'Particle effects',
      '3D transforms and tilts',
      'Glassmorphism effects',
      'Beam animations',
      'Dark mode by default'
    ],
    bestFor: 'Landing pages, marketing sites, portfolio sites',
    difficulty: 'Advanced',
    style: 'Dark, animated, stunning'
  },
  {
    id: 'magicui',
    name: 'Magic UI',
    category: 'animation',
    icon: '🪄',
    description: 'Beautiful React components with magical animations and vibrant gradients. Make your UI stand out.',
    howToUse: 'Mention "magic ui" or "magicui" in your prompt.',
    examplePrompt: 'Build a creative portfolio with Magic UI',
    features: [
      'Shimmer effects',
      'Vibrant gradients',
      'Interactive hover effects',
      'Number animations',
      'Pulse effects',
      'Colorful accents'
    ],
    bestFor: 'Creative portfolios, marketing pages, modern designs',
    difficulty: 'Advanced',
    style: 'Vibrant, magical, animated'
  }
];

const categories = [
  { id: 'all', name: 'All Frameworks', icon: Code },
  { id: 'modern', name: 'Modern UI', icon: Sparkles },
  { id: 'lightweight', name: 'Lightweight', icon: Zap },
  { id: 'enterprise', name: 'Enterprise', icon: Building },
  { id: 'classic', name: 'Classic', icon: Palette },
  { id: 'animation', name: 'Animation', icon: Rocket }
];

interface FrameworksDocumentationProps {
  onClose: () => void;
}

export default function FrameworksDocumentation({ onClose }: FrameworksDocumentationProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);

  const filteredFrameworks = frameworks.filter(framework => {
    const matchesCategory = selectedCategory === 'all' || framework.category === selectedCategory;
    const matchesSearch = framework.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         framework.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'modern': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'lightweight': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'enterprise': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'classic': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'animation': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">UI Frameworks Guide</h2>
              <p className="text-indigo-100">Discover 15 modern frameworks to build beautiful applications</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search */}
          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search frameworks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-indigo-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedFramework ? (
            // Detailed Framework View
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setSelectedFramework(null)}
                className="text-indigo-600 hover:text-indigo-700 font-medium mb-6 flex items-center gap-2"
              >
                ← Back to all frameworks
              </button>

              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-6xl">{selectedFramework.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{selectedFramework.name}</h3>
                    <p className="text-lg text-gray-600 mb-4">{selectedFramework.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(selectedFramework.difficulty)}`}>
                        {selectedFramework.difficulty}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(selectedFramework.category)}`}>
                        {selectedFramework.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* How to Use */}
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Code className="w-5 h-5 text-indigo-600" />
                    How to Use
                  </h4>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <p className="text-gray-700 mb-3">{selectedFramework.howToUse}</p>
                    <div className="bg-white rounded-lg p-3 border border-indigo-200">
                      <p className="text-sm text-gray-500 mb-1">Quick example:</p>
                      <p className="text-gray-900 font-mono text-sm">"{selectedFramework.examplePrompt}"</p>
                    </div>
                  </div>
                </div>

                {/* Prompt Examples */}
                {selectedFramework.promptExamples && selectedFramework.promptExamples.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Prompt Examples - Copy & Try These!
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedFramework.promptExamples.map((example, index) => (
                        <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-bold text-gray-900 text-sm">{example.title}</h5>
                            <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">Try it!</span>
                          </div>
                          <div className="bg-white/80 backdrop-blur rounded-lg p-3 mb-2 border border-purple-100">
                            <p className="text-sm font-mono text-gray-800 leading-relaxed">"{example.prompt}"</p>
                          </div>
                          <p className="text-xs text-gray-600 italic">{example.description}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-bold">💡 Pro Tip:</span> Copy any prompt above, paste it into the chat, and watch the AI build it with {selectedFramework.name} styling!
                      </p>
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Key Features</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedFramework.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Best For */}
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Best For</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-gray-700">{selectedFramework.bestFor}</p>
                  </div>
                </div>

                {/* Style */}
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Design Style</h4>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-gray-700">{selectedFramework.style}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Grid of Frameworks
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFrameworks.map((framework) => (
                <div
                  key={framework.id}
                  onClick={() => setSelectedFramework(framework)}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-400 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl group-hover:scale-110 transition-transform">{framework.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                        {framework.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(framework.difficulty)}`}>
                          {framework.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{framework.description}</p>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-500 mb-1">Try saying:</p>
                    <p className="text-sm text-gray-700 font-mono italic">"{framework.examplePrompt}"</p>
                  </div>

                  <button className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                    Learn More →
                  </button>
                </div>
              ))}
            </div>
          )}

          {filteredFrameworks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No frameworks found matching your search.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!selectedFramework && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <p>
                <span className="font-semibold text-gray-900">{filteredFrameworks.length}</span> frameworks available
              </p>
              <p className="text-gray-500">
                All frameworks work with localStorage - no database needed
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
