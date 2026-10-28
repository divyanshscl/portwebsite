/**
 * Math, color, and canvas scaling utilities.
 */

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
}

export function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Convert degrees to radians. */
export function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

/** Format a 2-digit number with leading zero. */
export function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * Resize a canvas element to its CSS display size with devicePixelRatio
 * backing-store scaling. Returns true if the backing store changed.
 */
export function fitCanvasToDevicePixelRatio(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.floor(rect.width * dpr));
  const h = Math.max(1, Math.floor(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    return true;
  }
  return false;
}

/** Simple timestamp formatter for debug overlays. */
export function formatTime(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}
