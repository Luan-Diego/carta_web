import { onBeforeUnmount, onMounted, watch } from 'vue';
import { createScene, hasScene } from '../lib/scenes/index.js';

// Liga uma cena animada (lib/scenes) a um <canvas>: tamanho, laço de animação,
// ponteiro e toques. Roda fora da reatividade do Vue (só desenha no canvas).
const MAX_DPR = 2;
const IGNORE = 'button, a, input, textarea, select, [role="dialog"]';

export function useScene(canvas, tipo, dark, matiz) {
  const ptr = { x: -9999, y: -9999, vx: 0, vy: 0 };
  let ctx = null, scene = null, host = null, ro = null;
  let raf = 0, last = 0, w = 0, h = 0, dpr = 1, token = 0, px = 0, py = 0, pt = 0;
  const reduce = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  function size() {
    const el = canvas.value;
    if (!el) return;
    w = el.clientWidth;
    h = el.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    el.width = Math.max(1, Math.round(w * dpr));
    el.height = Math.max(1, Math.round(h * dpr));
    scene?.resize(w, h);
    if (scene && !raf) paint();
  }

  function paint() {
    if (!ctx || !scene) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    scene.draw(ctx);
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000 || 0, 0.05) * (reduce.matches ? 0.5 : 1);
    last = now;
    const k = Math.exp(-4 * dt); // a velocidade do ponteiro some quando ele para
    ptr.vx *= k;
    ptr.vy *= k;
    scene.step(dt, ptr);
    paint();
  }

  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  // Os fundos são decorativos e escolhidos pelo usuário: sempre se movem. Com
  // "reduzir movimento" no sistema (no Windows: efeitos de animação desligados),
  // só ficam mais lentos, em vez de parar num quadro.
  function run() {
    stop();
    if (!scene) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  async function load() {
    const my = ++token;
    stop();
    scene?.destroy?.();
    scene = null;
    ctx?.clearRect(0, 0, canvas.value?.width || 0, canvas.value?.height || 0);
    if (!canvas.value || !hasScene(tipo.value)) return;
    size();
    try {
      const s = await createScene(tipo.value, w || 1, h || 1, dark.value, matiz ? matiz.value : -1);
      if (my !== token) return;
      scene = s;
      size(); // o canvas pode ter ficado visível só agora: mede de novo
      run();
    } catch {
      /* sem cena: fica só o degradê */
    }
  }

  function local(e) {
    const r = canvas.value.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }
  function onMove(e) {
    const [x, y] = local(e);
    const dt = (e.timeStamp - pt) / 1000;
    if (pt && dt > 0 && dt < 0.2) {
      ptr.vx = ptr.vx * 0.6 + Math.max(-2500, Math.min(2500, (x - px) / dt)) * 0.4;
      ptr.vy = ptr.vy * 0.6 + Math.max(-2500, Math.min(2500, (y - py) / dt)) * 0.4;
    }
    px = x; py = y; pt = e.timeStamp;
    ptr.x = x; ptr.y = y;
  }
  function onLeave() {
    ptr.x = ptr.y = -9999;
    pt = 0;
  }
  function onDown(e) {
    onMove(e);
    if (e.target.closest?.(IGNORE)) return;
    scene?.tap(ptr.x, ptr.y);
  }
  function onUp(e) {
    if (e.pointerType === 'touch') onLeave(); // no toque, o "ponteiro" some ao soltar o dedo
  }
  function onVisibility() {
    if (document.hidden) stop();
    else if (scene && !raf) run();
  }

  onMounted(() => {
    ctx = canvas.value.getContext('2d');
    host = canvas.value.closest('.player') || canvas.value.parentElement;
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerdown', onDown, { passive: true });
    host.addEventListener('pointerup', onUp, { passive: true });
    host.addEventListener('pointercancel', onUp, { passive: true });
    host.addEventListener('pointerleave', onLeave, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    ro = new ResizeObserver(size);
    ro.observe(canvas.value);
    load();
  });

  watch([tipo, dark, matiz || dark], load, { flush: 'post' }); // depois do DOM: o canvas já está visível

  onBeforeUnmount(() => {
    token++;
    stop();
    scene?.destroy?.();
    ro?.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    if (host) {
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerdown', onDown);
      host.removeEventListener('pointerup', onUp);
      host.removeEventListener('pointercancel', onUp);
      host.removeEventListener('pointerleave', onLeave);
    }
  });
}
