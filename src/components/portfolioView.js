/**
 * portfolioView.js — Interactive full-screen portfolio overlay (Phase 5).
 * Contains: About Me, Featured Projects, Technical Skills, Experience Timeline,
 * Interactive Contact Form, and Return to Room button.
 */

import { createIcons, icons } from 'lucide';

export class PortfolioView {
  constructor(container, audioManager) {
    this.container = container;
    this.audio = audioManager;
    this._mounted = false;
  }

  mount() {
    if (this._mounted) return;
    this._mounted = true;
    this.container.innerHTML = this._getHTML();
    this._bindEvents();
    this._initAnimations();
    createIcons({ icons });
  }

  unmount() {
    this.container.innerHTML = '';
    this._mounted = false;
  }

  _getHTML() {
    return /* html */ `
<div class="min-h-full w-full cyber-grid-bg relative">
  <!-- Scanline overlay -->
  <div class="fixed inset-0 pointer-events-none scanline-overlay z-50"></div>

  <!-- Top nav bar -->
  <nav class="sticky top-0 z-40 backdrop-blur-xl bg-[#08080c]/90 border-b border-rog-borderCyan">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-rog-cyan to-rog-neonPink flex items-center justify-center font-orbitron font-black text-white text-lg shadow-lg">D</div>
        <div>
          <h1 class="font-orbitron font-bold text-sm tracking-wider text-slate-100">DIVYANSH BIDSAR</h1>
          <p class="text-xs text-rog-cyan font-mono">Creative 3D Developer</p>
        </div>
      </div>
      <div class="hidden md:flex items-center gap-6 font-rajdhani text-sm font-semibold text-slate-300">
        <a href="#about" class="hover:text-rog-cyan transition-colors">About</a>
        <a href="#projects" class="hover:text-rog-cyan transition-colors">Projects</a>
        <a href="#skills" class="hover:text-rog-cyan transition-colors">Skills</a>
        <a href="#experience" class="hover:text-rog-cyan transition-colors">Experience</a>
        <a href="#contact" class="hover:text-rog-cyan transition-colors">Contact</a>
      </div>
      <button id="return-to-room-btn" class="group px-4 py-2 rounded-lg font-rajdhani font-semibold text-xs uppercase tracking-wider border border-rog-borderCyan text-rog-cyan hover:bg-rog-cyan/10 transition-all flex items-center gap-2">
        <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
        <span>Return to Room</span>
      </button>
    </div>
  </nav>

  <!-- Hero / About -->
  <section id="about" class="portfolio-section max-w-6xl mx-auto px-6 pt-20 pb-16">
    <div class="grid md:grid-cols-2 gap-10 items-center">
      <div>
        <div class="inline-block px-3 py-1 rounded-full bg-rog-cyan/10 border border-rog-borderCyan text-rog-cyan text-xs font-mono mb-4">// SYSTEM ONLINE</div>
        <h2 class="font-orbitron font-black text-4xl md:text-5xl leading-tight mb-4">
          <span class="text-glow-cyan text-white">CREATIVE</span><br>
          <span class="text-glow-pink text-rog-neonPink">3D DEVELOPER</span>
        </h2>
        <p class="text-slate-300 text-lg leading-relaxed mb-6 max-w-md">
          I build immersive, interactive web experiences at the intersection of design, code, and motion.
          Specializing in real-time 3D graphics, WebGL, and procedural audio synthesis.
        </p>
        <div class="flex gap-4">
          <a href="#projects" class="px-6 py-3 rounded-xl bg-gradient-to-r from-rog-cyan to-rog-neonPink text-white font-orbitron font-bold text-sm tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all">
            View Projects
          </a>
          <a href="#contact" class="px-6 py-3 rounded-xl border border-rog-borderCyan text-slate-200 font-rajdhani font-semibold text-sm hover:bg-rog-cyan/5 transition-all">
            Get in Touch
          </a>
        </div>
      </div>
      <div class="relative">
        <div class="aspect-square max-w-sm mx-auto rounded-2xl cyber-panel p-8 flex items-center justify-center relative overflow-hidden">
          <div class="absolute inset-0 cyber-grid-bg opacity-20"></div>
          <div class="relative text-center">
            <div class="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-rog-cyan via-purple-600 to-rog-neonPink flex items-center justify-center font-orbitron font-black text-5xl text-white shadow-[0_0_40px_rgba(0,240,255,0.3)] mb-4">D</div>
            <p class="font-mono text-xs text-rog-cyan">SYS_ADMIN@rog-portfolio:~$</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Featured Projects -->
  <section id="projects" class="portfolio-section max-w-6xl mx-auto px-6 py-16">
    <h3 class="font-orbitron font-bold text-2xl text-glow-cyan mb-2">FEATURED PROJECTS</h3>
    <div class="w-20 h-0.5 bg-gradient-to-r from-rog-cyan to-transparent mb-10"></div>
    <div class="grid md:grid-cols-3 gap-6">
      ${this._projectCardsHTML()}
    </div>
  </section>

  <!-- Technical Skills -->
  <section id="skills" class="portfolio-section max-w-6xl mx-auto px-6 py-16">
    <h3 class="font-orbitron font-bold text-2xl text-glow-pink mb-2">TECHNICAL SKILLS</h3>
    <div class="w-20 h-0.5 bg-gradient-to-r from-rog-neonPink to-transparent mb-10"></div>
    <div class="grid md:grid-cols-2 gap-x-12 gap-y-8">
      ${this._skillsHTML()}
    </div>
  </section>

  <!-- Experience Timeline -->
  <section id="experience" class="portfolio-section max-w-4xl mx-auto px-6 py-16">
    <h3 class="font-orbitron font-bold text-2xl text-glow-cyan mb-2">EXPERIENCE TIMELINE</h3>
    <div class="w-20 h-0.5 bg-gradient-to-r from-rog-cyan to-transparent mb-10"></div>
    <div class="relative pl-8">
      <!-- Vertical line -->
      <div class="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-rog-cyan via-rog-neonPink to-transparent"></div>
      ${this._timelineHTML()}
    </div>
  </section>

  <!-- Contact Form -->
  <section id="contact" class="portfolio-section max-w-2xl mx-auto px-6 py-16 pb-32">
    <h3 class="font-orbitron font-bold text-2xl text-glow-pink mb-2">CONTACT</h3>
    <div class="w-20 h-0.5 bg-gradient-to-r from-rog-neonPink to-transparent mb-10"></div>
    <div class="cyber-panel rounded-2xl p-8">
      <form id="contact-form" class="space-y-5">
        <div>
          <label class="block text-xs font-mono text-rog-cyan mb-2">NAME</label>
          <input type="text" name="name" required placeholder="Your name" class="w-full bg-[#050608]/60 border border-rog-borderCyan/40 rounded-lg px-4 py-3 text-slate-100 font-rajdhani focus:border-rog-cyan focus:outline-none focus:ring-2 focus:ring-rog-cyan/20 transition-all" />
        </div>
        <div>
          <label class="block text-xs font-mono text-rog-cyan mb-2">EMAIL</label>
          <input type="email" name="email" required placeholder="your@email.com" class="w-full bg-[#050608]/60 border border-rog-borderCyan/40 rounded-lg px-4 py-3 text-slate-100 font-rajdhani focus:border-rog-cyan focus:outline-none focus:ring-2 focus:ring-rog-cyan/20 transition-all" />
        </div>
        <div>
          <label class="block text-xs font-mono text-rog-cyan mb-2">MESSAGE</label>
          <textarea name="message" required rows="4" placeholder="Your message..." class="w-full bg-[#050608]/60 border border-rog-borderCyan/40 rounded-lg px-4 py-3 text-slate-100 font-rajdhani focus:border-rog-cyan focus:outline-none focus:ring-2 focus:ring-rog-cyan/20 transition-all resize-none"></textarea>
        </div>
        <button type="submit" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-rog-cyan to-rog-neonPink text-white font-orbitron font-bold text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all flex items-center justify-center gap-2">
          <i data-lucide="send" class="w-4 h-4"></i>
          <span>TRANSMIT</span>
        </button>
        <div id="contact-form-status" class="hidden text-center font-mono text-sm"></div>
      </form>
    </div>
  </section>

  <!-- Footer -->
  <footer class="max-w-6xl mx-auto px-6 py-8 border-t border-rog-borderCyan/20">
    <div class="flex flex-col md:flex-row items-center justify-between gap-4">
      <p class="text-xs font-mono text-slate-500">© 2026 Divyansh Bidsar | ROG Cyber 3D Portfolio</p>
      <div class="flex gap-4">
        <a href="https://github.com" target="_blank" rel="noopener" class="text-slate-400 hover:text-rog-cyan transition-colors"><i data-lucide="github" class="w-5 h-5"></i></a>
        <a href="https://linkedin.com" target="_blank" rel="noopener" class="text-slate-400 hover:text-rog-cyan transition-colors"><i data-lucide="linkedin" class="w-5 h-5"></i></a>
        <a href="mailto:divyansh@example.com" class="text-slate-400 hover:text-rog-cyan transition-colors"><i data-lucide="mail" class="w-5 h-5"></i></a>
      </div>
    </div>
  </footer>
</div>
`;
  }

  _projectCardsHTML() {
    const projects = [
      {
        title: 'Nebula Engine',
        desc: 'A WebGL2 real-time particle simulation engine with GPU compute shaders and 1M+ particles.',
        tags: ['WebGL2', 'GLSL', 'Three.js'],
        demo: '#',
        repo: '#',
      },
      {
        title: 'Synthwave Studio',
        desc: 'Browser-based procedural audio workstation with modular synth routing and real-time DSP.',
        tags: ['Web Audio', 'React', 'TypeScript'],
        demo: '#',
        repo: '#',
      },
      {
        title: 'Cyber City Explorer',
        desc: 'Interactive 3D cyberpunk city with procedural buildings, neon reflections, and day/night cycle.',
        tags: ['Three.js', 'GSAP', 'Procedural'],
        demo: '#',
        repo: '#',
      },
    ];

    return projects.map((p, i) => /* html */ `
      <div class="cyber-panel rounded-2xl overflow-hidden group hover:border-rog-cyan/50 transition-all duration-300" style="animation-delay: ${i * 0.15}s">
        <div class="h-40 cyber-grid-bg bg-gradient-to-br from-[#0a0b14] to-[#12121a] flex items-center justify-center relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-rog-cyan/5 to-rog-neonPink/5 group-hover:from-rog-cyan/15 group-hover:to-rog-neonPink/15 transition-all duration-500"></div>
          <i data-lucide="${['cpu', 'audio-waveform', 'boxes'][i]}" class="w-12 h-12 text-rog-cyan/60 group-hover:text-rog-cyan transition-colors duration-300"></i>
        </div>
        <div class="p-5">
          <h4 class="font-orbitron font-bold text-base text-slate-100 mb-2 group-hover:text-rog-cyan transition-colors">${p.title}</h4>
          <p class="text-sm text-slate-400 leading-relaxed mb-4">${p.desc}</p>
          <div class="flex flex-wrap gap-2 mb-4">
            ${p.tags.map(t => `<span class="px-2 py-1 rounded bg-rog-cyan/10 text-rog-cyan text-xs font-mono">${t}</span>`).join('')}
          </div>
          <div class="flex gap-3">
            <a href="${p.demo}" target="_blank" rel="noopener" class="flex items-center gap-1.5 text-xs font-rajdhani font-semibold text-rog-cyan hover:text-white transition-colors">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Demo
            </a>
            <a href="${p.repo}" target="_blank" rel="noopener" class="flex items-center gap-1.5 text-xs font-rajdhani font-semibold text-slate-400 hover:text-white transition-colors">
              <i data-lucide="github" class="w-3.5 h-3.5"></i> Code
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  _skillsHTML() {
    const categories = [
      {
        title: 'Frontend & Graphics',
        color: '#00f0ff',
        skills: [
          { name: 'JavaScript / ES2024', level: 95 },
          { name: 'Three.js / WebGL', level: 88 },
          { name: 'React / Next.js', level: 90 },
          { name: 'GSAP / Animation', level: 85 },
          { name: 'Tailwind CSS', level: 92 },
        ],
      },
      {
        title: 'Backend & Systems',
        color: '#ff007f',
        skills: [
          { name: 'Node.js / Express', level: 85 },
          { name: 'Python / FastAPI', level: 78 },
          { name: 'PostgreSQL / Supabase', level: 82 },
          { name: 'TypeScript', level: 80 },
          { name: 'Docker / DevOps', level: 70 },
        ],
      },
    ];

    return categories.map(cat => /* html */ `
      <div>
        <h4 class="font-orbitron font-bold text-sm mb-4" style="color: ${cat.color}; text-shadow: 0 0 8px ${cat.color}40;">${cat.title}</h4>
        <div class="space-y-4">
          ${cat.skills.map(s => /* html */ `
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <span class="text-sm text-slate-300 font-rajdhani font-medium">${s.name}</span>
                <span class="text-xs font-mono text-slate-400">${s.level}%</span>
              </div>
              <div class="skill-bar-track h-1.5">
                <div class="skill-bar-fill" style="width: 0%" data-target="${s.level}"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  _timelineHTML() {
    const entries = [
      { year: '2026', title: 'Senior Creative Developer', org: 'Freelance', desc: 'Building immersive 3D web experiences for international clients using Three.js, WebGL2, and procedural audio.' },
      { year: '2024', title: '3D Web Developer', org: 'Tech Studio', desc: 'Led development of interactive product configurators and real-time 3D visualizations with React Three Fiber.' },
      { year: '2022', title: 'Frontend Engineer', org: 'Startup Inc.', desc: 'Built responsive, high-performance web applications with React, GSAP, and modern CSS animation techniques.' },
      { year: '2021', title: 'B.Tech Computer Science', org: 'University', desc: 'Graduated with honors. Thesis on real-time procedural generation in WebGL.' },
    ];

    return entries.map((e, i) => /* html */ `
      <div class="relative mb-8 last:mb-0" style="animation-delay: ${i * 0.2}s">
        <div class="absolute -left-[1.65rem] top-1 w-3 h-3 rounded-full bg-rog-cyan timeline-dot"></div>
        <div class="cyber-panel rounded-xl p-5 hover:border-rog-cyan/40 transition-all">
          <div class="flex items-center gap-3 mb-2">
            <span class="font-orbitron font-bold text-rog-neonPink text-sm">${e.year}</span>
            <span class="text-xs text-slate-500">|</span>
            <span class="text-sm text-slate-300 font-rajdhani font-semibold">${e.title}</span>
            <span class="text-xs text-rog-cyan font-mono">@ ${e.org}</span>
          </div>
          <p class="text-sm text-slate-400 leading-relaxed">${e.desc}</p>
        </div>
      </div>
    `).join('');
  }

  _bindEvents() {
    // Return to room
    const returnBtn = this.container.querySelector('#return-to-room-btn');
    if (returnBtn) {
      returnBtn.addEventListener('click', () => {
        this.audio.playClick();
        if (this.onReturn) this.onReturn();
      });
    }

    // Contact form
    const form = this.container.querySelector('#contact-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.audio.playClick();
        const status = this.container.querySelector('#contact-form-status');
        status.className = 'text-center font-mono text-sm text-rog-cyan';
        status.textContent = '> TRANSMITTING SIGNAL...';
        status.classList.remove('hidden');

        setTimeout(() => {
          status.textContent = '> MESSAGE TRANSMITTED SUCCESSFULLY.';
          form.reset();
          setTimeout(() => status.classList.add('hidden'), 4000);
        }, 1500);
      });
    }

    // Nav link smooth scroll
    this.container.querySelectorAll('nav a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = this.container.querySelector(link.getAttribute('href'));
        if (target) {
          this.audio.playClick();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  _initAnimations() {
    // Animate skill bars on mount
    setTimeout(() => {
      this.container.querySelectorAll('.skill-bar-fill').forEach(bar => {
        const target = bar.dataset.target;
        bar.style.width = target + '%';
      });
    }, 300);
  }
}
