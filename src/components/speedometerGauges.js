/**
 * speedometerGauges.js — Dual realistic speedometer gauges rendered to canvas.
 * Left: "Experience" (0-100% / Turbo Boost)
 * Right: "Skills" (0-100% / Overclocked)
 * Used as the laptop display screen texture during boot sequence.
 */

import { degToRad } from '../utils/helpers.js';

export class SpeedometerGauges {
  constructor(width = 512, height = 384) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    this.w = width;
    this.h = height;

    this.leftValue = 0;
    this.rightValue = 0;
    this.leftTarget = 0;
    this.rightTarget = 0;

    this.showROG = true;
    this.brandName = 'DIVYANSH BIDSAR';
    this.brandAlpha = 0;

    this._rogRotation = 0;
  }

  setTargets(left, right) {
    this.leftTarget = Math.max(0, Math.min(100, left));
    this.rightTarget = Math.max(0, Math.min(100, right));
  }

  setBrandAlpha(a) {
    this.brandAlpha = Math.max(0, Math.min(1, a));
  }

  update(dt) {
    this.leftValue += (this.leftTarget - this.leftValue) * 0.04;
    this.rightValue += (this.rightTarget - this.rightValue) * 0.04;
    this._rogRotation += dt * 0.0003;
  }

  _drawGauge(cx, cy, r, value, label, subLabel, accentColor) {
    const ctx = this.ctx;

    // Outer ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, degToRad(135), degToRad(405));
    ctx.stroke();

    // Tick marks
    for (let i = 0; i <= 10; i++) {
      const angle = degToRad(135 + (i / 10) * 270);
      const inner = r - (i % 5 === 0 ? 14 : 8);
      const outer = r - 2;
      ctx.strokeStyle = i % 5 === 0 ? 'rgba(0, 240, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = i % 5 === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
      ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
      ctx.stroke();
    }

    // Arc fill
    const fillAngle = degToRad(135 + (value / 100) * 270);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 5;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 2, degToRad(135), fillAngle);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Needle
    const needleAngle = degToRad(135 + (value / 100) * 270);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(needleAngle) * (r - 6), cy + Math.sin(needleAngle) * (r - 6));
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Hub
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    // Value text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px "Orbitron", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 6;
    ctx.fillText(Math.round(value) + '%', cx, cy + 35);
    ctx.shadowBlur = 0;

    // Label
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 12px "Orbitron", monospace';
    ctx.fillText(label, cx, cy - 25);

    // Sub-label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px "Rajdhani", sans-serif';
    ctx.fillText(subLabel, cx, cy - 10);
  }

  _drawROGEmblem(cx, cy, alpha) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);
    ctx.rotate(this._rogRotation);

    // ROG-style geometric emblem
    const r = 45;
    ctx.strokeStyle = '#ff0033';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff0033';
    ctx.shadowBlur = 15;

    // Hexagonal outer
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    // Inner star pattern
    ctx.strokeStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7);
    }
    ctx.stroke();

    // Center dot
    ctx.fillStyle = '#ff007f';
    ctx.shadowColor = '#ff007f';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();

    // ROG text
    ctx.fillStyle = `rgba(255, 0, 51, ${alpha})`;
    ctx.font = 'bold 16px "Orbitron", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff0033';
    ctx.shadowBlur = 8;
    ctx.fillText('ROG', cx, cy + 70);
    ctx.shadowBlur = 0;
  }

  render() {
    const ctx = this.ctx;

    // Dark screen background
    ctx.fillStyle = '#03040a';
    ctx.fillRect(0, 0, this.w, this.h);

    // Subtle grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.w; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.h);
      ctx.stroke();
    }
    for (let y = 0; y < this.h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.w, y);
      ctx.stroke();
    }

    // ROG Emblem (center, between gauges)
    if (this.showROG) {
      this._drawROGEmblem(this.w / 2, this.h / 2 - 10, 0.7);
    }

    // Brand name
    if (this.brandAlpha > 0) {
      ctx.fillStyle = `rgba(0, 240, 255, ${this.brandAlpha})`;
      ctx.font = 'bold 22px "Orbitron", monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.fillText(this.brandName, this.w / 2, this.h - 20);
      ctx.shadowBlur = 0;
    }

    // Left gauge: Experience
    this._drawGauge(
      this.w * 0.22, this.h * 0.42, 75,
      this.leftValue,
      'EXPERIENCE', 'Turbo Boost',
      '#00f0ff'
    );

    // Right gauge: Skills
    this._drawGauge(
      this.w * 0.78, this.h * 0.42, 75,
      this.rightValue,
      'SKILLS', 'Overclocked',
      '#ff007f'
    );
  }
}
