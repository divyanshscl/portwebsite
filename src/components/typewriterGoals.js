/**
 * typewriterGoals.js — Line-by-line typewriter animation rendered to a canvas.
 * Used on the left wall monitor below the calendar.
 */

export class TypewriterGoals {
  constructor(width = 512, height = 384) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    this.w = width;
    this.h = height;

    this.lines = [
      '> INITIALIZING SYSTEM...',
      '> Loading neural modules... OK',
      '> Calibrating GPU clusters... OK',
      '> Establishing uplink... OK',
      '',
      '## 2026 OBJECTIVES',
      '- Ship 3 immersive 3D web experiences',
      '- Master WebGPU & compute shaders',
      '- Contribute to open-source Three.js',
      '- Build a real-time collaborative IDE',
      '- Mentor 5 junior developers',
    ];

    this.displayedLines = [];
    this.currentLine = 0;
    this.currentChar = 0;
    this.charDelay = 35; // ms per character
    this.lineDelay = 200; // ms between lines
    this.lastUpdate = 0;
    this.done = false;
  }

  update(timestamp) {
    if (this.done) return;
    if (this.currentLine >= this.lines.length) {
      this.done = true;
      return;
    }

    if (timestamp - this.lastUpdate < this.charDelay) return;

    const line = this.lines[this.currentLine];
    if (this.currentChar <= line.length) {
      if (!this.displayedLines[this.currentLine]) {
        this.displayedLines[this.currentLine] = '';
      }
      this.displayedLines[this.currentLine] = line.substring(0, this.currentChar);
      this.currentChar++;
      this.lastUpdate = timestamp;
    } else {
      this.currentLine++;
      this.currentChar = 0;
      this.lastUpdate = timestamp + this.lineDelay;
    }
  }

  render() {
    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.w, this.h);

    // Panel background
    ctx.fillStyle = 'rgba(8, 8, 16, 0.88)';
    ctx.fillRect(20, 20, this.w - 40, this.h - 40);

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, this.w - 40, this.h - 40);

    // Header
    ctx.fillStyle = '#ff007f';
    ctx.font = 'bold 14px "Orbitron", monospace';
    ctx.textAlign = 'left';
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 6;
    ctx.fillText('// SYSTEM GOALS', 35, 42);
    ctx.shadowBlur = 0;

    // Lines
    ctx.font = '12px "JetBrains Mono", monospace';
    const startY = 70;
    const lineHeight = 22;
    let y = startY;

    for (let i = 0; i < this.displayedLines.length; i++) {
      const text = this.displayedLines[i];
      if (text === undefined) continue;

      if (text.startsWith('##')) {
        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 13px "Orbitron", monospace';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 4;
        ctx.fillText(text.replace('## ', ''), 35, y);
        ctx.shadowBlur = 0;
        ctx.font = '12px "JetBrains Mono", monospace';
      } else if (text.startsWith('>')) {
        ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
        ctx.fillText(text, 35, y);
      } else if (text.startsWith('-')) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillText(text, 35, y);
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText(text, 35, y);
      }

      // Blinking cursor on current line
      if (i === this.currentLine && !this.done) {
        const w = ctx.measureText(text).width;
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(35 + w + 2, y - 10, 8, 14);
      }

      y += lineHeight;
      if (y > this.h - 30) break;
    }
  }
}
