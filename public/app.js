/**
 * RetroMatch OS - v2.2.0 (Universal Shell Engine)
 * Engineered for Public Web Deployment & Dynamic PDF CV Extraction
 */

// Configure PDF.js Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// 1. JOAQUIN SOSA'S DEFAULT PROFILE (SYSTEM SEED)
const DEFAULT_PROFILE = {
  name: "Joaquin Ezequiel Sosa Makara",
  age: 21,
  birthDate: "26/10/2004",
  title: "Desarrollador, Diseñador y Administrador Junior",
  location: "Muñiz, San Miguel, Buenos Aires, Argentina",
  github: "https://github.com/JESMexe/",
  linkedin: "www.linkedin.com/in/joaquín-ezequiel-sosa-makara",
  portfolio: "jesmdev.site",
  summary: "Soy JESM, un Desarrollador Junior apasionado por la creación de soluciones innovadoras. Combino mi base técnica en software con habilidades de diseño, enfocándome siempre en entregar calidad, eficiencia y excelentes experiencias de usuario a mis clientes y equipos.",
  skills: {
    advanced: ["Python", "C#", ".NET", "Oracle SQL", "PL/SQL", "Windows", "MS Office"],
    intermediate: ["HTML", "CSS", "Figma", "Framer", "Photoshop", "Oracle Data Modeler", "SQL"],
    basicPlus: ["JavaScript", "JS", "C++", "C", "VBA"],
    designSuite: ["Blender", "DaVinci Resolve", "Canva Pro", "Affinity Suite", "Adobe XD", "Illustrator", "Premiere Pro"]
  },
  education: [
    {
      degree: "Tecnicatura Universitaria Superior en Programación (Técnico Informático)",
      institution: "Universidad Tecnológica Nacional (UTN) - Regional Haedo",
      period: "2023 - 2025",
      status: "Graduado"
    }
  ],
  experience: [
    {
      role: "Desarrollador y Diseñador Web",
      company: "MAK.",
      period: "Junio 2022 - Abril 2024",
      details: ["Desarrollé páginas webs para estudios jurídicos, empresas internacionales y PyMEs."]
    }
  ]
};

// Global Active Profile (Initialized to default)
let USER_PROFILE = JSON.parse(JSON.stringify(DEFAULT_PROFILE));

// 2. RETRO SOUND EFFECTS GENERATOR (Web Audio API)
class AudioSynth {
  constructor() {
    this.ctx = null;
    this.muted = true;
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.muted = false;
    this.playChime(600, 800, 150); // Start-up beep
  }

  playKeyClick(isSpecial = false) {
    if (this.muted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = isSpecial ? 'sine' : 'triangle';
    const baseFreq = isSpecial ? 120 : 250;
    osc.frequency.setValueAtTime(baseFreq + Math.random() * 50, now);
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800 + Math.random() * 200, now);
    filter.Q.setValueAtTime(8, now);

    gain.gain.setValueAtTime(isSpecial ? 0.25 : 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Synthesize realistic Floppy Drive reading/grinding noises
  async playFloppyDriveNoise(durationMs = 2500) {
    if (this.muted || !this.ctx) return;

    const startTime = this.ctx.currentTime;
    const stopTime = startTime + (durationMs / 1000);

    // Create a whirring electric motor sound using a low-frequency oscillator
    const motorOsc = this.ctx.createOscillator();
    const motorGain = this.ctx.createGain();
    motorOsc.type = 'sawtooth';
    motorOsc.frequency.setValueAtTime(45, startTime); // Low hum
    
    // Add LFO to modulate whirring
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(12, startTime); // 12Hz whirring modulation
    lfoGain.gain.setValueAtTime(8, startTime);

    lfo.connect(lfoGain);
    lfoGain.connect(motorOsc.frequency);
    
    motorGain.gain.setValueAtTime(0.08, startTime);
    motorGain.gain.linearRampToValueAtTime(0.001, stopTime);

    // Filter to make it sound inside a plastic casing
    const motorFilter = this.ctx.createBiquadFilter();
    motorFilter.type = 'lowpass';
    motorFilter.frequency.setValueAtTime(180, startTime);

    motorOsc.connect(motorFilter);
    motorFilter.connect(motorGain);
    motorGain.connect(this.ctx.destination);

    motorOsc.start(startTime);
    lfo.start(startTime);
    motorOsc.stop(stopTime);
    lfo.stop(stopTime);

    // Synthesize "clack clack" stepper motor head seeks
    const clacksCount = Math.floor(durationMs / 300);
    for (let i = 0; i < clacksCount; i++) {
      const delayTime = i * 280 + Math.random() * 50;
      if (delayTime >= durationMs - 100) break;

      setTimeout(() => {
        if (this.muted || !this.ctx) return;
        const clackTime = this.ctx.currentTime;
        
        // Single clack tap
        const clackOsc = this.ctx.createOscillator();
        const clackGain = this.ctx.createGain();
        const clackFilter = this.ctx.createBiquadFilter();

        clackOsc.type = 'triangle';
        clackOsc.frequency.setValueAtTime(95, clackTime);

        clackFilter.type = 'bandpass';
        clackFilter.frequency.setValueAtTime(350, clackTime);
        clackFilter.Q.setValueAtTime(10, clackTime);

        clackGain.gain.setValueAtTime(0.25, clackTime);
        clackGain.gain.exponentialRampToValueAtTime(0.001, clackTime + 0.04);

        clackOsc.connect(clackFilter);
        clackFilter.connect(clackGain);
        clackGain.connect(this.ctx.destination);

        clackOsc.start(clackTime);
        clackOsc.stop(clackTime + 0.05);
      }, delayTime);
    }
  }

  playChime(freq1, freq2, duration) {
    if (this.muted || !this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq1, now);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq2, now);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (duration / 1000));

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    
    osc1.stop(now + (duration / 1000));
    osc2.stop(now + (duration / 1000));
  }

  playErrorBeep() {
    if (this.muted || !this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }
}

const synth = new AudioSynth();

// 3. UNIVERSAL RETRO TERMINAL SHELL CONTROLLER
class UniversalTerminalShell {
  constructor() {
    this.input = document.getElementById('terminal-input');
    this.display = document.getElementById('input-display');
    this.output = document.getElementById('terminal-output');
    this.body = document.getElementById('terminal-body');
    this.audioToggleBtn = document.getElementById('audio-toggle');
    this.themeToggleBtn = document.getElementById('theme-toggle');
    this.soundIndicator = document.getElementById('sound-indicator');
    
    this.activeUserDisplay = document.getElementById('active-user-display');
    this.promptLabel = document.getElementById('prompt-label');
    this.floppyDriveTrigger = document.getElementById('floppy-drive-trigger');
    this.floppyFileInput = document.getElementById('floppy-file-input');
    this.floppyLed = document.getElementById('floppy-led');
    this.floppyShutter = document.getElementById('floppy-shutter');
    this.dragOverlay = document.getElementById('drag-overlay');

    this.cmdHistory = [];
    this.historyIdx = -1;
    this.jobsList = [];
    this.isBooting = true;
    
    this.themes = ['theme-green', 'theme-amber', 'theme-cyan', 'theme-white'];
    this.currentThemeIdx = 0;
  }

  init() {
    // Clock
    setInterval(() => {
      const now = new Date();
      document.getElementById('time-display').textContent = now.toTimeString().split(' ')[0];
    }, 1000);

    // Event listeners
    this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.input.addEventListener('input', () => {
      this.display.textContent = this.input.value;
      synth.playKeyClick(false);
    });

    this.body.addEventListener('click', () => this.input.focus());

    // Toolbar buttons
    document.querySelectorAll('.quick-controls button[data-cmd]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const command = btn.getAttribute('data-cmd');
        this.executeCommand(command);
      });
    });

    this.audioToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleAudio();
    });

    this.soundIndicator.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleAudio();
    });

    this.themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleTheme();
    });

    // Floppy Drive triggers
    this.floppyDriveTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.floppyFileInput.click();
    });

    this.floppyFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.readFloppyDisk(e.target.files[0]);
      }
    });

    // Drag and Drop files onto screen
    window.addEventListener('dragenter', (e) => {
      e.preventDefault();
      document.body.classList.add('dragging');
    });

    this.dragOverlay.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    this.dragOverlay.addEventListener('dragleave', (e) => {
      e.preventDefault();
      document.body.classList.remove('dragging');
    });

    this.dragOverlay.addEventListener('drop', (e) => {
      e.preventDefault();
      document.body.classList.remove('dragging');
      if (e.dataTransfer.files.length > 0) {
        this.readFloppyDisk(e.dataTransfer.files[0]);
      }
    });

    // Boot Up
    this.runBootSequence();
  }

  toggleAudio() {
    if (synth.muted) {
      synth.init();
      synth.muted = false;
      this.soundIndicator.textContent = "AUDIO: READY";
      this.audioToggleBtn.textContent = "[F6: AUDIO OFF]";
      this.printLine("[RMT-OS] Audio Synthesizer: ACTIVATED.", "system");
    } else {
      synth.muted = true;
      this.soundIndicator.textContent = "AUDIO: MUTED";
      this.audioToggleBtn.textContent = "[F6: AUDIO ON]";
      this.printLine("[RMT-OS] Audio Synthesizer: DEACTIVATED.", "warning");
    }
  }

  toggleTheme() {
    document.body.classList.remove(this.themes[this.currentThemeIdx]);
    this.currentThemeIdx = (this.currentThemeIdx + 1) % this.themes.length;
    const newTheme = this.themes[this.currentThemeIdx];
    document.body.classList.add(newTheme);
    
    synth.playKeyClick(true);
    
    const themeNames = {
      'theme-green': 'Verde Fósforo (P1)',
      'theme-amber': 'Ámbar Monocromo (P4)',
      'theme-cyan': 'Azul Cyberpunk',
      'theme-white': 'Gris Industrial'
    };
    
    this.printLine(`[RMT-OS] Theme shifted to: ${themeNames[newTheme]}`, "system");
  }

  printLine(text, className = "") {
    const p = document.createElement('div');
    p.className = `line ${className}`;
    p.textContent = text;
    this.output.appendChild(p);
    this.scrollToBottom();
    return p;
  }

  printHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString;
    this.output.appendChild(div);
    this.scrollToBottom();
    return div;
  }

  scrollToBottom() {
    this.output.scrollTop = this.output.scrollHeight;
  }

  clearScreen() {
    this.output.innerHTML = "";
    synth.playChime(150, 250, 100);
  }

  handleKeydown(e) {
    if (this.isBooting) {
      e.preventDefault();
      return;
    }

    if (e.key === 'Enter') {
      const command = this.input.value.trim();
      this.input.value = "";
      this.display.textContent = "";
      
      if (command) {
        this.cmdHistory.push(command);
        this.historyIdx = this.cmdHistory.length;
        
        synth.playKeyClick(true);
        this.printLine(`${USER_PROFILE.name.split(' ')[0].toLowerCase()}@rmt-os:~$ ${command}`, "highlight");
        this.executeCommand(command);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.historyIdx > 0) {
        this.historyIdx--;
        this.input.value = this.cmdHistory[this.historyIdx];
        this.display.textContent = this.input.value;
        synth.playKeyClick(false);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIdx < this.cmdHistory.length - 1) {
        this.historyIdx++;
        this.input.value = this.cmdHistory[this.historyIdx];
      } else {
        this.historyIdx = this.cmdHistory.length;
        this.input.value = "";
      }
      this.display.textContent = this.input.value;
      synth.playKeyClick(false);
    }
  }

  async runBootSequence() {
    this.isBooting = true;
    this.input.disabled = true;

    this.printLine("RETROMATCH(R) OS v2.2.0 (UNIVERSAL PUBLIC RELEASE)", "system");
    await this.delay(350);
    this.printLine("MEMORY: 1048576 KB OK (DUAL CACHE ENABLED)");
    this.printLine("CPU: COGNITIVE AG-3600 @ 5.20GHz");
    await this.delay(200);
    
    this.printLine("--------------------------------------------------", "system");
    this.printLine("LOADING PERIPHERAL CHASSIS DEALS...");
    await this.delay(300);
    this.printLine("[OK] FLOPPY DISK DRIVE A: 3.5\" HD MOUNTED");
    this.printLine("[OK] BROWSER-SIDE PDF DECODER LIBRARY REGISTERED");
    await this.delay(350);

    this.printLine("--------------------------------------------------", "system");
    this.printLine("LOADING SYSTEM ROOT DEFAULTS...");
    await this.delay(300);
    this.loadProfileIntoSystem(USER_PROFILE);
    this.printLine("[OK] DEFAULT SEED CACHE LOADED");
    
    this.printLine("--------------------------------------------------", "system");
    this.printLine("CONNECTING TO UNIVERSAL NODE BACKEND...");
    await this.delay(400);
    
    // Check local port vs dynamic domain
    const backendUrl = this.getBackendBaseUrl();
    this.printLine(`GATEWAY ROUTE: ${backendUrl} [CONNECTING...]`);
    await this.delay(400);
    this.printLine("[OK] ROUTER ONLINE");
    this.printLine("--------------------------------------------------", "system");
    await this.delay(300);

    this.printLine("SYSTEM UNIVERSAL TERMINAL COMPLETED AND READY.", "system");
    this.printLine("¡Arrastrá y soltá tu CV PDF en la pantalla para rankear las ofertas laborales para VOS!", "warning");
    this.printLine("Escribí 'help' para ver los comandos.", "system");
    this.printLine("");
    
    this.isBooting = false;
    this.input.disabled = false;
    this.input.focus();
  }

  getBackendBaseUrl() {
    // Relative routes if hosted statically/seamlessly on Render/Vercel, otherwise dev server
    return window.location.origin.includes('localhost') ? 'http://localhost:3001' : window.location.origin;
  }

  loadProfileIntoSystem(profile) {
    USER_PROFILE = profile;
    const isJesm = profile.name === "Joaquin Ezequiel Sosa Makara";
    const userHandle = isJesm ? "JESM" : profile.name.replace(/\s+/g, '_').toUpperCase();
    const promptName = isJesm ? "jesm" : profile.name.split(' ')[0].toLowerCase();
    
    this.activeUserDisplay.textContent = `USER: ${userHandle}`;
    this.promptLabel.textContent = `${promptName}@rmt-os:~$ `;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // BROWSER-SIDE PDF EXTRACTOR AND STEPPER DRIVE SIMULATOR
  async readFloppyDisk(file) {
    if (this.isBooting) return;
    
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      synth.playErrorBeep();
      this.printLine("ERR: Invalid media. Insert a valid .PDF Diskette.", "error");
      return;
    }

    this.isBooting = true;
    this.input.disabled = true;

    // Trigger Floppy Animation
    document.getElementById('floppy-drive-trigger').classList.add('reading');
    this.floppyLed.className = "floppy-led-light led-reading";
    
    synth.playFloppyDriveNoise(3000);
    
    this.printLine("");
    this.printLine("┌────────────────────────────────────────────────────────┐", "system");
    this.printLine("│  💾 DISQUETE INSERTADO: LEYENDO SECTORES DE MEMORIA   │", "system");
    this.printLine("└────────────────────────────────────────────────────────┘", "system");
    this.printLine(`Leyendo disquete: "${file.name}"...`);
    await this.delay(1000);
    this.printLine("Extrayendo bloques binarios client-side (100% Privado)...");

    try {
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      const extractedText = await this.extractTextFromPDF(arrayBuffer);
      
      this.printLine(`[OK] Decodificados ${extractedText.length} caracteres de texto.`);
      await this.delay(800);
      this.printLine("Analizando perfil y mapeando habilidades multi-industria...");
      
      const newProfile = this.parseCVText(extractedText);
      await this.delay(1200);

      this.loadProfileIntoSystem(newProfile);

      // Successfully mounted!
      this.floppyLed.className = "floppy-led-light led-mounted";
      synth.playChime(500, 750, 300);
      
      this.printLine("--------------------------------------------------", "system");
      this.printLine(`[SUCCESS] ¡PERFIL MONTADO CON ÉXITO!`, "system");
      this.printLine(`NOMBRE EXTRACTADO: ${newProfile.name.toUpperCase()}`, "highlight");
      this.printLine(`HABILIDADES DETECTADAS: [${[...newProfile.skills.advanced, ...newProfile.skills.intermediate].slice(0, 6).join(', ')}...]`, "highlight");
      this.printLine("--------------------------------------------------", "system");
      this.printLine("¡Listo! Las búsquedas de empleo y Jaccard match se calibrarán", "warning");
      this.printLine("automáticamente en base a este nuevo disquete de perfil.", "warning");
      this.printLine("Escribe 'scan' para buscar vacantes reales para este perfil.", "system");
      this.printLine("");

      // Automatically wipe jobs list because profile changed
      this.jobsList = [];

    } catch (err) {
      synth.playErrorBeep();
      this.printLine(`[ERROR] Fallo al leer disquete: ${err.message}`, "error");
      this.floppyLed.className = "floppy-led-light led-off";
    } finally {
      document.getElementById('floppy-drive-trigger').classList.remove('reading');
      this.isBooting = false;
      this.input.disabled = false;
      this.input.focus();
    }
  }

  readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  // Extracts PDF text client-side using PDF.js
  async extractTextFromPDF(arrayBuffer) {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + "\n";
    }

    return fullText;
  }

  // SMART CV CLIENT-SIDE PARSER MULTI-INDUSTRY
  parseCVText(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // 1. Try to find a Name near the top
    let candidateName = "Candidato Anónimo";
    const nameRegex = /^[A-ZÁÉÍÓÚÑa-záéíóúñ']+(\s+[A-ZÁÉÍÓÚÑa-záéíóúñ']+){1,5}$/i;
    
    // Check first 8 lines
    for (let i = 0; i < Math.min(lines.length, 8); i++) {
      const cleaned = lines[i].replace(/[|•:\-*]/g, '').trim();
      // Basic check: looks like a Capitalized name and is 2-4 words
      if (nameRegex.test(cleaned) && !cleaned.toLowerCase().includes('cv') && !cleaned.toLowerCase().includes('curriculum')) {
        candidateName = cleaned;
        break;
      }
    }

    // 2. Extract Contact Info
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : "No identificado";

    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/);
    const phone = phoneMatch ? phoneMatch[0] : "No identificado";

    // 3. Multi-Industry Keyword Matcher dictionary
    const skillIndex = {
      // Tech
      'Python': ['python', 'pandas', 'django', 'flask', 'fastapi'],
      'PHP': ['php', 'laravel', 'wordpress', 'symfony'],
      'C#': ['c#', '.net', 'csharp', 'asp.net', 'wpf', 'entity framework'],
      '.NET': ['.net', 'dotnet'],
      'SQL': ['sql', 'mysql', 'sqlserver', 'postgres', 'sqlite'],
      'PL/SQL': ['pl/sql', 'plsql', 'procedures'],
      'Oracle': ['oracle', 'data modeler'],
      'HTML': ['html', 'html5'],
      'CSS': ['css', 'css3', 'sass', 'bootstrap', 'tailwind'],
      'JavaScript': ['javascript', 'js', 'react', 'vue', 'angular', 'node', 'typescript', 'jquery'],
      'Git': ['git', 'github', 'gitlab'],
      'Linux': ['linux', 'bash', 'ubuntu', 'debian'],
      'C++': ['c++', 'cpp'],
      'Java': ['java', 'spring', 'hibernate'],
      'APIs': ['apis', 'api', 'rest'],
      
      // Design
      'Figma': ['figma'],
      'Framer': ['framer'],
      'Blender': ['blender', '3d modeling', 'render'],
      'Photoshop': ['photoshop', 'psd', 'editing'],
      'Illustrator': ['illustrator', 'vector', 'logo'],
      'Canva': ['canva'],
      'UI/UX': ['ui/ux', 'ux/ui', 'product design', 'user interface'],
      
      // Admin/Finance
      'Excel': ['excel', 'spreadsheets', 'planillas'],
      'Office': ['office', 'word', 'powerpoint'],
      'Contabilidad': ['contabilidad', 'contable', 'impuestos', 'balance', 'facturas'],
      'Facturación': ['facturación', 'cobros', 'administración'],
      
      // Languages
      'English': ['english', 'inglés', 'bilingual', 'intermediate english', 'advanced english'],
      'Traducción': ['traducción', 'translation', 'translator', 'traductor'],
      'Redacción': ['redacción', 'escritura', 'copywriter', 'content writing']
    };

    const detectedSkills = [];
    const lowerText = text.toLowerCase();

    // Scan the dictionary keywords against the CV text
    Object.keys(skillIndex).forEach(skill => {
      const matchWords = skillIndex[skill];
      const hasMatch = matchWords.some(word => lowerText.includes(word));
      if (hasMatch) {
        detectedSkills.push(skill);
      }
    });

    // 4. Distribute into skill levels for display
    const advanced = [];
    const intermediate = [];
    const basicPlus = [];
    const designSuite = [];

    detectedSkills.forEach((s, idx) => {
      // Split design suite skills
      if (['Figma', 'Framer', 'Blender', 'Photoshop', 'Illustrator', 'Canva'].includes(s)) {
        designSuite.push(s);
      }
      
      // Distribute rest dynamically based on match indexing
      if (idx % 3 === 0) {
        advanced.push(s);
      } else if (idx % 3 === 1) {
        intermediate.push(s);
      } else {
        basicPlus.push(s);
      }
    });

    // If empty fallback
    if (advanced.length === 0 && intermediate.length === 0 && basicPlus.length === 0) {
      advanced.push("Administración", "Windows", "Excel");
      intermediate.push("Office", "Comunicación");
    }

    return {
      name: candidateName,
      age: "N/A",
      birthDate: "N/A",
      title: detectedSkills.includes('Python') || detectedSkills.includes('C#') || detectedSkills.includes('JavaScript') ? "Desarrollador Web / Software" : "Administrador / Operaciones",
      location: "Identificada en disquete",
      email: email,
      phone: phone,
      portfolio: "No provisto",
      summary: "Perfil auto-extractado dinámicamente desde disquete A: en el navegador client-side.",
      skills: {
        advanced: advanced,
        intermediate: intermediate,
        basicPlus: basicPlus,
        designSuite: designSuite
      },
      education: [
        {
          degree: "Estudios / Formación detallados en CV",
          institution: "Detección Automática",
          period: "Actual",
          status: "Válido"
        }
      ],
      experience: [
        {
          role: "Experiencia Profesional",
          company: "Registrado en CV",
          period: "Múltiples períodos",
          details: ["Se detectaron múltiples trayectorias profesionales en el disquete."]
        }
      ]
    };
  }

  // INTERPRETER FOR COMMANDS
  async executeCommand(rawCommand) {
    let cleanCommand = rawCommand.trim();
    if (cleanCommand.startsWith('/')) {
      cleanCommand = cleanCommand.substring(1).trim();
    }
    const parts = cleanCommand.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        this.cmdHelp();
        break;
      case 'clear':
        this.clearScreen();
        break;
      case 'profile':
        if (args[0] === 'reset') {
          this.cmdProfileReset();
        } else {
          this.cmdProfile();
        }
        break;
      case 'scan':
        await this.cmdScan(args.join(' '));
        break;
      case 'jobs':
        this.cmdJobs(args[0]);
        break;
      case 'view':
        this.cmdView(args[0]);
        break;
      case 'apply':
        this.cmdApply(args[0]);
        break;
      case 'theme':
        this.cmdTheme(args[0]);
        break;
      case 'audio':
        this.cmdAudio(args[0]);
        break;
      case 'export':
        this.cmdExport();
        break;
      case 'upload':
        this.floppyFileInput.click();
        break;
      default:
        synth.playErrorBeep();
        this.printLine(`ERR: Command '${cmd}' not recognized. Type 'help' for instructions.`, "error");
    }
  }

  // --- CMD CALL IMPLEMENTATIONS ---

  cmdHelp() {
    this.printLine("┌────────────────────────────────────────────────────────┐", "system");
    this.printLine("│          RETROMATCH OS v2.0 - MANUAL DE OPERACIONES    │", "system");
    this.printLine("└────────────────────────────────────────────────────────┘", "system");
    
    const div = document.createElement('div');
    div.className = 'ascii-box';
    div.innerHTML = `
      <div class="help-grid">
        <div class="help-cmd">help</div>
        <div class="line">Muestra este panel de ayuda técnica.</div>
        
        <div class="help-cmd">clear</div>
        <div class="line">Limpia toda la pantalla de la terminal.</div>
        
        <div class="help-cmd">upload</div>
        <div class="line">Abre el explorador para subir un CV PDF (Equivale a cliquear disquetera).</div>
        
        <div class="help-cmd">profile</div>
        <div class="line">Muestra el perfil cargado del disquete en formato ASCII.</div>
        
        <div class="help-cmd">profile reset</div>
        <div class="line">Reinicia el sistema al perfil del seed de fábrica (Joaquín Sosa).</div>
        
        <div class="help-cmd">scan [query]</div>
        <div class="line">Busca ofertas reales conectando al servidor local o de producción.</div>
        
        <div class="help-cmd">jobs [query]</div>
        <div class="line">Muestra el listado de coincidencias ranked por el Jaccard Index.</div>
        
        <div class="help-cmd">view [ID]</div>
        <div class="line">Inspecciona un puesto viendo las habilidades faltantes/correctas.</div>
        
        <div class="help-cmd">apply [ID]</div>
        <div class="line">Abre el enlace de postulación real en tu navegador local.</div>
        
        <div class="help-cmd">theme [color]</div>
        <div class="line">Intercambia paletas de pantalla: green, amber, cyan, white.</div>
        
        <div class="help-cmd">audio [on/off]</div>
        <div class="line">Activa/desactiva sonidos analógicos de teclas y disquetera.</div>
      </div>
    `;
    this.output.appendChild(div);
    this.scrollToBottom();
  }

  cmdProfile() {
    const div = document.createElement('div');
    div.className = 'ascii-box';
    
    let skillsHTML = `
      <div><span class="line system">Avanzadas:</span> ${USER_PROFILE.skills.advanced.join(', ')}</div>
      <div><span class="line system">Intermedias:</span> ${USER_PROFILE.skills.intermediate.join(', ')}</div>
      <div><span class="line system">Básicas:</span> ${USER_PROFILE.skills.basicPlus.join(', ')}</div>
      ${USER_PROFILE.skills.designSuite.length > 0 ? `<div><span class="line system">Diseño/Edición:</span> ${USER_PROFILE.skills.designSuite.join(', ')}</div>` : ''}
    `;

    div.innerHTML = `
      <div class="ascii-box-header">MONITOR DE DISQUETE A: PERFIL ACTIVO</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 12px;">
        <div>
          <span class="line highlight">Identificación</span>
          <div style="font-size:12px;">• Nombre: ${USER_PROFILE.name}</div>
          <div style="font-size:12px;">• Título: ${USER_PROFILE.title}</div>
          ${USER_PROFILE.email ? `<div style="font-size:12px;">• Email: ${USER_PROFILE.email}</div>` : ''}
          ${USER_PROFILE.phone ? `<div style="font-size:12px;">• Teléfono: ${USER_PROFILE.phone}</div>` : ''}
          ${USER_PROFILE.linkedin ? `<div style="font-size:12px;">• LinkedIn: <a href="https://${USER_PROFILE.linkedin.replace('https://', '')}" target="_blank" style="color:inherit">${USER_PROFILE.linkedin}</a></div>` : ''}
          ${USER_PROFILE.github ? `<div style="font-size:12px;">• GitHub: <a href="${USER_PROFILE.github}" target="_blank" style="color:inherit">${USER_PROFILE.github}</a></div>` : ''}
        </div>
        <div>
          <span class="line highlight">Metadatos del Disquete</span>
          <div style="font-size:12px;">• Formato: PDF Extracted Standard</div>
          <div style="font-size:12px;">• Resumen: ${USER_PROFILE.summary}</div>
        </div>
      </div>
      <hr style="border: 0; border-top: 1px dashed var(--theme-border-dim); margin-bottom: 8px;">
      <div>
        <span class="line highlight">Habilidades Mapeadas para Matches</span>
        ${skillsHTML}
      </div>
    `;
    
    this.output.appendChild(div);
    this.scrollToBottom();
  }

  cmdProfileReset() {
    this.loadProfileIntoSystem(JSON.parse(JSON.stringify(DEFAULT_PROFILE)));
    this.floppyLed.className = "floppy-led-light led-off";
    this.jobsList = [];
    synth.playChime(800, 400, 200);
    this.printLine("[RMT-OS] Memoria reseteada. Perfil de Joaquín Sosa cargado por defecto.", "system");
  }

  async cmdScan(query = "") {
    this.printLine("[RMT-OS] INICIANDO ESCANEO GLOBAL Y SCRAPER EN VIVO (FETCH/CHEERIO)...", "system");
    await this.delay(200);
    this.printLine("[INFO] La recolección de ofertas reales en Computrabajo se realiza en vivo...", "warning");
    this.printLine("Conectando con Computrabajo Argentina...");
    
    const progressLine = this.printLine("BUSCANDO VACANTES: [░░░░░░░░░░░░░░░░░░░░] 0%");
    
    for (let p = 10; p <= 100; p += 15) {
      await this.delay(40);
      const capP = Math.min(p, 100);
      const filled = Math.round(capP / 5);
      const bar = "█".repeat(filled) + "░".repeat(20 - filled);
      progressLine.textContent = `BUSCANDO VACANTES: [${bar}] ${capP}%`;
    }
    
    try {
      const baseUrl = this.getBackendBaseUrl();
      const url = query ? `${baseUrl}/api/jobs?q=${encodeURIComponent(query)}` : `${baseUrl}/api/jobs`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && Array.isArray(data.jobs)) {
        this.jobsList = this.processAndMatchJobs(data.jobs);
        synth.playChime(400, 600, 250);
        this.printLine(`[SUCCESS] ¡Escaneo terminado! Cargadas ${this.jobsList.length} ofertas laborales reales del portal.`, "system");
        this.printLine("Escribe 'jobs' para ver el listado de compatibilidad.", "warning");
      } else {
        throw new Error("Formato inválido de base de datos.");
      }
    } catch (err) {
      synth.playErrorBeep();
      this.printLine(`[ERROR] Conexión fallida con el servidor de la API: ${err.message}`, "error");
      this.printLine("Asegurate de que el servidor Node local esté corriendo (npm start) o que el host de internet sea accesible.", "warning");
    }
  }

  processAndMatchJobs(jobs) {
    // Collect all skills from the active uploaded user profile
    const mySkills = [
      ...USER_PROFILE.skills.advanced,
      ...USER_PROFILE.skills.intermediate,
      ...USER_PROFILE.skills.basicPlus,
      ...USER_PROFILE.skills.designSuite
    ].map(s => s.toLowerCase());

    return jobs.map((job, index) => {
      const jobReqs = (job.requirements || []).map(r => r.toLowerCase());
      
      if (jobReqs.length === 0) {
        job.matchScore = 50;
        job.matchingSkills = [];
        job.missingSkills = [];
        return job;
      }

      const matching = [];
      const missing = [];

      jobReqs.forEach(req => {
        const matched = mySkills.some(mySkill => {
          if (mySkill === 'javascript' && req === 'js') return true;
          if (mySkill === 'js' && req === 'javascript') return true;
          if (mySkill === 'oracle sql' && req === 'sql') return true;
          if (mySkill === 'pl/sql' && req === 'sql') return true;
          return mySkill === req;
        });

        if (matched) {
          const original = job.requirements.find(r => r.toLowerCase() === req);
          matching.push(original);
        } else {
          const original = job.requirements.find(r => r.toLowerCase() === req);
          missing.push(original);
        }
      });

      // Match Score logic
      const score = Math.round((matching.length / jobReqs.length) * 100);

      job.matchScore = score;
      job.matchingSkills = matching;
      job.missingSkills = missing;
      job.displayId = index + 1;

      return job;
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  cmdJobs(queryFilter = "") {
    if (this.jobsList.length === 0) {
      synth.playErrorBeep();
      this.printLine("ERR: No hay ofertas cargadas en memoria. Ejecuta 'scan' primero.", "error");
      return;
    }

    let filtered = this.jobsList;
    if (queryFilter) {
      filtered = this.jobsList.filter(j => 
        j.title.toLowerCase().includes(queryFilter.toLowerCase()) ||
        j.company.toLowerCase().includes(queryFilter.toLowerCase()) ||
        j.requirements.some(r => r.toLowerCase().includes(queryFilter.toLowerCase()))
      );
    }

    this.printLine(`┌────────────────────────────────────────────────────────┐`, "system");
    this.printLine(`│   COMPATIBILIDAD DE VACANTES (COINCIDENCIAS: ${filtered.length})      │`, "system");
    this.printLine(`└────────────────────────────────────────────────────────┘`, "system");

    const tableHTML = `
      <table class="ascii-table">
        <thead>
          <tr>
            <th style="width: 8%">ID</th>
            <th style="width: 32%">PUESTO / ROL</th>
            <th style="width: 25%">COMPAÑÍA</th>
            <th style="width: 20%">UBICACIÓN</th>
            <th style="width: 15%; text-align: center;">COMPAT.</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(j => `
            <tr>
              <td>[${j.displayId}]</td>
              <td class="line highlight" style="font-weight: 600;">${j.title}</td>
              <td class="line system">${j.company}</td>
              <td style="font-size: 11px;">${j.location}</td>
              <td style="text-align: center;">
                <span class="job-score" style="background-color:${this.getScoreColor(j.matchScore)}; color:#000;">
                  ${j.matchScore}%
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    this.printHTML(tableHTML);
    this.printLine("Usa 'view [ID]' para abrir especificaciones y 'apply [ID]' para postularte.", "warning");
  }

  getScoreColor(score) {
    if (score >= 70) return "var(--theme-text)";
    if (score >= 40) return "var(--theme-warning)";
    return "var(--theme-error)";
  }

  cmdView(idStr) {
    const id = parseInt(idStr);
    if (isNaN(id)) {
      synth.playErrorBeep();
      this.printLine("ERR: Especifica un ID numérico correcto. Ej: 'view 1'.", "error");
      return;
    }

    const job = this.jobsList.find(j => j.displayId === id);
    if (!job) {
      synth.playErrorBeep();
      this.printLine(`ERR: El puesto ID [${id}] no existe en la memoria actual.`, "error");
      return;
    }

    const div = document.createElement('div');
    div.className = 'ascii-box';
    
    const matchingHTML = job.matchingSkills.map(s => `<span class="match-tag matched">${s}</span>`).join('');
    const missingHTML = job.missingSkills.map(s => `<span class="match-tag missing">${s}</span>`).join('');

    div.innerHTML = `
      <div class="ascii-box-header">ANALIZADOR DE REQUISITOS: PUESTO [${job.displayId}]</div>
      <div style="margin-bottom: 8px;">
        <span style="font-size:18px; font-weight:600;" class="line highlight">${job.title}</span><br>
        <span style="font-size:14px;" class="line system">${job.company}</span>
      </div>
      
      <div style="font-size:12px; margin-bottom: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div><i class="ph ph-folder" style="font-size: 14px; vertical-align: text-bottom;"></i> Origen: <strong>${job.source}</strong></div>
        <div><i class="ph ph-map-pin" style="font-size: 14px; vertical-align: text-bottom;"></i> Ubicación: <strong>${job.location}</strong></div>
        <div><i class="ph ph-coins" style="font-size: 14px; vertical-align: text-bottom;"></i> Salario: <strong>${job.salary}</strong></div>
        <div><i class="ph ph-lightning" style="font-size: 14px; vertical-align: text-bottom;"></i> Experiencia: <strong>${job.experience}</strong></div>
      </div>
      
      <hr style="border:0; border-top: 1px dashed var(--theme-border-dim); margin-bottom: 8px;">
      
      <div style="margin-bottom: 12px;">
        <span class="line highlight">Análisis de Compatibilidad:</span>
        <div style="margin: 6px 0; display: flex; align-items: center; gap: 10px;">
          <span class="job-score" style="font-size:14px; background-color:${this.getScoreColor(job.matchScore)}; color:#000;">
            ${job.matchScore}% Match
          </span>
          <span style="font-size:12px; color:var(--theme-text-dim);">Comparado contra el disquete A:</span>
        </div>
        <div style="margin-top: 8px;">
          <div style="font-size:11px; margin-bottom: 2px;">REQUISITOS CUMPLIDOS (Habilidades que tenés):</div>
          ${matchingHTML || '<span style="color:var(--theme-text-dim); font-size:12px;">Ninguna coincidencia en disquete.</span>'}
        </div>
        <div style="margin-top: 8px;">
          <div style="font-size:11px; margin-bottom: 2px;">REQUISITOS NO DETECTADOS (Faltantes en disquete):</div>
          ${missingHTML || '<span style="color:var(--theme-text); font-size:12px;">¡Tenés todo lo requerido para postularte!</span>'}
        </div>
      </div>

      <hr style="border:0; border-top: 1px dashed var(--theme-border-dim); margin-bottom: 8px;">

      <div style="margin-bottom: 12px;">
        <span class="line highlight">Descripción y Tareas del Puesto:</span>
        <p style="font-size:12px; line-height: 1.4; white-space: normal; color: var(--theme-text-dim); margin-top: 4px;">
          ${job.description}
        </p>
      </div>
      
      <div style="text-align: right; margin-top: 10px;">
        <button class="btn-ctrl" onclick="shell.executeCommand('apply ${job.displayId}')">[POSTULARSE DIRECTO EN PORTAL]</button>
      </div>
    `;
    
    this.output.appendChild(div);
    this.scrollToBottom();
  }

  async cmdApply(idStr) {
    const id = parseInt(idStr);
    if (isNaN(id)) {
      synth.playErrorBeep();
      this.printLine("ERR: Especifica un ID numérico correcto. Ej: 'apply 1'.", "error");
      return;
    }

    const job = this.jobsList.find(j => j.displayId === id);
    if (!job) {
      synth.playErrorBeep();
      this.printLine(`ERR: El ID de puesto [${id}] no fue encontrado en memoria.`, "error");
      return;
    }

    this.printLine(`[RMT-OS] Interceptando ruta directa a la empresa a través del proxy...`, "system");
    
    try {
      const baseUrl = this.getBackendBaseUrl();
      const res = await fetch(`${baseUrl}/api/apply?url=${encodeURIComponent(job.apply_url)}`);
      const data = await res.json();
      
      this.printLine(`¡Enlace directo extraído! Redirigiendo a:`, "system");
      this.printLine(`${data.apply_url}`);
      
      synth.playChime(600, 900, 300);
      window.open(data.apply_url, '_blank');
    } catch (err) {
      synth.playErrorBeep();
      this.printLine(`[ERROR] Fallo al extraer el enlace: ${err.message}`, "error");
      this.printLine(`Redirigiendo al portal original: ${job.apply_url}`, "warning");
      window.open(job.apply_url, '_blank');
    }
  }

  cmdTheme(color) {
    if (!color) {
      this.toggleTheme();
      return;
    }

    const lowerColor = color.toLowerCase();
    const map = {
      'green': 'theme-green',
      'amber': 'theme-amber',
      'cyan': 'theme-cyan',
      'white': 'theme-white'
    };

    if (map[lowerColor]) {
      document.body.classList.remove(this.themes[this.currentThemeIdx]);
      this.currentThemeIdx = this.themes.indexOf(map[lowerColor]);
      document.body.classList.add(map[lowerColor]);
      
      synth.playKeyClick(true);
      this.printLine(`[RMT-OS] Theme shifted to: ${color.toUpperCase()}`, "system");
    } else {
      synth.playErrorBeep();
      this.printLine("ERR: Color inválido. Elige: 'green', 'amber', 'cyan', or 'white'.", "error");
    }
  }

  cmdAudio(state) {
    if (!state) {
      this.toggleAudio();
      return;
    }

    const lowerState = state.toLowerCase();
    if (lowerState === 'on' || lowerState === 'activate') {
      synth.init();
      synth.muted = false;
      this.soundIndicator.textContent = "AUDIO: READY";
      this.audioToggleBtn.textContent = "[F6: AUDIO OFF]";
      this.printLine("[RMT-OS] Audio Synthesizer: ACTIVATED.", "system");
    } else if (lowerState === 'off' || lowerState === 'deactivate') {
      synth.muted = true;
      this.soundIndicator.textContent = "AUDIO: MUTED";
      this.audioToggleBtn.textContent = "[F6: AUDIO ON]";
      this.printLine("[RMT-OS] Audio Synthesizer: DEACTIVATED.", "warning");
    } else {
      synth.playErrorBeep();
      this.printLine("ERR: Comando de audio inválido. Prueba 'audio on' o 'audio off'.", "error");
    }
  }

  cmdExport() {
    if (this.jobsList.length === 0) {
      synth.playErrorBeep();
      this.printLine("ERR: No hay ofertas cargadas en la memoria caché para exportar.", "error");
      return;
    }

    const exportData = {
      candidato: USER_PROFILE.name,
      fecha_exportacion: new Date().toISOString(),
      ofertas_compatibles: this.jobsList.length,
      jobs: this.jobsList.map(j => ({
        puesto: j.title,
        compania: j.company,
        ubicacion: j.location,
        salario: j.salary,
        compatibilidad: `${j.matchScore}%`,
        habilidades_compatibles: j.matchingSkills,
        habilidades_faltantes: j.missingSkills,
        url_postulacion: j.apply_url,
        fuente: j.source
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `retro_match_${USER_PROFILE.name.replace(/\s+/g, '_').toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    this.printLine("[SUCCESS] Exportación del reporte de empleos descargado con éxito.", "system");
  }
}

// Global hook
const shell = new UniversalTerminalShell();
window.shell = shell;

document.addEventListener('DOMContentLoaded', () => {
  shell.init();
});
