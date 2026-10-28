/**
 * audioManager.js — Procedural Web Audio API sound synthesizer.
 * All sounds generated from oscillators and noise buffers, no external files.
 */

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = false;
    this.started = false;
    this.analyser = null;
    this.dataArray = null;
    this.activeNodes = new Set();
    this.visualizerBars = 8;
    this.visualizerTargets = new Array(this.visualizerBars).fill(0);
  }

  /** Lazily create AudioContext (must be triggered by user gesture). */
  init() {
    if (this.started) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.35;
    this.master.connect(this.ctx.destination);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.master.connect(this.analyser);

    this.started = true;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEnabled(on) {
    this.enabled = on;
    if (on) {
      this.init();
      this.resume();
    } else {
      this.master.gain.value = 0;
    }
    if (on) {
      this.master.gain.setTargetAtTime(0.35, this.ctx.currentTime, 0.1);
    }
  }

  /** Get visualizer levels (0..1) for UI rendering. */
  getVisualizerLevels() {
    if (!this.analyser) return new Array(this.visualizerBars).fill(0);
    this.analyser.getByteFrequencyData(this.dataArray);
    const step = Math.floor(this.dataArray.length / this.visualizerBars);
    const levels = [];
    for (let i = 0; i < this.visualizerBars; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) sum += this.dataArray[i * step + j];
      levels.push(sum / (step * 255));
    }
    return levels;
  }

  _now() {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  _osc(type, freq, gain, start, dur) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(gain, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g).connect(this.master);
    osc.start(start);
    osc.stop(start + dur + 0.05);
    this.activeNodes.add(osc);
    osc.onended = () => this.activeNodes.delete(osc);
  }

  _noise(dur, gain, filterFreq) {
    const start = this._now();
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 2;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(gain, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(filter).connect(g).connect(this.master);
    src.start(start);
    src.stop(start + dur);
  }

  /** Boot chime — ascending arpeggio with sub-bass rise. */
  playBootChime() {
    if (!this.enabled) return;
    this.init();
    this.resume();
    const t = this._now();
    // Sub-bass resonant rise
    const sub = this.ctx.createOscillator();
    const subG = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(40, t);
    sub.frequency.exponentialRampToValueAtTime(120, t + 1.2);
    subG.gain.setValueAtTime(0, t);
    subG.gain.linearRampToValueAtTime(0.3, t + 0.1);
    subG.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
    sub.connect(subG).connect(this.master);
    sub.start(t);
    sub.stop(t + 2.6);
    // Ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) => {
      const start = t + 0.3 + i * 0.12;
      this._osc('triangle', f, 0.18, start, 0.4);
    });
    // Final shimmer
    this._osc('sine', 2093, 0.12, t + 1.0, 1.2);
  }

  /** Electrical spark for cable docking. */
  playSpark() {
    if (!this.enabled) return;
    this._noise(0.15, 0.25, 3000);
    this._osc('square', 2000, 0.1, this._now(), 0.08);
    this._osc('sawtooth', 500, 0.08, this._now() + 0.02, 0.1);
  }

  /** Engine rev for speedometer sweep. */
  playRev() {
    if (!this.enabled) return;
    const t = this._now();
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 1.5);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.12, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.0);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    osc.connect(filter).connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 2.1);
  }

  /** Projector hum for Phase 5 transition. */
  playProjectorHum() {
    if (!this.enabled) return;
    const t = this._now();
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.linearRampToValueAtTime(90, t + 0.5);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.15, t + 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 2.6);
    this._noise(2.0, 0.04, 500);
  }

  /** UI click sound for buttons/interactions. */
  playClick() {
    if (!this.enabled) return;
    this._osc('square', 1200, 0.08, this._now(), 0.05);
    this._noise(0.03, 0.05, 8000);
  }
}
