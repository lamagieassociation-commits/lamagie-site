/* ============================================================
   L'AMAGIE — JS CINÉMATIQUE (renforcé)
   Étoiles, constellations, poussières, comètes, vaisseaux glissants
   ============================================================ */

(function(){
  // === MENU HAMBURGER ===
  const burgerHotspot = document.querySelector('.h-burger');
  const menuOverlay = document.querySelector('.menu-overlay');
  const closeBtn = document.querySelector('.menu-overlay .close');

  if(burgerHotspot && menuOverlay){
    burgerHotspot.addEventListener('click', (e) => {
      e.preventDefault();
      menuOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }
  if(closeBtn && menuOverlay){
    closeBtn.addEventListener('click', () => {
      menuOverlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
  // Clic en dehors pour fermer
  if(menuOverlay){
    menuOverlay.addEventListener('click', (e) => {
      if(e.target === menuOverlay){
        menuOverlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
  // Échap pour fermer
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && menuOverlay && menuOverlay.classList.contains('open')){
      menuOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // === ANIMATIONS CANVAS ===
  const wrap = document.querySelector('.portal-wrap');
  const img = document.querySelector('.portal-img');
  const canvas = document.getElementById('cinemaCanvas');
  if(!wrap || !img || !canvas) return;
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let W=0, H=0, DPR=1;
  let stars=[], dust=[], nodes=[], comets=[], glidingShips=[];
  let mouse={x:.5, y:.5};

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX / innerWidth;
    mouse.y = e.clientY / innerHeight;
  }, {passive:true});

  function setup(){
    const rect = wrap.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width;
    H = rect.height || W * 0.75;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // Étoiles avec vie indépendante (120)
    stars = Array.from({length: 120}, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: .28 + Math.random() * 1.3,
      p: Math.random() * Math.PI * 2,
      s: .003 + Math.random() * .018,
      gold: Math.random() > .38
    }));

    // Poussières d'or qui montent
    dust = Array.from({length: 78}, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: .25 + Math.random() * .9,
      vx: (Math.random() - .5) * .045,
      vy: -.014 - Math.random() * .03,
      a: .025 + Math.random() * .07
    }));

    // Constellations (32 nœuds)
    nodes = Array.from({length: 32}, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      p: Math.random() * Math.PI * 2,
      s: .001 + Math.random() * .003
    }));

    // Comètes (2 qui passent rarement)
    comets = [
      {x: -.15 * W, y: .28 * H, vx: .18, vy: .045, len: 170, a: 0, delay: 200},
      {x: 1.10 * W, y: .70 * H, vx: -.14, vy: -.035, len: 145, a: 0, delay: 1100}
    ];

    // Vaisseaux qui glissent vraiment en boucle
    glidingShips = [
      {x: -.2 * W, y: .14 * H, vx: .35, scale: .58, flip: false, alpha: .26, color: '255,215,140'},
      {x: 1.2 * W, y: .07 * H, vx: -.28, scale: .52, flip: true, alpha: .22, color: '180,210,255'},
      {x: -.3 * W, y: .82 * H, vx: .42, scale: .45, flip: false, alpha: .18, color: '255,215,140', delay: 800}
    ];
  }

  function halo(x, y, r, a, color = '217,191,114'){
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${color},${a})`);
    g.addColorStop(.35, `rgba(${color},${a*.32})`);
    g.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawShip(x, y, scale, flip, alpha, colorRgb){
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flip ? -scale : scale, scale);
    ctx.globalAlpha = alpha;
    // Corps doré
    ctx.strokeStyle = 'rgba(217,191,114,.55)';
    ctx.fillStyle = 'rgba(6,12,22,.6)';
    ctx.lineWidth = .9;
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Coque interne lumineuse
    ctx.beginPath();
    ctx.ellipse(8, 0, 17, 4.5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${colorRgb || '111,184,255'},.6)`;
    ctx.stroke();
    // Cœur
    ctx.beginPath();
    ctx.ellipse(8, 0, 5, 1.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${colorRgb || '111,184,255'},.4)`;
    ctx.fill();
    // Traînée
    const g = ctx.createLinearGradient(-100, 0, -32, 0);
    g.addColorStop(0, `rgba(${colorRgb || '111,184,255'},0)`);
    g.addColorStop(1, `rgba(${colorRgb || '111,184,255'},.45)`);
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-100, 0);
    ctx.lineTo(-32, 0);
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  let t0 = performance.now();
  function draw(now){
    if(!W || !H) setup();
    const t = now - t0;
    ctx.clearRect(0, 0, W, H);

    // === HALOS LUMINEUX sur zones clés de l'image ===
    const pulse = .5 + Math.sin(t * .0011) * .5;
    const pulseSlow = .5 + Math.sin(t * .0006) * .5;
    // Halo central sur l'astrolabe (en haut au centre)
    halo(W * .50, H * .155, 100 + pulseSlow * 28, .07 + pulse * .045);
    // Halo doré pulsant sur le LIVRE OUVERT (à droite)
    halo(W * .76, H * .47, 130 + pulse * 38, .09 + pulse * .055);
    // Halo doux sur le bas de l'image (mail box)
    halo(W * .50, H * .92, 130 + pulseSlow * 32, .055 + pulseSlow * .035);
    // Halo sur les escaliers de livres (gauche)
    halo(W * .14, H * .55, 90 + pulseSlow * 18, .04 + pulseSlow * .025);
    // Halo très subtil sur le TITRE L'AMAGIE (zone centrale haute)
    halo(W * .50, H * .28, 180 + pulse * 40, .035 + pulse * .025, '240,220,155');

    // === CONSTELLATIONS FINES ===
    for(let i = 0; i < nodes.length; i++){
      const a = nodes[i];
      const ax = a.x + Math.sin(t * a.s + a.p) * 4;
      const ay = a.y + Math.cos(t * a.s + a.p) * 4;
      for(let j = i + 1; j < nodes.length; j++){
        const b = nodes[j];
        const bx = b.x + Math.sin(t * b.s + b.p) * 4;
        const by = b.y + Math.cos(t * b.s + b.p) * 4;
        const d = Math.hypot(ax - bx, ay - by);
        if(d < 130){
          ctx.strokeStyle = `rgba(217,191,114,${(1 - d / 130) * .13})`;
          ctx.lineWidth = .45;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
      }
    }

    // === ÉTOILES SCINTILLANTES ===
    stars.forEach(st => {
      st.p += st.s;
      const alpha = .10 + Math.sin(st.p) * .24;
      const col = st.gold ? '217,191,114' : '111,184,255';
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${col},${Math.max(alpha, .04)})`;
      ctx.fill();
      if(st.r > 1.05 && alpha > .12){
        halo(st.x, st.y, st.r * 5.5, alpha * .2, col);
      }
    });

    // === POUSSIÈRES LUMINEUSES ===
    dust.forEach(d => {
      d.x += d.vx;
      d.y += d.vy;
      if(d.y < -10){ d.y = H + 10; d.x = Math.random() * W; }
      if(d.x < -10) d.x = W + 10;
      if(d.x > W + 10) d.x = -10;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240,220,155,${d.a})`;
      ctx.fill();
    });

    // === COMÈTES ===
    comets.forEach(c => {
      if(c.delay > 0){ c.delay--; return; }
      c.x += c.vx;
      c.y += c.vy;
      c.a = Math.min(.55, c.a + .008);
      const ang = Math.atan2(c.vy, c.vx);
      const tx = c.x - Math.cos(ang) * c.len;
      const ty = c.y - Math.sin(ang) * c.len;
      const grad = ctx.createLinearGradient(c.x, c.y, tx, ty);
      grad.addColorStop(0, `rgba(255,248,220,${c.a})`);
      grad.addColorStop(.2, `rgba(217,191,114,${c.a*.55})`);
      grad.addColorStop(1, 'rgba(217,191,114,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      if(c.x > W + 220 || c.x < -220 || c.y < -160 || c.y > H + 160){
        c.x = c.vx > 0 ? -180 : W + 180;
        c.y = (.18 + Math.random() * .55) * H;
        c.delay = 1100 + Math.floor(Math.random() * 1400);
        c.a = 0;
      }
    });

    // === VAISSEAUX QUI GLISSENT (en boucle lente) ===
    const mx = (mouse.x - .5) * 12, my = (mouse.y - .5) * 8;
    glidingShips.forEach((s, i) => {
      if(s.delay && s.delay > 0){ s.delay--; return; }
      s.x += s.vx;
      // boucle
      if(s.vx > 0 && s.x > W + 250){ s.x = -250; s.y = (.05 + Math.random() * .85) * H; }
      if(s.vx < 0 && s.x < -250){ s.x = W + 250; s.y = (.05 + Math.random() * .85) * H; }
      const offsetX = (i === 0 ? mx * .5 : i === 1 ? -mx * .5 : mx * .3);
      const offsetY = (i === 0 ? my * .4 : i === 1 ? -my * .4 : my * .3);
      drawShip(s.x + offsetX, s.y + offsetY, s.scale, s.flip, s.alpha, s.color);
    });

    requestAnimationFrame(draw);
  }

  if(img.complete) setup();
  img.addEventListener('load', setup);
  window.addEventListener('resize', setup, {passive: true});
  requestAnimationFrame(draw);
})();
