// All content lives here. Edit this file to update the site — components only render it.

export const identity = {
  first: 'ANJALI',
  last: 'KUMARI',
  title: 'AI / Machine Learning Engineer',
  location: 'India',
  year: '2026',
  tagline: 'Building systems that turn data into intelligence.',
  email: 'aryaanjali203@gmail.com',
  github: 'https://github.com/aryaanjalii203',
  linkedin: 'https://www.linkedin.com/in/anjalikumari203/',
  resume: '/Anjali-Kumari-Resume.pdf',
};

export const nav = [
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'web', label: 'Web' },
  { id: 'stack', label: 'Stack' },
  { id: 'contact', label: 'Contact' },
];

export const bootLines = [
  'INITIALIZING',
  'LOADING INTELLIGENCE LAYER',
  'LOADING MODELS',
  'LOADING DATA PIPELINES',
  'LOADING EXPERIENCE',
  'IDENTITY VERIFIED',
];

export const about = {
  lead: 'A Computer Science graduate working across the AI/ML stack —',
  body: 'from deep learning and computer vision to LLM evaluation, prompt engineering and automated data pipelines.',
  close: 'I care about the part after the model: turning trained weights and raw data into products people can actually use.',
  meta: [
    { k: 'Location', v: 'India' },
    { k: 'Focus', v: 'AI / Machine Learning' },
    { k: 'Degree', v: 'B.Tech Computer Science & Engineering' },
    { k: 'Graduation', v: '2026' },
  ],
};

export const experience = [
  {
    role: 'AI / LLM Specialist',
    org: '', // company name withheld (contract)
    period: 'Nov 2025 — Present',
    mode: 'Remote',
    status: 'active',
    summary: 'Part of the human-feedback layer behind frontier models: I read what a model wrote, check whether it is actually right, and explain precisely where and why it falls short — feedback that goes straight back into training.',
    points: [
      'Evaluate LLM responses to coding and multi-step reasoning prompts against detailed rubrics — correctness, instruction-following, reasoning quality, code quality and honesty — and write the justification behind every score.',
      'Run the code instead of trusting it: reproduce model-written solutions, test edge cases and catch the failures that read well but break on execution — off-by-one logic, silent wrong outputs, hallucinated APIs.',
      'Compare responses side by side and rank them, separating "sounds confident" from "is correct" so preference data rewards real reasoning over fluent guessing.',
      'Write reference solutions and step-by-step rationales for problems models get wrong, turning each observed failure mode into structured, reusable training feedback.',
      'Design prompts that probe where models break — ambiguous specs, constraint-heavy tasks, multi-turn follow-ups — and document the recurring patterns for the team.',
    ],
    tags: ['LLM Evaluation', 'RLHF Feedback', 'Rubric Grading', 'Code Verification', 'Reasoning', 'Python'],
  },
  {
    role: 'Freelance AI Automation Developer',
    org: 'Upwork',
    period: 'Jun 2026 — Aug 2026',
    mode: 'Remote',
    status: 'shipped',
    points: [
      'Delivered a full-stack Python automation system for an international client, including a Streamlit dashboard, deployment package, README and video handover.',
      'Engineered a data ingestion pipeline using Google Drive API and Service Account authentication, syncing CSV, JSON and Google Sheets sources into the application.',
      'Built Gmail IMAP/SMTP integration to automatically process notification emails.',
      'Developed an FAQ matching engine using keyword scoring and sequence-similarity algorithms without an external ML dependency.',
    ],
    tags: ['Python', 'Streamlit', 'Google Drive API', 'Gmail IMAP/SMTP'],
  },
];

// `viz` picks the abstract SVG visual drawn for each project.
export const projects = [
  {
    id: '01',
    title: 'Smart Waste Management System',
    repo: 'https://github.com/aryaanjalii203/ML-Codes/blob/main/Smart_Waste_Management.ipynb',
    short: 'Smart Waste',
    domain: 'Computer Vision',
    viz: 'conv',
    year: '2025',
    stats: [
      { v: 'CNN', k: 'Architecture' },
      { v: 'VGG16 · ResNet', k: 'Fine-tuned backbones' },
      { v: 'Real-time', k: 'Inference' },
    ],
    tech: ['Deep Learning', 'CNN', 'Transfer Learning', 'VGG16', 'ResNet'],
    desc: 'Built an automated waste-classification pipeline using transfer learning on pre-trained VGG16/ResNet CNNs, with custom augmentation and normalization and fine-tuned convolutional layers for real-time inference.',
  },
  {
    id: '02',
    title: 'Facial Emotion Detection System',
    repo: 'https://github.com/aryaanjalii203/Facial-Emotion-Detection',
    short: 'Emotion',
    domain: 'Deep Learning',
    viz: 'face',
    year: '2024',
    stats: [
      { v: 'Face → emotion', k: 'End-to-end pipeline' },
      { v: 'FER-2013', k: 'Dataset' },
      { v: 'P / R / F1', k: 'Evaluation' },
    ],
    tech: ['TensorFlow', 'Keras', 'OpenCV', 'CNN', 'FER-2013'],
    desc: 'Developed a deep-learning facial emotion-recognition model with a custom preprocessing and augmentation pipeline, evaluated using precision, recall and F1-score.',
  },
  {
    id: '03',
    title: 'Movie Recommendation System',
    repo: 'https://github.com/aryaanjalii203/MovieRecommendationSystem-KNN',
    short: 'Recommender',
    domain: 'Recommendation',
    viz: 'knn',
    year: '2024',
    stats: [
      { v: 'KNN', k: 'Similarity search' },
      { v: 'User × item', k: 'Interaction matrix' },
      { v: 'Top-N', k: 'Personalised picks' },
    ],
    tech: ['Python', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'KNN'],
    desc: 'Built a personalized recommendation engine using K-Nearest Neighbors collaborative filtering over user-item interaction data, with an efficient similarity-measurement pipeline that turns viewing history into ranked, personalised suggestions.',
  },
  {
    id: '04',
    title: 'AI Automation System',
    repo: 'https://github.com/aryaanjalii203/UpworkAutomation',
    short: 'Automation',
    domain: 'Pipelines',
    viz: 'flow',
    year: '2026',
    stats: [
      { v: 'Paid', k: 'Intl. client' },
      { v: 'Drive + Gmail', k: 'Live integrations' },
      { v: 'Live', k: 'Handed over' },
    ],
    tech: ['Python', 'Streamlit', 'Google Drive API', 'Gmail IMAP/SMTP', 'Similarity Matching'],
    desc: 'Built a production-ready automation workflow combining real-time data ingestion, external APIs, automated email handling and FAQ matching.',
  },
];

// Front-end / web builds — shown in their own section, separate from the AI/ML work.
export const frontend = [
  {
    id: 'W1',
    title: 'PlayForge Arena',
    kind: 'Multiplayer platform',
    year: '2026',
    repo: 'https://github.com/aryaanjalii203/PlayForgeArena',
    live: 'https://playforge-arena.vercel.app/',
    desc: 'A browser-based gaming arena with 15 playable arcade games, authoritative 60Hz multiplayer physics on a Node server, theater mode and a full auth flow. Responsive controls for both desktop and touch.',
    stats: [
      { v: '15', k: 'Games' },
      { v: '60Hz', k: 'Physics tick' },
      { v: '1v1 / Co-op', k: 'Modes' },
    ],
    tech: ['React', 'Vite', 'Node.js', 'WebSockets', 'Canvas', 'Game Loop', 'Auth'],
    theme: 'arena',
  },
  {
    id: 'W2',
    title: 'Ember & Oak',
    kind: 'Coffee roaster landing page',
    year: '2026',
    repo: 'https://github.com/aryaanjalii203/CoffeeCafe',
    live: 'https://coffee-cafe-ecru.vercel.app',
    desc: 'A single-page site for a fictional single-origin roastery — custom bean cursor, animated loader, film grain, an ambient canvas layer and a day/night theme, all hand-written in one file with no framework.',
    stats: [
      { v: '0 deps', k: 'Framework-free' },
      { v: '1 file', k: 'Hand-written' },
      { v: 'Live', k: 'Deployed' },
    ],
    tech: ['HTML', 'CSS', 'JavaScript', 'Canvas', 'Custom Cursor', 'Scroll Animation', 'Dark Mode'],
    theme: 'cafe',
  },
  {
    id: 'W3',
    title: "Arya's Belmond",
    kind: 'E-commerce storefront',
    year: '2025',
    repo: 'https://github.com/aryaanjalii203/AryasBelmond',
    live: 'https://aryas-belmond.vercel.app',
    desc: 'Storefront for my own handcrafted beaded-bag label — a filterable catalogue, search, cart, founder story, reviews and a WhatsApp / Instagram checkout for made-to-order pieces.',
    stats: [
      { v: '6', k: 'Categories' },
      { v: 'WhatsApp', k: 'Checkout' },
      { v: 'Live', k: 'Deployed' },
    ],
    tech: ['HTML', 'CSS', 'JavaScript', 'Product Filters', 'Cart', 'Search', 'Responsive'],
    theme: 'shop',
  },
  {
    id: 'W4',
    title: 'BridgeUp',
    kind: 'Campus social platform',
    year: '2026',
    status: 'In progress',
    repo: '', // no public source yet
    live: 'https://bridgeup-two.vercel.app/',
    desc: 'A real-time availability app that helps university students meet up on the spur of the moment — share when you are free and what you are into, see who overlaps, and join live coffee, study, meal or walk groups from a campus pulse feed.',
    stats: [
      { v: 'Real-time', k: 'Availability matching' },
      { v: 'Live', k: 'Campus pulse feed' },
      { v: 'Beta', k: 'Work in progress' },
    ],
    tech: ['React', 'v0 (AI-assisted UI)', 'Mobile-first', 'Real-time UI', 'Vercel'],
    theme: 'social',
  },
];

export const stack = [
  {
    code: 'ML',
    name: 'AI & Machine Learning',
    items: ['PyTorch', 'TensorFlow', 'Keras', 'Scikit-learn', 'CNNs', 'Transfer Learning', 'VGG16', 'ResNet', 'Computer Vision', 'OpenCV', 'NLP', 'Recommendation Systems', 'Model Evaluation'],
  },
  {
    code: 'LLM',
    name: 'LLM & Generative AI',
    items: ['Prompt Engineering', 'LLM Output Evaluation', 'LangChain', 'Retrieval', 'Similarity Matching'],
  },
  {
    code: 'DATA',
    name: 'Data & Pipelines',
    items: ['Pandas', 'NumPy', 'ETL Workflows', 'REST APIs', 'Google Drive API', 'Gmail IMAP/SMTP', 'Data Preprocessing', 'Data Cleaning'],
  },
  {
    code: 'WEB',
    name: 'Frontend Engineering',
    items: ['React', 'Vite', 'JavaScript (ES6+)', 'HTML5', 'CSS3', 'Responsive Design', 'Canvas API', 'Scroll & Motion Design', 'Component Architecture', 'Accessibility'],
  },
  {
    code: 'FULL',
    name: 'Full-stack & Delivery',
    items: ['Node.js', 'WebSockets', 'Real-time Multiplayer Sync', 'REST APIs', 'Authentication', 'E-commerce Flows', 'Vercel', 'Git Workflows', 'Production Deploys'],
  },
  {
    code: 'LANG',
    name: 'Languages & Databases',
    items: ['Python', 'Java', 'C', 'C++', 'Kotlin', 'SQL', 'MySQL'],
  },
  {
    code: 'TOOLS',
    name: 'Tools',
    items: ['Git', 'GitHub', 'Streamlit', 'Vercel', 'VS Code', 'Google Colab', 'Android Studio'],
  },
];

// four thin ticker lines: AI/ML runs one way, web / full-stack the other
export const marquee = ['PyTorch', 'TensorFlow', 'Computer Vision', 'LLM Evaluation', 'Prompt Engineering', 'Transfer Learning'];
export const marquee2 = ['Data Pipelines', 'Scikit-learn', 'OpenCV', 'LangChain', 'NLP', 'Model Evaluation'];
export const marqueeWeb = ['React', 'JavaScript', 'Node.js', 'WebSockets', 'REST APIs', 'Responsive UI'];
export const marqueeWeb2 = ['Full-stack', 'Vite', 'Canvas', 'Authentication', 'Vercel', 'HTML / CSS'];

export const education = {
  degree: 'B.Tech',
  field: 'Computer Science & Engineering',
  school: 'Lovely Professional University',
  place: 'Punjab, India',
  from: 2022,
  to: 2026,
};

export const certifications = [
  { name: 'Cloud Computing', issuer: 'NPTEL' },
  { name: 'Python, Data Science & Machine Learning', issuer: 'CipherSchools' },
  { name: 'Introduction to TensorFlow for AI, ML & Deep Learning', issuer: 'DeepLearning.AI · Coursera' },
  { name: 'Generative AI with Large Language Models', issuer: 'DeepLearning.AI · AWS' },
  { name: 'Introduction to Containers w/ Docker, Kubernetes & OpenShift', issuer: 'IBM' },
  { name: 'Continuous Integration and Continuous Delivery (CI/CD)', issuer: 'IBM' },
];

export const principles = {
  quote: 'Treat system design and clean code as a discipline of mindfulness. Precision in your craft turns ordinary implementation into resilient engineering.',
  points: [
    { t: 'Measure before you believe.', d: 'A model is only as good as the test it survives. Evaluation sets, error analysis and honest metrics come before any claim.' },
    { t: 'Data is the real codebase.', d: 'Most of my best results came from cleaning, augmenting and understanding the data, not from reaching for a bigger architecture.' },
    { t: 'Read the failure, not just the score.', d: 'Grading LLMs taught me that why a response fails matters more than the number it gets. That is where useful feedback comes from.' },
    { t: 'Ship the whole thing.', d: 'A model in a notebook helps no one. Dashboards, pipelines, deploys and handover docs are part of the work, not an afterthought.' },
  ],
};
