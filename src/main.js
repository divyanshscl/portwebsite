/**
 * main.js — App initialization & event binding.
 * Orchestrates the 5-phase ROG Cyber 3D Portfolio experience.
 */

import { RoomScene } from './components/roomScene.js';
import { AudioManager } from './components/audioManager.js';
import { PortfolioView } from './components/portfolioView.js';

export function initApp() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  // --- Audio Manager ---
  const audio = new AudioManager();
  let audioEnabled = false;

  // --- Audio Toggle UI (top-right) ---
  const audioToggle = document.createElement('div');
  audioToggle.className = 'fixed top-6 right-6 z-30 flex items-center gap-3 pointer-events-auto';
  audioToggle.innerHTML = `
    <div id="audio-visualizer" class="flex items-end gap-1 h-8">
      ${Array.from({ length: 5 }, () => '<div class="audio-bar h-2"></div>').join('')}
    </div>
    <button id="audio-toggle-btn" class="relative w-10 h-10 rounded-full bg-[#0a0b10] border-2 border-[#1e202e] hover:border-rog-cyan flex items-center justify-center transition-all group" aria-label="Toggle Audio">
      <svg id="audio-on-icon" class="w-5 h-5 text-rog-cyan hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5L6 9H2v6h4l5 4V5z"/>
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/>
      </svg>
      <svg id="audio-off-icon" class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5L6 9H2v6h4l5 4V5z"/>
        <line x1="22" y1="9" x2="16" y2="15"/>
        <line x1="16" y1="9" x2="22" y2="15"/>
      </svg>
    </button>
  `;
  document.body.appendChild(audioToggle);

  const onIcon = audioToggle.querySelector('#audio-on-icon');
  const offIcon = audioToggle.querySelector('#audio-off-icon');
  const toggleBtn = audioToggle.querySelector('#audio-toggle-btn');
  const visualizerBars = audioToggle.querySelectorAll('.audio-bar');

  function setAudioState(on) {
    audioEnabled = on;
    audio.setEnabled(on);
    onIcon.classList.toggle('hidden', !on);
    offIcon.classList.toggle('hidden', on);
  }

  toggleBtn.addEventListener('click', () => {
    setAudioState(!audioEnabled);
  });

  // Visualizer loop
  function updateVisualizer() {
    if (audioEnabled) {
      const levels = audio.getVisualizerLevels();
      visualizerBars.forEach((bar, i) => {
        const level = levels[i] || 0;
        bar.style.height = `${4 + level * 28}px`;
        bar.style.opacity = 0.4 + level * 0.6;
      });
    } else {
      visualizerBars.forEach(bar => {
        bar.style.height = '4px';
        bar.style.opacity = 0.3;
      });
    }
    requestAnimationFrame(updateVisualizer);
  }
  updateVisualizer();

  // --- Room Scene ---
  const room = new RoomScene(canvas, audio);

  // --- Power Button ---
  const powerBtn = document.getElementById('power-ignite-btn');
  const powerOverlay = document.getElementById('power-interaction-overlay');
  const portfolioPrompt = document.getElementById('open-portfolio-prompt');
  const openPortfolioBtn = document.getElementById('open-portfolio-btn');
  const portfolioContainer = document.getElementById('portfolio-container');

  let powered = false;

  powerBtn.addEventListener('click', () => {
    if (powered) return;
    powered = true;

    // Enable audio by default on power-up
    if (!audioEnabled) {
      setAudioState(true);
    }

    // Fade out power button
    powerOverlay.style.opacity = '0';
    powerOverlay.style.pointerEvents = 'none';

    // Trigger Phase 2: power up
    room.powerUp();
  });

  // --- Phase 4 → Show portfolio prompt ---
  room.onReady = () => {
    portfolioPrompt.style.opacity = '1';
    portfolioPrompt.style.pointerEvents = 'auto';
    portfolioPrompt.style.transform = 'translate(-50%, 0)';
  };

  // --- Phase 5: Transition to portfolio ---
  openPortfolioBtn.addEventListener('click', () => {
    audio.playClick();
    portfolioPrompt.style.opacity = '0';
    portfolioPrompt.style.pointerEvents = 'none';
    room.transitionToPortfolio();
  });

  // --- Portfolio View ---
  const portfolio = new PortfolioView(portfolioContainer, audio);

  room.onTransitionComplete = () => {
    portfolio.mount();
    portfolioContainer.style.opacity = '1';
    portfolioContainer.style.pointerEvents = 'auto';
  };

  portfolio.onReturn = () => {
    portfolioContainer.style.opacity = '0';
    portfolioContainer.style.pointerEvents = 'none';
    room.returnToRoom();
  };

  room.onReturnComplete = () => {
    portfolio.unmount();
    // Show the prompt again
    portfolioPrompt.style.opacity = '1';
    portfolioPrompt.style.pointerEvents = 'auto';
  };
}

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
