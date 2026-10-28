/**
 * liveCalendar.js — Renders a live calendar with real Date() into a 2D canvas.
 * Used on the left wall monitor, combined with the space canvas background.
 */

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];
const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export class LiveCalendar {
  constructor(width = 512, height = 384) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    this.w = width;
    this.h = height;
  }

  render() {
    const ctx = this.ctx;
    const now = new Date();

    // Panel background
    ctx.fillStyle = 'rgba(8, 8, 16, 0.85)';
    ctx.fillRect(20, 20, this.w - 40, this.h - 40);

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, this.w - 40, this.h - 40);

    // Header
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 20px "Orbitron", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.fillText(MONTH_NAMES[now.getMonth()], this.w / 2, 55);
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '12px "Rajdhani", sans-serif';
    ctx.fillText(`${now.getFullYear()}`, this.w / 2, 72);

    // Big date number
    ctx.fillStyle = '#ff007f';
    ctx.font = 'bold 56px "Orbitron", monospace';
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 12;
    ctx.fillText(String(now.getDate()), this.w / 2, 125);
    ctx.shadowBlur = 0;

    // Day name
    ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
    ctx.font = '14px "Rajdhani", sans-serif';
    ctx.fillText(DAY_NAMES[now.getDay()], this.w / 2, 145);

    // Time
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillText(time, this.w / 2, 175);

    // Mini calendar grid
    const calTop = 195;
    const calLeft = 40;
    const calWidth = this.w - 80;
    const cellW = calWidth / 7;
    const cellH = 22;

    // Day headers
    ctx.font = '10px "Rajdhani", sans-serif';
    ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
    for (let d = 0; d < 7; d++) {
      ctx.fillText(DAY_NAMES[d], calLeft + cellW * d + cellW / 2, calTop);
    }

    // Days in month
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    ctx.font = '11px "JetBrains Mono", monospace';
    for (let day = 1; day <= daysInMonth; day++) {
      const col = (firstDay + day - 1) % 7;
      const row = Math.floor((firstDay + day - 1) / 7);
      const cx = calLeft + cellW * col + cellW / 2;
      const cy = calTop + 12 + cellH * (row + 1);

      if (day === now.getDate()) {
        ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(cx, cy - 4, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 6;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 0;
      }
      ctx.fillText(String(day), cx, cy);
    }
    ctx.shadowBlur = 0;
  }
}
