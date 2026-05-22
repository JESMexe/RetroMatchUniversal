const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const cheerio = require('cheerio');

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
  const query = (req.query.q || '').trim();
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

  // 2. Fetch live jobs from Computrabajo Argentina via Puppeteer Stealth
  let scrapedJobs = [];
  let browser = null;
  try {
    const searchQuery = query || 'tecnologia';
    console.log(`[RMT-OS UNIV] Launching Puppeteer Stealth to scrape Computrabajo for "${searchQuery}"...`);
    
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    
    // Set viewport & random user agent parameters to make sure it looks like a real browser
    await page.setViewport({ width: 1280, height: 800 });
    
    const searchUrl = `https://ar.computrabajo.com/ofertas-de-trabajo/?q=${encodeURIComponent(searchQuery)}`;
    console.log(`[RMT-OS UNIV] Navigating to: ${searchUrl}`);
    
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for the job listings container to appear on the page
    await page.waitForSelector('article.box_offer', { timeout: 15000 });
    
    const html = await page.content();
    const $ = cheerio.load(html);
    
    $('article.box_offer').each((idx, element) => {
      const dataId = $(element).attr('data-id') || `ct-${idx}-${Date.now()}`;
      
      const titleLink = $(element).find('h2.fs18.fwB.prB a.js-o-link');
      const title = titleLink.text().trim();
      let href = titleLink.attr('href') || '';
      if (href && href.startsWith('/')) {
        href = `https://ar.computrabajo.com${href}`;
      }
      
      // Parse company name
      let company = $(element).find('a[offer-grid-article-company-url]').text().trim();
      if (!company) {
        company = $(element).find('p.dFlex.vm_fx.fs16.fc_base.mt5 a.t_ellipsis').text().trim();
      }
      if (!company) {
        const fullParaText = $(element).find('p.dFlex.vm_fx.fs16.fc_base.mt5').text().trim();
        company = fullParaText.replace(/\d+,\d+/g, '').replace(/star/g, '').trim();
      }
      if (!company) {
        company = 'Confidencial';
      }
      
      // Parse location
      const location = $(element).find('p.fs16.fc_base.mt5:not(.dFlex)').text().trim() || 'Argentina';
      
      // Parse work mode and salary
      let workMode = 'Presencial';
      let salary = 'A convenir';
      
      $(element).find('div.fs13.mt15 span.dIB').each((i, el) => {
        const spanText = $(el).text().trim();
        const hasHomeIcon = $(el).find('.i_home').length > 0;
        const hasHygIcon = $(el).find('.i_home_office, .i_home_office_b').length > 0;
        
        if (spanText.includes('$')) {
          salary = spanText;
        } else if (hasHomeIcon || spanText.toLowerCase().includes('remoto')) {
          workMode = 'Remoto';
        } else if (hasHygIcon || spanText.toLowerCase().includes('remoto y presencial') || spanText.toLowerCase().includes('presencial y remoto') || spanText.toLowerCase().includes('hibrid') || spanText.toLowerCase().includes('híbrid')) {
          workMode = 'Híbrido';
        } else if (spanText.toLowerCase().includes('presencial')) {
          workMode = 'Presencial';
        }
      });
      
      // Classify experience level
      let experience = 'Junior / Mid';
      const titleLower = title.toLowerCase();
      if (titleLower.includes('senior') || titleLower.includes('sr') || titleLower.includes('lead') || titleLower.includes('ssr') || titleLower.includes('semi senior') || titleLower.includes('semisenior') || titleLower.includes('pleno')) {
        experience = 'Senior';
      } else if (titleLower.includes('junior') || titleLower.includes('jr') || titleLower.includes('trainee') || titleLower.includes('auxiliar') || titleLower.includes('practicante')) {
        experience = 'Junior';
      }
      
      // Synthesize overview summary (description)
      const description = `Se busca ${title} para formar parte del equipo de ${company} en ${location}. Modalidad de trabajo: ${workMode}. Salario: ${salary}. Excelente oportunidad para profesionales que cuenten con habilidades técnicas y metodológicas acordes al perfil del puesto, promoviendo el crecimiento dentro de la organización.`;
      
      // Extract requirements skills
      const skills = extractSkills(title + ' ' + description);
      
      scrapedJobs.push({
        id: `computrabajo-${dataId}`,
        title,
        company,
        location,
        salary,
        description,
        requirements: skills.length > 0 ? skills : ['General Operations'],
        experience,
        apply_url: href,
        source: 'Computrabajo'
      });
    });
    
    console.log(`[RMT-OS UNIV] Successfully scraped ${scrapedJobs.length} live jobs from Computrabajo.`);
  } catch (error) {
    console.error('[RMT-OS UNIV] Error during Computrabajo scraping:', error.message);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (err) {
        console.error('[RMT-OS UNIV] Error closing browser:', err.message);
      }
    }
  }

  // Combine jobs
  allJobs = [...allJobs, ...scrapedJobs];

  // Filter jobs based on query if provided (only needed for local jobs since scraped ones are already queried)
  if (query) {
    const lowerQuery = query.toLowerCase();
    allJobs = allJobs.filter(job => 
      job.title.toLowerCase().includes(lowerQuery) ||
      job.company.toLowerCase().includes(lowerQuery) ||
      job.location.toLowerCase().includes(lowerQuery) ||
      job.requirements.some(reqSkill => reqSkill.toLowerCase().includes(lowerQuery)) ||
      job.description.toLowerCase().includes(lowerQuery)
    );
  }

  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    count: allJobs.length,
    jobs: allJobs
  });
});

// Endpoint proxy para hacer scraping del link de postulación directa
app.get('/api/apply', async (req, res) => {
  const jobUrl = req.query.url;
  if (!jobUrl) return res.status(400).json({ error: 'Missing url' });

  try {
    res.json({ apply_url: jobUrl });
  } catch (error) {
    console.error("[RMT-OS Scraper Error]", error.message);
    res.json({ apply_url: jobUrl });
  }
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
