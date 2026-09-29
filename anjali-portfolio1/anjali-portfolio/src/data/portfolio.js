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
  linkedin: 'https://linkedin.com/in/anjalikumari',
  resume: '/Anjali-Kumari-Resume.pdf',
};

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
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
    org: 'Handshake AI',
    period: 'Nov 2025 — Present',
    mode: 'Remote',
    status: 'active',
    points: [
      'Evaluate LLM outputs against detailed technical rubrics across coding and reasoning domains, rating response quality and surfacing recurring failure patterns.',
      'Author reference solutions that improve model reasoning on coding tasks, turning observed failure modes into structured feedback for training pipelines.',
    ],
    tags: ['LLM Evaluation', 'Rubric Design', 'Coding', 'Reasoning'],
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
    short: 'Smart Waste',
    domain: 'Computer Vision',
    viz: 'conv',
    tech: ['Deep Learning', 'CNN', 'Transfer Learning', 'VGG16', 'ResNet'],
    desc: 'Built an automated waste-classification pipeline using transfer learning on pre-trained VGG16/ResNet CNNs, with custom augmentation and normalization and fine-tuned convolutional layers for real-time inference.',
  },
  {
    id: '02',
    title: 'Facial Emotion Detection System',
    short: 'Emotion',
    domain: 'Deep Learning',
    viz: 'face',
    tech: ['TensorFlow', 'Keras', 'OpenCV', 'CNN', 'FER-2013'],
    desc: 'Developed a deep-learning facial emotion-recognition model with a custom preprocessing and augmentation pipeline, evaluated using precision, recall and F1-score.',
  },
  {
    id: '03',
    title: 'Movie Recommendation System',
    short: 'Recommender',
    domain: 'Recommendation',
    viz: 'knn',
    metric: { v: '72%', k: 'Prediction accuracy' },
    tech: ['Python', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'KNN'],
    desc: 'Built a personalized recommendation engine using K-Nearest Neighbors collaborative filtering over user-item interaction data, achieving 72% prediction accuracy.',
  },
  {
    id: '04',
    title: 'AI Automation System',
    short: 'Automation',
    domain: 'Pipelines',
    viz: 'flow',
    tech: ['Python', 'Streamlit', 'Google Drive API', 'Gmail IMAP/SMTP', 'Similarity Matching'],
    desc: 'Built a production-ready automation workflow combining real-time data ingestion, external APIs, automated email handling and FAQ matching.',
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
    code: 'LANG',
    name: 'Languages & Databases',
    items: ['Python', 'Java', 'C', 'C++', 'Kotlin', 'SQL', 'MySQL'],
  },
  {
    code: 'TOOLS',
    name: 'Tools',
    items: ['Git', 'GitHub', 'Streamlit', 'VS Code', 'Google Colab', 'Android Studio'],
  },
];

export const marquee = ['PyTorch', 'TensorFlow', 'Computer Vision', 'LLM Evaluation', 'Prompt Engineering', 'Data Pipelines', 'Transfer Learning', 'Python', 'Streamlit', 'LangChain', 'Scikit-learn', 'OpenCV'];

export const education = {
  degree: 'B.Tech',
  field: 'Computer Science & Engineering',
  school: 'Lovely Professional University',
  place: 'Punjab, India',
  from: 2022,
  to: 2026,
  cgpa: '7.5',
};

export const hackathon = {
  name: 'Amazon HackOn',
  season: 'Season 6',
  role: 'Participant',
  date: 'June 2026',
  desc: 'Selected for a national-level hackathon on scalable backend and cloud systems; designed a low-latency architecture with efficient API routing and intent classification.',
  focus: ['Low latency', 'API routing', 'Intent classification'],
};

export const certifications = [
  { name: 'Introduction to TensorFlow for AI, ML & Deep Learning', issuer: 'Coursera' },
  { name: 'Generative AI & Prompt Engineering', issuer: 'Coursera' },
  { name: 'Getting Started with Git and GitHub', issuer: 'Coursera' },
  { name: 'Python, Data Science & Machine Learning', issuer: 'CipherSchools' },
  { name: 'Cloud Computing', issuer: 'NPTEL' },
];
