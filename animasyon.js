// VUSLAT FM - Tema Animasyon Sistemi (v2 - bağımsız denetim düzeltmesi)
// studyo: camda yağmur + seyrek şimşek | araba: ön cam yağmuru + şimşek | bahar: kelebek + yaprak + göl
// Tüm efektler #site-content ARKASINDA (z-index:0) çalışır: "yağmur içeri düşmez".
// prefers-reduced-motion: tüm efektler devre dışı. Sekme gizliyken RAF durur (pil dostu).
(() => {
  'use strict';

  const state = {
    current: null, raf: 0, layer: null, canvas: null, ctx: null,
    w: 0, h: 0, last: 0, lightningAt: 0, flash: 0,
    drops: [], blobs: [], flies: [], petals: [],
    reducedMQ: window.matchMedia('(prefers-reduced-motion: reduce)')
  };

  const rand = (a, b) => a + Math.random() * (b - a);

  function setup() {
    if (state.canvas) return true;
    const layer = document.createElement('div');
    layer.id = 'tema-animasyon';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;';
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    layer.appendChild(canvas);
    document.body.appendChild(layer);
    state.layer = layer; state.canvas = canvas; state.ctx = canvas.getContext('2d');
    if (!state.ctx) { teardown(); return false; }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.dpr = dpr;
    state.resize = () => {
      state.w = window.innerWidth; state.h = window.innerHeight;
      canvas.width = Math.max(1, Math.round(state.w * dpr));
      canvas.height = Math.max(1, Math.round(state.h * dpr));
      state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    state.resize();
    window.addEventListener('resize', state.resize);
    return true;
  }

  function teardown() {
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = 0;
    if (state._vis) document.removeEventListener('visibilitychange', state._vis);
    state._vis = null;
    if (state._red) state.reducedMQ.removeEventListener('change', state._red);
    state._red = null;
    if (state.layer && state.layer.parentNode) state.layer.parentNode.removeChild(state.layer);
    state.layer = null; state.canvas = null; state.ctx = null; state.current = null;
    state.drops = []; state.blobs = []; state.flies = []; state.petals = [];
  }

  // ---------- STÜDYO + ARABA: YAĞMUR ----------
  function seedRain(steeper) {
    const area = state.w * state.h;
    const n = Math.min(220, Math.max(70, Math.round(area / 9000)));
    state.drops = [];
    for (let i = 0; i < n; i++) {
      state.drops.push({
        x: rand(0, state.w), y: rand(-state.h, state.h),
        len: rand(9, 22), v: steeper ? rand(620, 980) : rand(420, 760),
        a: rand(0.18, 0.5), w: rand(0.8, 1.6)
      });
    }
    // Cam damlaları (yalnız studyo - sabit iç mekan hissi)
    state.blobs = [];
    if (!steeper) {
      const bn = Math.min(14, Math.max(6, Math.round(state.w / 140)));
      for (let i = 0; i < bn; i++) {
        state.blobs.push({ x: rand(0, state.w), y: rand(0, state.h), r: rand(2, 5), v: rand(6, 18), ph: rand(0, 6.28) });
      }
    }
    state.lightningAt = performance.now() + rand(4000, 12000);
  }

  function drawRain(steep, accent) {
    const ctx = state.ctx, now = performance.now();
    const dt = Math.min(0.05, (now - state.last) / 1000 || 0.016);
    state.last = now;
    ctx.clearRect(0, 0, state.w, state.h);
    const wind = steep ? state.w * 0.16 : state.w * 0.045;

    // şimşek zamanlaması
    if (now >= state.lightningAt && state.flash <= 0) {
      state.flash = 1;
      state.lightningAt = now + rand(6000, 15000);
    }
    if (state.flash > 0) {
      // çift titreme: 1 -> 0.35 -> 0.75 -> 0
      const f = state.flash;
      const alpha = f > 0.7 ? f : (f > 0.45 ? 0.35 : f * 0.75);
      ctx.fillStyle = 'rgba(210,225,255,' + (alpha * 0.5).toFixed(3) + ')';
      ctx.fillRect(0, 0, state.w, state.h);
      state.flash -= dt * 3.2;
      if (state.flash < 0) state.flash = 0;
    }

    ctx.lineCap = 'round';
    for (const d of state.drops) {
      d.y += d.v * dt; d.x += wind * dt;
      if (d.y > state.h + 30) { d.y = rand(-80, -10); d.x = rand(-wind * 0.5, state.w); }
      if (d.x > state.w + 20) d.x = -10;
      ctx.strokeStyle = 'rgba(190,214,238,' + d.a.toFixed(3) + ')';
      ctx.lineWidth = d.w;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - wind * 0.022 * d.len, d.y + d.len);
      ctx.stroke();
    }
    // cam damlaları (studyo)
    for (const b of state.blobs) {
      b.y += b.v * dt; b.ph += dt * 2;
      const bx = b.x + Math.sin(b.ph) * 2.5;
      if (b.y > state.h + 10) { b.y = -10; b.x = rand(0, state.w); }
      ctx.strokeStyle = 'rgba(220,236,250,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(bx, b.y, b.r, 0, 6.29); ctx.stroke();
      ctx.fillStyle = 'rgba(220,236,250,0.16)';
      ctx.beginPath(); ctx.arc(bx, b.y, b.r * 0.7, 0, 6.29); ctx.fill();
    }
  }

  // ---------- BAHAR ----------
  function seedBahar() {
    const area = state.w * state.h;
    const fb = Math.min(9, Math.max(4, Math.round(area / 160000)));
    const fp = Math.min(26, Math.max(12, Math.round(area / 40000)));
    state.flies = [];
    for (let i = 0; i < fb; i++) {
      state.flies.push({
        x: rand(0, state.w), y: rand(state.h * 0.15, state.h * 0.7),
        s: rand(0.55, 1.1), ph: rand(0, 6.28), sp: rand(0.5, 1.1),
        hue: Math.random() < 0.5 ? 0 : 1, dir: Math.random() < 0.5 ? 1 : -1
      });
    }
    state.petals = [];
    for (let i = 0; i < fp; i++) {
      state.petals.push({
        x: rand(0, state.w), y: rand(-state.h, state.h),
        s: rand(0.6, 1.3), v: rand(18, 42), ph: rand(0, 6.28),
        sw: rand(14, 34), rot: rand(0, 6.28), vr: rand(-0.8, 0.8),
        kind: Math.random() < 0.5 ? 0 : 1
      });
    }
  }

  function drawButterfly(ctx, f, t) {
    const flap = Math.sin(t * 7 * f.sp + f.ph);
    const wing = 0.35 + Math.abs(flap) * 0.65; // kanat açıklığı 0..1
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.scale(f.dir * f.s, f.s);
    // gövde
    ctx.strokeStyle = 'rgba(70,50,35,0.9)';
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(0, 4); ctx.stroke();
    // antenler
    ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(2, -6); ctx.moveTo(0, -3); ctx.lineTo(-2, -6); ctx.stroke();
    // kanatlar (üst + alt, çift taraf tek perspektiften)
    const c1 = f.hue ? 'rgba(255,182,193,' : 'rgba(174,216,255,';
    for (const sgn of [-1, 1]) {
      ctx.fillStyle = c1 + (0.55 + 0.25 * wing) + ')';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(sgn * 7 * wing, -7 * wing, sgn * 11 * wing, -4 * wing, sgn * 5 * wing, -1);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c1 + (0.4 + 0.2 * wing) + ')';
      ctx.beginPath();
      ctx.moveTo(0, 1);
      ctx.bezierCurveTo(sgn * 5 * wing, 3 * wing + 2, sgn * 8 * wing, 5, sgn * 3, 4);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function drawBahar(t) {
    const ctx = state.ctx, dt = Math.min(0.05, (t - state.last) / 1000 || 0.016);
    state.last = t;
    ctx.clearRect(0, 0, state.w, state.h);

    // yaprak / taç yaprağı
    for (const p of state.petals) {
      p.y += p.v * dt; p.ph += dt * 1.4; p.rot += p.vr * dt;
      const x = p.x + Math.sin(p.ph) * p.sw;
      if (p.y > state.h + 20) { p.y = rand(-60, -10); p.x = rand(0, state.w); }
      ctx.save();
      ctx.translate(x, p.y); ctx.rotate(p.rot); ctx.scale(p.s, p.s);
      if (p.kind) { // taç yaprağı (pembe)
        ctx.fillStyle = 'rgba(255,183,197,0.8)';
      } else { // yaprak (yeşil)
        ctx.fillStyle = 'rgba(126,188,145,0.8)';
      }
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.bezierCurveTo(4.5, -4, 4.5, 3, 0, 6);
      ctx.bezierCurveTo(-4.5, 3, -4.5, -4, 0, -5);
      ctx.fill();
      ctx.restore();
    }

    // göl parıltısı: alt %22'de yatay dalga çizgileri
    const top = state.h * 0.78;
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 7; i++) {
      const y = top + i * (state.h * 0.032);
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.10 - i * 0.010).toFixed(3) + ')';
      ctx.beginPath();
      for (let x = 0; x <= state.w; x += 26) {
        const yy = y + Math.sin(x * 0.02 + t * 0.0012 + i * 1.7) * (2 + i * 0.5);
        x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }

    // kelebekler en üstte
    for (const f of state.flies) {
      f.x += Math.sin(t * 0.0006 * f.sp + f.ph) * 22 * dt * 3;
      f.y += Math.cos(t * 0.0009 * f.sp + f.ph) * 10 * dt * 3;
      if (f.x > state.w + 30) f.x = -30; if (f.x < -30) f.x = state.w + 30;
      if (f.y > state.h * 0.85) f.y = state.h * 0.15;
      if (f.y < state.h * 0.08) f.y = state.h * 0.7;
      drawButterfly(ctx, f, t);
    }
  }

  // ---------- ANA DÖNGÜ ----------
  function loop(t) {
    if (!state.current) return;
    if (!document.hidden) {
      if (state.current === 'studyo') drawRain(false, '#7dd3fc');
      else if (state.current === 'araba') drawRain(true, '#f5a623');
      else if (state.current === 'bahar') drawBahar(t);
    }
    state.raf = requestAnimationFrame(loop);
  }

  // ---------- API ----------
  function startThemeAnimations(themeId) {
    stopThemeAnimations();
    if (state.reducedMQ.matches) return; // hareket azaltma: efekt yok
    const kind = themeId === 'studyo' || themeId === 'araba' ? 'rain' : themeId === 'bahar' ? 'bahar' : null;
    if (!kind) return; // eski temalarda tema-özel efekt yok (video/süslemeler var)
    if (!setup()) return;
    state.current = themeId;
    state.last = performance.now();
    if (kind === 'rain') seedRain(themeId === 'araba');
    else seedBahar();
    state._red = () => { if (state.reducedMQ.matches) stopThemeAnimations(); };
    state.reducedMQ.addEventListener('change', state._red);
    state._vis = () => { state.last = performance.now(); };
    document.addEventListener('visibilitychange', state._vis);
    state.raf = requestAnimationFrame(loop);
  }

  function stopThemeAnimations() { teardown(); }

  window.addEventListener('pagehide', stopThemeAnimations); // tema değişimi/gidiş temizliği
  window.startThemeAnimations = startThemeAnimations;
  window.stopThemeAnimations = stopThemeAnimations;
  // Test kancasi: gorunur pencere olmadan da dogrulanabilir tek kare cizim
  window.__vuslatAnimTest = {
    renderOnce(themeId) {
      if (!setup()) return { err: 'setup basarisiz' };
      // gercel akista teardown + seed sirasi boyle isler: state tamamen temizlenir
      if (state.raf) cancelAnimationFrame(state.raf);
      state.raf = 0;
      state.drops = []; state.blobs = []; state.flies = []; state.petals = [];
      state.current = themeId; state.last = performance.now();
      if (themeId === 'studyo') { seedRain(false); drawRain(false, '#7dd3fc'); }
      else if (themeId === 'araba') { seedRain(true); drawRain(true, '#f5a623'); }
      else if (themeId === 'bahar') { seedBahar(); drawBahar(performance.now()); }
      else { state.current = null; return { err: 'bilinmeyen tema' }; }
      const c = state.canvas;
      const d = state.ctx.getImageData(0, 0, Math.min(500, c.width), Math.min(400, c.height)).data;
      let painted = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 0) painted++;
      return { boyananPiksel: painted, drops: state.drops.length, blobs: state.blobs.length, flies: state.flies.length, petals: state.petals.length };
    }
  };
})();