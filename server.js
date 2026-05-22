const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001; // Run on port 3001 to prevent conflicts

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Expanded skill keywords for a multi-industry universal matcher
const SKILL_KEYWORDS = [
  // 1. Tech & Engineering
  'Python', 'PHP', 'C#', '.NET', 'SQL', 'PL/SQL', 'Oracle', 
  'HTML', 'CSS', 'JavaScript', 'JS', 'Git', 'Linux', 'C++', 'C', 'Java', 'REST', 'APIs',
  
  // 2. Creative & Design
  'Figma', 'Framer', 'Blender', 'Photoshop', 'Illustrator', 'Canva', 'UX', 'UI', 'Motion', 'DaVinci',
  
  // 3. Administration & Business
  'Excel', 'Word', 'PowerPoint', 'Office', 'Contabilidad', 'Facturación', 'Administración', 'Administrativo', 'Cobros',
  
  // 4. Marketing & Communication
  'Marketing', 'SEO', 'Redes Sociales', 'Social Media', 'Content', 'Publicidad',
  
  // 5. Languages & Writing
  'English', 'Inglés', 'Redacción', 'Escritura', 'Traducción', 'Copywriter', 'Spanish', 'Español'
];

// Helper to extract matching tags from text
function extractSkills(text, tags = []) {
  const foundSkills = new Set();
  
  if (Array.isArray(tags)) {
    tags.forEach(tag => {
      const match = SKILL_KEYWORDS.find(k => k.toLowerCase() === tag.toLowerCase());
      if (match) foundSkills.add(match);
    });
  }
  
  if (!text) return Array.from(foundSkills);
  
  const lowerText = text.toLowerCase();
  
  SKILL_KEYWORDS.forEach(keyword => {
    const escaped = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    
    let hasMatch = false;
    if (keyword === 'C#') {
      hasMatch = lowerText.includes('c#');
    } else if (keyword === '.NET') {
      hasMatch = lowerText.includes('.net');
    } else if (keyword === 'PL/SQL') {
      hasMatch = lowerText.includes('pl/sql') || lowerText.includes('plsql');
    } else {
      const regex = new RegExp(`\\b${escaped.toLowerCase()}\\b`, 'i');
      hasMatch = regex.test(lowerText);
    }
    
    if (hasMatch) {
      foundSkills.add(keyword);
    }
  });
  
  return Array.from(foundSkills);
}

// API endpoint to search/fetch jobs
app.get('/api/jobs', async (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  console.log(`[RMT-OS UNIV] Scan request received. Query: "${query}"`);

  let allJobs = [];

  // 1. Read curated multi-industry local jobs DB
  try {
    const localData = fs.readFileSync(path.join(__dirname, 'jobs-feed.json'), 'utf8');
    const localJobs = JSON.parse(localData);
    allJobs = [...localJobs];
  } catch (error) {
    console.error('[RMT-OS UNIV] Error reading local jobs feed:', error.message);
  }

  // 2. Fetch live remote jobs from Remotive API
  try {
    console.log('[RMT-OS UNIV] Fetching live jobs from Remotive...');
    const remotiveUrl = 'https://remotive.com/api/remote-jobs?limit=30';
    const remotiveRes = await fetch(remotiveUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (RetroMatch OS Universal Edition)' }
    });
    
    if (remotiveRes.ok) {
      const data = await remotiveRes.json();
      if (data && Array.isArray(data.jobs)) {
        const parsedRemotive = data.jobs.map(job => {
          const skills = extractSkills(job.description, job.tags);
          return {
            id: `remotive-${job.id}`,
            title: job.title,
            company: job.company_name,
            location: job.candidate_required_location || 'Remote (Global)',
            salary: job.salary || 'A convenir',
            description: job.description.replace(/<[^>]*>?/gm, ' ').substring(0, 1000) + '...',
            requirements: skills.length > 0 ? skills : ['General Operations'],
            experience: 'Junior / Mid',
            apply_url: job.url,
            source: 'Remotive Live Feed'
          };
        });
        allJobs = [...allJobs, ...parsedRemotive];
        console.log(`[RMT-OS UNIV] Loaded ${parsedRemotive.length} live jobs from Remotive.`);
      }
    }
  } catch (error) {
    console.error('[RMT-OS UNIV] Error fetching from Remotive API:', error.message);
  }

  // 3. Fetch live remote jobs from Arbeitnow API
  try {
    console.log('[RMT-OS UNIV] Fetching live jobs from Arbeitnow...');
    const arbeitnowUrl = 'https://www.arbeitnow.com/api/job-board-api';
    const arbeitnowRes = await fetch(arbeitnowUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (RetroMatch OS Universal Edition)' }
    });

    if (arbeitnowRes.ok) {
      const data = await arbeitnowRes.json();
      if (data && Array.isArray(data.data)) {
        const parsedArbeitnow = data.data.slice(0, 20).map((job, idx) => {
          const skills = extractSkills(job.description, job.tags);
          return {
            id: `arbeitnow-${idx}-${Date.now()}`,
            title: job.title,
            company: job.company_name,
            location: job.location + (job.remote ? ' (Remote)' : ''),
            salary: 'A convenir',
            description: job.description.replace(/<[^>]*>?/gm, ' ').substring(0, 1000) + '...',
            requirements: skills.length > 0 ? skills : ['General Operations'],
            experience: 'Junior / Mid',
            apply_url: job.url,
            source: 'Arbeitnow Live Feed'
          };
        });
        allJobs = [...allJobs, ...parsedArbeitnow];
        console.log(`[RMT-OS UNIV] Loaded ${parsedArbeitnow.length} live jobs from Arbeitnow.`);
      }
    }
  } catch (error) {
    console.error('[RMT-OS UNIV] Error fetching from Arbeitnow API:', error.message);
  }

  // Filter jobs based on query if provided
  if (query) {
    allJobs = allJobs.filter(job => 
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query) ||
      job.requirements.some(reqSkill => reqSkill.toLowerCase().includes(query)) ||
      job.description.toLowerCase().includes(query)
    );
  }

  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    count: allJobs.length,
    jobs: allJobs
  });
});

// Serve the static frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`[SYSTEM] RetroMatch OS (v2.0.0 Universal Edition) Server Started.`);
  console.log(`[PORT]   Universal Port: http://localhost:${PORT}`);
  console.log(`=============================================================\n`);
});
