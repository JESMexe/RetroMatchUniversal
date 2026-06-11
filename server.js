const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const SKILL_KEYWORDS = [
  'Python', 'PHP', 'C#', '.NET', 'SQL', 'PL/SQL', 'Oracle', 
  'HTML', 'CSS', 'JavaScript', 'JS', 'Git', 'Linux', 'C++', 'C', 'Java', 'REST', 'APIs',
  
  'Figma', 'Framer', 'Blender', 'Photoshop', 'Illustrator', 'Canva', 'UX', 'UI', 'Motion', 'DaVinci',
  
  'Excel', 'Word', 'PowerPoint', 'Office', 'Contabilidad', 'Facturación', 'Administración', 'Administrativo', 'Cobros',
  
  'Marketing', 'SEO', 'Redes Sociales', 'Social Media', 'Content', 'Publicidad',
  
  'English', 'Inglés', 'Redacción', 'Escritura', 'Traducción', 'Copywriter', 'Spanish', 'Español'
];

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
      const regex = new RegExp(`(?<![\\p{L}\\p{N}])${escaped.toLowerCase()}(?![\\p{L}\\p{N}])`, 'ui');
      hasMatch = regex.test(lowerText);
    }
    
    if (hasMatch) {
      foundSkills.add(keyword);
    }
  });
  
  return Array.from(foundSkills);
}

app.get('/api/jobs', async (req, res) => {
  const query = (req.query.q || '').trim();
  console.log(`[RMT-OS UNIV] Scan request received. Query: "${query}"`);

  let allJobs = [];

  const searchQuery = query || 'tecnologia';
  console.log(`[RMT-OS UNIV] Fetching live jobs from Computrabajo for "${searchQuery}"...`);
  
  const scrapedJobs = [];
  try {
    const urls = [
      `https://ar.computrabajo.com/ofertas-de-trabajo/?q=${encodeURIComponent(searchQuery)}`,
      `https://ar.computrabajo.com/ofertas-de-trabajo/?q=${encodeURIComponent(searchQuery)}&p=2`
    ];

    const fetchPromises = urls.map(url =>
      fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
        }
      }).then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
    );

    const htmls = await Promise.all(fetchPromises);

    htmls.forEach((html, pageIdx) => {
      const $ = cheerio.load(html);
      
      $('article.box_offer').each((idx, element) => {
        const dataId = $(element).attr('data-id') || `ct-${pageIdx}-${idx}-${Date.now()}`;
        
        const titleLink = $(element).find('h2.fs18.fwB.prB a.js-o-link, h2 a.js-o-link');
        const title = titleLink.text().trim();
        if (!title) return;

        let href = titleLink.attr('href') || '';
        if (href && href.startsWith('/')) {
          href = `https://ar.computrabajo.com${href}`;
        }
        
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
        
        const location = $(element).find('p.fs16.fc_base.mt5:not(.dFlex)').text().trim() || 'Argentina';
        
        let workMode = 'Presencial';
        let salary = 'A convenir';
        
        $(element).find('div.fs13.mt15 span.dIB, span.dIB').each((i, el) => {
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
        
        let experience = 'Junior / Mid';
        const titleLower = title.toLowerCase();
        if (titleLower.includes('senior') || titleLower.includes('sr') || titleLower.includes('lead') || titleLower.includes('ssr') || titleLower.includes('semi senior') || titleLower.includes('semisenior') || titleLower.includes('pleno')) {
          experience = 'Senior';
        } else if (titleLower.includes('junior') || titleLower.includes('jr') || titleLower.includes('trainee') || titleLower.includes('auxiliar') || titleLower.includes('practicante')) {
          experience = 'Junior';
        }
        
        const description = `Se busca ${title} para formar parte del equipo de ${company} en ${location}. Modalidad de trabajo: ${workMode}. Salario: ${salary}. Excelente oportunidad para profesionales que cuenten con habilidades técnicas y metodológicas acordes al perfil del puesto, promoviendo el crecimiento dentro de la organización.`;
        
        const skills = extractSkills(title + ' ' + description);
        
        let applyUrl = $(element).find('*[data-href-offer-apply]').attr('data-href-offer-apply') || href;
        if (applyUrl) {
          if (applyUrl.startsWith('/')) {
            applyUrl = `https://ar.computrabajo.com${applyUrl}`;
          }
          applyUrl = applyUrl.replace('/candidate/apply/', '/apply/').replace(/&amp;/g, '&');
        }
        
        scrapedJobs.push({
          id: `computrabajo-${dataId}`,
          title,
          company,
          location,
          salary,
          description,
          requirements: skills,
          experience,
          apply_url: applyUrl,
          job_url: href,
          source: 'Computrabajo'
        });
      });
    });
    
    console.log(`[RMT-OS UNIV] Successfully scraped ${scrapedJobs.length} live jobs from Computrabajo.`);
  } catch (error) {
    console.error('[RMT-OS UNIV] Error during Computrabajo scraping:', error.message);
  }

  allJobs = [...scrapedJobs];

  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    count: allJobs.length,
    jobs: allJobs
  });
});

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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`[SYSTEM] RetroMatch OS (v2.2.4 Universal Edition) Server Started.`);
  console.log(`[PORT]   Universal Port: http://localhost:${PORT}`);
  console.log(`=============================================================\n`);
});
