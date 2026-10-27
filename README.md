# Divyansh Bidsar | ROG Cyber 3D Portfolio

An interactive, production-ready 3D portfolio web application built with **Three.js**, **GSAP**, **Tailwind CSS**, **Vite**, and procedural **Web Audio API**. Inspired by the ASUS ROG Zephyrus G14 aesthetic and cyberpunk workstation design.

![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.160-black?style=for-the-badge&logo=threedotjs&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-3.12-88CE02?style=for-the-badge&logo=greensock&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Procedural-00f0ff?style=for-the-badge)

---

## ⚡ Interactive Animation Phases

### 🎮 Phase 1: Ambient Dark Room & ROG Zephyrus G14 Lid
- Atmospheric 3D workstation featuring an ergonomic, sloped gaming desk.
- Precision 3D model of an **ASUS ROG Zephyrus G14** resting closed on the desk.
- Iconic **Slash Lighting** pulsing dynamically with cyan/pink LED beams across the laptop lid.
- Top-Right Audio UI with visualizer wave indicators and toggle controls.
- Central pulsing cyber power button awaiting user ignition.

### 🔌 Phase 2: Power-Up & Charger Docking
- Clicking the power button synthesizes a high-tech boot chime and sub-bass resonant rise.
- An animated power cable slides into the laptop's left-side port with electrical spark particles and sound.
- Ambient desk edges and back wall ignite with vibrant Cyan (`#00f0ff`) and Electric Pink (`#ff007f`) RGB strips.
- The G14 lid hinges open to reveal the high-resolution display.

### ⏱️ Phase 3: On-Screen Boot Sequence & Speedometer Gauges
- Laptop display renders an animated Republic of Gamers (ROG) emblem.
- Personal branding for **Divyansh Bidsar** fades in with cybernetic typography.
- Dual realistic speedometer gauges:
  - **Left Gauge**: "Experience" (0 to 100% / Turbo Boost)
  - **Right Gauge**: "Skills" (0 to 100% / Overclocked)
- Needles dynamically rev up with procedural audio feedback and sweep to maximum right-hand capacity.

### 🌌 Phase 4: Wall Screens & Procedural Space Canvases
- Two illuminated wall monitors render 60 FPS procedural cosmic space backgrounds with multi-layered twinkling starfields, drifting nebula clouds, and shooting comets:
  - **Left Screen**: Live Calendar (real `Date()` day, month, date, year) + line-by-line Typewriter Goals.
  - **Right Screen**: Real-time Technical Stack Telemetry and dynamic skill bars.

### 📽️ Phase 5: Projector Transition & Full-Screen Portfolio
- Reaching 100% capacity triggers the on-screen "Enter Immersive Portfolio" action.
- Camera initiates a cinematic GSAP timeline sweep towards the right wall.
- Overhead projector ignites with a volumetric light beam and power hum.
- Camera zooms directly into the projected screen to reveal the interactive portfolio:
  - **About Me**
  - **Featured Projects** (with live demo and repo links)
  - **Technical Skills** (categorized radar and meters)
  - **Experience Timeline**
  - **Interactive Contact Form**
  - **Return to Room** button to smoothly zoom back to the 3D workstation.

---

## 📁 Repository Structure

```
my-rog-portfolio/
├── index.html                  # HTML5 entrypoint & HUD overlays
├── package.json                # Project dependencies & build scripts
├── vite.config.js              # Vite configuration (base: './')
├── tailwind.config.js          # Cyberpunk theme and palette
├── postcss.config.js           # PostCSS Tailwind plugins
├── README.md                   # Documentation & deployment guide
├── .gitignore                  # Git exclusions
├── public/
│   └── favicon.svg             # Cyber ROG favicon
├── src/
│   ├── main.js                 # App initialization & event binding
│   ├── style.css               # Tailwind CSS & custom styling
│   ├── components/
│   │   ├── audioManager.js     # Procedural Web Audio API sound synthesizer
│   │   ├── roomScene.js        # Three.js 3D workstation & GSAP camera director
│   │   ├── spaceCanvas.js      # 60 FPS procedural cosmic space generator
│   │   ├── liveCalendar.js     # Dynamic Date() telemetry renderer
│   │   ├── typewriterGoals.js  # Line-by-line typewriter animation
│   │   ├── speedometerGauges.js# Speedometer gauges & ROG screen canvas
│   │   └── portfolioView.js    # Interactive full-screen portfolio overlay
│   └── utils/
│       └── helpers.js          # Math, color, and canvas scaling utilities
```

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
Ensure you have **Node.js** (v18.0.0 or later) installed:
```bash
node -v
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```
The optimized, static output will be generated in the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 🌐 Deployment Instructions

### Deploying to Vercel

#### Method 1: Via Vercel CLI
```bash
npm i -g vercel
vercel
```
Select the default settings. Vercel automatically detects Vite:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

#### Method 2: Via GitHub Integration
1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: complete ROG 3D portfolio"
   git remote add origin https://github.com/<your-username>/my-rog-portfolio.git
   git push -u origin main
   ```
2. Log into [vercel.com](https://vercel.com).
3. Click **"Add New Project"** and import your repository.
4. Keep the default build settings (`dist`) and click **Deploy**.

---

### Deploying to GitHub Pages

Because `vite.config.js` is pre-configured with `base: './'`, you can easily deploy directly to GitHub Pages.

#### Automated GitHub Actions Workflow:
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 🔊 Audio Autoplay Policy Compliance
To prevent browser security warnings and comply with the HTML5 Web Audio Autoplay Policy:
- The `AudioContext` remains suspended until the user explicitly interacts with the interface (clicking the **Power Button** or **Audio Toggle**).
- All sound effects (boot chime, cable spark, engine rev, projector hum, UI clicks) are procedurally synthesized using oscillators and noise buffers without relying on external media files.

---

## 📄 License
MIT License. Created by Divyansh Bidsar.
