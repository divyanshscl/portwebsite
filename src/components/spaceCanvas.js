/**
 * spaceCanvas.js — 60 FPS procedural cosmic space background generator.
 * Multi-layered twinkling starfields, drifting nebula clouds, shooting comets.
 * Renders into a 2D canvas that is used as a texture on the wall monitors.
 */

export class SpaceCanvas {
  constructor(width = 512, height = 384) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    this.w = width;
    this.h = height;

    this.stars = [];
    this.nebulae = [];
    this.comets = [];

    this._initStars();
    this._initNebulae();

    this.lastCometTime = 0;
  }

  _initStars() {
    const layers = [
      { count: 60, size: [0.3, 0.8], speed: [0.02, 0.05], alpha: [0.3, 0.6] },
      { count: 40, size: [0.5, 1.2], speed: [0.05, 0.1], alpha: [0.5, 0.8] },
      { count: 20, size: [0.8, 1.8], speed: [0.08, 0.15], alpha: [0.7, 1.0] },
    ];
    for (const layer of layers) {
      for (let i = 0; i < layer.count; i++) {
        this.stars.push({
          x: Math.random() * this.w,
          y: Math.random() * this.h,
          r: layer.size[0] + Math.random() * (layer.size[1] - layer.size[0]),
          speed: layer.speed[0] + Math.random() * (layer.speed[1] - layer.speed[0]),
          baseAlpha: layer.alpha[0] + Math.random() * (layer.alpha[1] - layer.alpha[0]),
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.02 + Math.random() * 0.04,
        });
      }
    }
  }

  _initNebulae() {
    const colors = [
      'rgba(100, 0, 150, 0.08)',
      'rgba(0, 80, 200, 0.06)',
      'rgba(200, 0, 100, 0.05)',
      'rgba(0, 200, 200, 0.04)',
    ];
    for (let i = 0; i < 5; i++) {
      this.nebulae.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        r: 80 + Math.random() * 120,
        color: colors[i % colors.length],
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.05,
      });
    }
  }

  _spawnComet() {
    this.comets.push({
      x: -20,
      y: Math.random() * this.h * 0.6,
      vx: 3 + Math.random() * 2,
      vy: 1 + Math.random() * 1.5,
      life: 1.0,
      trail: [],
    });
  }

  render(deltaTime) {
    const ctx = this.ctx;

    // Deep space gradient background
    const bg = ctx.createLinearGradient(0, 0, 0, this.h);
    bg.addColorStop(0, '#02010a');
    bg.addColorStop(0.5, '#050310');
    bg.addColorStop(1, '#080518');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.w, this.h);

    // Nebula clouds
    for (const n of this.nebulae) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -n.r) n.x = this.w + n.r;
      if (n.x > this.w + n.r) n.x = -n.r;
      if (n.y < -n.r) n.y = this.h + n.r;
      if (n.y > this.h + n.r) n.y = -n.r;

      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      grad.addColorStop(0, n.color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
    }

    // Stars with twinkle
    for (const s of this.stars) {
      s.y += s.speed;
      if (s.y > this.h) {
        s.y = 0;
        s.x = Math.random() * this.w;
      }
      s.twinkle += s.twinkleSpeed;
      const alpha = s.baseAlpha * (0.6 + 0.4 * Math.sin(s.twinkle));

      ctx.fillStyle = `rgba(220, 235, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();

      // Glow for brighter stars
      if (s.r > 1) {
        ctx.fillStyle = `rgba(0, 240, 255, ${alpha * 0.2})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Shooting comets
    const now = performance.now();
    if (now - this.lastCometTime > 4000 + Math.random() * 6000) {
      this._spawnComet();
      this.lastCometTime = now;
    }

    for (let i = this.comets.length - 1; i >= 0; i--) {
      const c = this.comets[i];
      c.trail.push({ x: c.x, y: c.y });
      if (c.trail.length > 12) c.trail.shift();
      c.x += c.vx;
      c.y += c.vy;
      c.life -= 0.005;

      // Draw trail
      for (let j = 0; j < c.trail.length; j++) {
        const t = c.trail[j];
        const alpha = (j / c.trail.length) * c.life;
        ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 1.5 * (j / c.trail.length), 0, Math.PI * 2);
        ctx.fill();
      }

      // Comet head
      ctx.fillStyle = `rgba(255, 255, 255, ${c.life})`;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 2, 0, Math.PI * 2);
      ctx.fill();

      if (c.x > this.w + 30 || c.y > this.h + 30 || c.life <= 0) {
        this.comets.splice(i, 1);
      }
    }
  }
}
