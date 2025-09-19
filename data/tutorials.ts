export interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  concepts: string[];
  prompt: string;
  framework: string;
  icon: string;
}

export const tutorials: Tutorial[] = [
  // Beginner Tutorials
  {
    id: 'hello-world',
    title: 'Your First Web Page',
    description: 'Create a simple "Hello World" page with styled text',
    difficulty: 'beginner',
    estimatedTime: '5 mins',
    concepts: ['HTML basics', 'CSS styling', 'Text formatting'],
    prompt: 'Create a simple hello world page with colorful text and a nice font',
    framework: 'html',
    icon: '👋'
  },
  {
    id: 'interactive-button',
    title: 'Interactive Button',
    description: 'Build a button that responds to clicks with animations',
    difficulty: 'beginner',
    estimatedTime: '10 mins',
    concepts: ['HTML buttons', 'CSS animations', 'JavaScript events'],
    prompt: 'Create a colorful button that changes color when clicked and shows a message',
    framework: 'html',
    icon: '🔘'
  },
  {
    id: 'personal-card',
    title: 'Personal Profile Card',
    description: 'Design a beautiful profile card with your information',
    difficulty: 'beginner',
    estimatedTime: '15 mins',
    concepts: ['HTML structure', 'CSS flexbox', 'Image handling'],
    prompt: 'Create a personal profile card with avatar, name, bio, and social links',
    framework: 'html',
    icon: '👤'
  },
  {
    id: 'color-picker',
    title: 'Color Palette Generator',
    description: 'Build a tool that generates random color palettes',
    difficulty: 'beginner',
    estimatedTime: '20 mins',
    concepts: ['DOM manipulation', 'Random values', 'Color theory'],
    prompt: 'Create a color palette generator that shows 5 random colors with hex codes',
    framework: 'html',
    icon: '🎨'
  },

  // Intermediate Tutorials
  {
    id: 'todo-list',
    title: 'Todo List App',
    description: 'Create a functional todo list with add, delete, and complete features',
    difficulty: 'intermediate',
    estimatedTime: '30 mins',
    concepts: ['DOM manipulation', 'Local storage', 'Event handling', 'Array methods'],
    prompt: 'Build a todo list app with add, delete, mark complete, and local storage to save tasks',
    framework: 'html',
    icon: '✅'
  },
  {
    id: 'calculator',
    title: 'Calculator',
    description: 'Build a working calculator with basic operations',
    difficulty: 'intermediate',
    estimatedTime: '25 mins',
    concepts: ['JavaScript math', 'Event delegation', 'State management'],
    prompt: 'Create a calculator with buttons for numbers and basic operations (+, -, *, /)',
    framework: 'html',
    icon: '🧮'
  },
  {
    id: 'countdown-timer',
    title: 'Countdown Timer',
    description: 'Create a countdown timer with start, stop, and reset functionality',
    difficulty: 'intermediate',
    estimatedTime: '25 mins',
    concepts: ['setInterval', 'Date objects', 'State management'],
    prompt: 'Build a countdown timer that counts down from a user-specified time with start, pause, and reset buttons',
    framework: 'html',
    icon: '⏱️'
  },
  {
    id: 'weather-card',
    title: 'Weather Display Card',
    description: 'Design a weather information card with animations',
    difficulty: 'intermediate',
    estimatedTime: '20 mins',
    concepts: ['CSS animations', 'Data display', 'Responsive design'],
    prompt: 'Create a weather card showing temperature, conditions, and animated weather icons',
    framework: 'html',
    icon: '🌤️'
  },

  // Advanced Tutorials
  {
    id: 'quiz-app',
    title: 'Interactive Quiz',
    description: 'Build a quiz application with scoring and feedback',
    difficulty: 'advanced',
    estimatedTime: '45 mins',
    concepts: ['Complex state', 'Data structures', 'User feedback', 'Score tracking'],
    prompt: 'Create a quiz app with multiple choice questions, score tracking, and results display',
    framework: 'html',
    icon: '🎯'
  },
  {
    id: 'expense-tracker',
    title: 'Expense Tracker',
    description: 'Create an expense tracking app with charts',
    difficulty: 'advanced',
    estimatedTime: '40 mins',
    concepts: ['Data visualization', 'Complex calculations', 'Form handling'],
    prompt: 'Build an expense tracker with categories, monthly totals, and a simple bar chart',
    framework: 'html',
    icon: '💰'
  },
  {
    id: 'memory-game',
    title: 'Memory Card Game',
    description: 'Create a card matching memory game',
    difficulty: 'advanced',
    estimatedTime: '50 mins',
    concepts: ['Game logic', 'Animation timing', 'Score system', 'Shuffle algorithm'],
    prompt: 'Create a memory card game with flip animations, match detection, and score keeping',
    framework: 'html',
    icon: '🃏'
  },
  {
    id: 'markdown-editor',
    title: 'Markdown Editor',
    description: 'Build a live markdown editor with preview',
    difficulty: 'advanced',
    estimatedTime: '35 mins',
    concepts: ['Text processing', 'Real-time updates', 'String manipulation'],
    prompt: 'Create a markdown editor with live preview showing formatted output',
    framework: 'html',
    icon: '📝'
  }
];

export const learningPaths = {
  'Web Fundamentals': ['hello-world', 'interactive-button', 'personal-card'],
  'Interactive Apps': ['todo-list', 'calculator', 'countdown-timer'],
  'Advanced Projects': ['quiz-app', 'expense-tracker', 'memory-game'],
};

export const getTutorialById = (id: string): Tutorial | undefined => {
  return tutorials.find(t => t.id === id);
};

export const getTutorialsByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced'): Tutorial[] => {
  return tutorials.filter(t => t.difficulty === difficulty);
};