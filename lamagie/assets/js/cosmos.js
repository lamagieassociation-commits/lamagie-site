/* ============================================================
   L'AMAGIE — COSMOS.JS
   Le monde permanent pour les pages internes du site.
   ============================================================ */

(function(){
'use strict';

const canvas = document.getElementById('cosmosCanvas');
if(!canvas) return;
const ctx = canvas.getContext('2d');

function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Étoiles indépendantes (130)
const stars = [];
for(let i=0; i<130; i++){
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.3,
    pulseT: Math.random() * Math.PI * 2,
    pulseSpeed: 0.008 + Math.random() * 0.025,
    color: Math.random() > 0.55 ? [255,255,255] : (Math.random() > 0.5 ? [217,191,114] : [240,220,155]),
    baseAlpha: 0.3 + Math.random() * 0.3
  });
}

// Poussières dorées qui montent
const dust = [];
for(let i=0; i<50; i++){
  dust.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 0.25 + Math.random() * 0.8,
    vx: (Math.random() - 0.5) * 0.05,
    vy: -0.012 - Math.random() * 0.025,
    a: 0.025 + Math.random() * 0.06
  });
}

// Arcs astrologiques
const arcs = [
  {cp1x:0.15, cp1y:0.5, cp2x:0.85, cp2y:0.5, y1:0.3, y2:0.3, phase:0, duration:20000, color:'rgba(217,191,114,.45)'},
  {cp1x:0.2, cp1y:0.95, cp2x:0.8, cp2y:0.95, y1:0.75, y2:0.7, phase:8000, duration:24000, color:'rgba(217,191,114,.4)'},
  {cp1x:0.75, cp1y:0.5, cp2x:0.25, cp2y:0.5, y1:0.1, y2:0.85, phase:14000, duration:28000, color:'rgba(240,220,155,.35)'},
];

let t0 = performance.now();

function halo(x, y, r, a, col){
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${col},${a})`);
  g.addColorStop(0.35, `rgba(${col},${a*0.32})`);
  g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function draw(now){
  const t = now - t0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ÉTOILES
  stars.forEach(s => {
    s.pulseT += s.pulseSpeed;
    const pulse = (Math.sin(s.pulseT) + 1) / 2;
    const alpha = s.baseAlpha + pulse * 0.55;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${Math.min(alpha, 0.95)})`;
    ctx.fill();
    if(s.r > 0.9){
      halo(s.x, s.y, s.r * (4 + pulse * 2), alpha * 0.3, `${s.color[0]},${s.color[1]},${s.color[2]}`);
    }
  });

  // POUSSIÈRES
  dust.forEach(d => {
    d.x += d.vx;
    d.y += d.vy;
    if(d.y < -10){ d.y = canvas.height + 10; d.x = Math.random() * canvas.width; }
    if(d.x < -10) d.x = canvas.width + 10;
    if(d.x > canvas.width + 10) d.x = -10;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(240,220,155,${d.a})`;
    ctx.fill();
  });

  // ARCS ASTROLOGIQUES
  arcs.forEach(a => {
    const localT = ((t + a.phase) % a.duration) / a.duration;
    if(localT < 0.04) return;
    const progress = Math.min((localT - 0.04) / 0.55, 1);
    const fadeOut = localT > 0.75 ? Math.max(0, 1 - (localT - 0.75) / 0.25) : 1;
    const W = canvas.width, H = canvas.height;
    const x1 = 0.05 * W, x2 = 0.95 * W;
    const y1 = a.y1 * H, y2 = a.y2 * H;
    const cp1x = a.cp1x * W, cp1y = a.cp1y * H;
    const cp2x = a.cp2x * W, cp2y = a.cp2y * H;
    const steps = 70;
    const drawnSteps = Math.floor(steps * progress);
    if(drawnSteps < 2) return;
    ctx.beginPath();
    for(let i=0; i<=drawnSteps; i++){
      const u = i / steps;
      const x = Math.pow(1-u,3)*x1 + 3*Math.pow(1-u,2)*u*cp1x + 3*(1-u)*u*u*cp2x + u*u*u*x2;
      const y = Math.pow(1-u,3)*y1 + 3*Math.pow(1-u,2)*u*cp1y + 3*(1-u)*u*u*cp2y + u*u*u*y2;
      if(i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    const baseAlpha = parseFloat(a.color.match(/[\d.]+\)$/)[0]);
    ctx.strokeStyle = a.color.replace(/[\d.]+\)$/, (baseAlpha * fadeOut).toFixed(3) + ')');
    ctx.lineWidth = 0.9;
    ctx.stroke();
  });

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

/* RÉACTION AU SCROLL */
const veil = document.querySelector('.bg-veil-base');
const navEl = document.querySelector('nav');
const ships = document.querySelectorAll('.ship');
let scrollTicking = false;

function onScroll(){
  const sy = window.scrollY;
  const dh = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const ratio = Math.min(1, sy / dh);
  if(veil){
    const middleness = 1 - Math.abs(ratio - 0.5) * 2;
    const op = 0.5 + middleness * 0.15;
    veil.style.background = `rgba(2,4,10,${op.toFixed(3)})`;
  }
  if(navEl){
    if(sy > 60) navEl.classList.add('scrolled');
    else navEl.classList.remove('scrolled');
  }
  ships.forEach((sh, i) => {
    const factor = 0.04 + (i % 3) * 0.015;
    sh.style.translate = `0 ${-(sy * factor).toFixed(1)}px`;
  });
}
window.addEventListener('scroll', () => {
  if(!scrollTicking){
    requestAnimationFrame(() => { onScroll(); scrollTicking = false; });
    scrollTicking = true;
  }
}, {passive: true});
onScroll();

/* RÉVÉLATION DES SECTIONS */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      e.target.classList.add('vis');
      obs.unobserve(e.target);
    }
  });
}, {threshold: 0.12, rootMargin: '0px 0px -50px 0px'});
document.querySelectorAll('.reveal, .reveal-slow').forEach(el => obs.observe(el));

/* MENU MOBILE */
const burger = document.querySelector('.burger');
const mob = document.getElementById('mm');
const mc = document.querySelector('.mc');
if(burger && mob) burger.addEventListener('click', () => mob.classList.add('open'));
if(mc && mob) mc.addEventListener('click', () => mob.classList.remove('open'));
document.querySelectorAll('.mob a').forEach(a => a.addEventListener('click', () => mob && mob.classList.remove('open')));

})();
