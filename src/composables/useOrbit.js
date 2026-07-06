import { onBeforeUnmount, ref, watch } from 'vue';

export const INIT = { rx: 8, ry: -22 }; // posição inicial (graus)
const RX_MAX = 70; // inclinação vertical máxima
const AUTO_SPEED = 0.35; // giro automático, graus por quadro (~21°/s)
const DRAG_SENS = 0.45; // graus por pixel arrastado

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// Rotação 3D: arraste com inércia, giro automático, animações até um alvo.
// O estado de animação (s) fica fora do sistema reativo de propósito, porque muda
// a cada quadro; o DOM é atualizado direto, sem re-renderizar componentes.
export function useOrbit({ orbitEl, shadowEl, auto, onPress = () => {}, onSpeed = () => {}, onTap = () => {}, canTap = () => true }) {
  const dragging = ref(false);
  const s = { rx: INIT.rx, ry: INIT.ry, vx: 0, vy: 0, target: null, held: false, brake: false };
  let raf = 0;
  let last = 0;
  let down = null;

  const reduceMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function render() {
    if (!orbitEl.value) return;
    orbitEl.value.style.transform = `rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg)`;
    const c = Math.abs(Math.cos((s.ry * Math.PI) / 180));
    shadowEl.value?.style.setProperty('--sx', (0.5 + 0.5 * c).toFixed(3));
  }

  function frame(now) {
    const dt = Math.min(2.5, (now - last) / 16.667 || 1);
    last = now;

    if (s.held) {
      const f = Math.pow(0.85, dt);
      s.vx *= f;
      s.vy *= f;
    } else if (s.target) {
      const k = 1 - Math.pow(0.88, dt);
      s.rx += (s.target.rx - s.rx) * k;
      s.ry += (s.target.ry - s.ry) * k;
      s.vx = s.vy = 0;
      if (Math.abs(s.target.rx - s.rx) < 0.05 && Math.abs(s.target.ry - s.ry) < 0.05) {
        s.rx = s.target.rx;
        s.ry = s.target.ry;
        s.target = null;
      }
    } else {
      if (auto.value) {
        s.vy += (AUTO_SPEED - s.vy) * (1 - Math.pow(0.95, dt));
        s.vx *= Math.pow(0.94, dt);
      } else {
        const f = Math.pow(s.brake ? 0.8 : 0.94, dt); // brake: parada rápida ao apertar "parar"
        s.vx *= f;
        s.vy *= f;
      }
      s.rx += s.vx * dt;
      s.ry += s.vy * dt;
    }

    if (Math.abs(s.rx) > RX_MAX) {
      s.rx = clamp(s.rx, -RX_MAX, RX_MAX);
      s.vx = 0;
    }

    render();
    const speed = Math.hypot(s.vx, s.vy);
    const moving = s.held || s.target || auto.value;
    onSpeed(moving || speed > 0.05 ? speed : 0);

    if (moving || speed > 0.02) {
      raf = requestAnimationFrame(frame);
    } else {
      raf = 0;
      onSpeed(0);
    }
  }

  function wake() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function goTo(rx, ry) {
    s.target = { rx: clamp(rx, -RX_MAX, RX_MAX), ry };
    wake();
  }

  // gira um pouco a partir da posição atual (ou do alvo em andamento)
  function nudge(drx, dry) {
    const base = s.target || s;
    goTo(base.rx + drx, base.ry + dry);
  }

  // volta à posição inicial pelo caminho mais curto
  function resetView() {
    const turns = Math.round((s.ry - INIT.ry) / 360);
    goTo(INIT.rx, INIT.ry + turns * 360);
  }

  // entrada: o envelope "chega" girando até a posição inicial
  function intro() {
    if (reduceMotion) {
      render();
      return;
    }
    s.rx = 20;
    s.ry = -80;
    render();
    goTo(INIT.rx, INIT.ry);
  }

  /* ---- ponteiro (mouse e toque): arrastar gira, toque simples vira onTap ---- */
  function onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    onPress();
    const now = performance.now();
    down = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      lx: e.clientX,
      ly: e.clientY,
      t: now,
      lt: now,
      moved: false,
      onModel: !!e.target.closest?.('.envelope'),
      onPaper: !!e.target.closest?.('.paper'),
    };
    s.held = true;
    s.brake = false;
    s.target = null;
    dragging.value = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* sem captura: o arraste continua funcionando dentro do elemento */
    }
    wake();
  }

  function onPointerMove(e) {
    if (!down || e.pointerId !== down.id) return;
    if (!down.moved) {
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6) return;
      down.moved = true;
    }
    const now = performance.now();
    const f = Math.max(0.5, (now - down.lt) / 16.667);
    const dry = (e.clientX - down.lx) * DRAG_SENS;
    const drx = -(e.clientY - down.ly) * DRAG_SENS;
    s.ry += dry;
    s.rx = clamp(s.rx + drx, -RX_MAX, RX_MAX);
    s.vy = s.vy * 0.4 + (dry / f) * 0.6;
    s.vx = s.vx * 0.4 + (drx / f) * 0.6;
    down.lx = e.clientX;
    down.ly = e.clientY;
    down.lt = now;
    render();
  }

  function onPointerEnd(e) {
    if (!down || e.pointerId !== down.id) return;
    const now = performance.now();
    const isTap = canTap() && !down.moved && now - down.t < 600 && down.onModel && e.type === 'pointerup';
    if (now - down.lt > 80) s.vx = s.vy = 0; // parou antes de soltar: sem inércia
    const { onPaper } = down;
    s.held = false;
    dragging.value = false;
    down = null;
    if (isTap) {
      s.vx = s.vy = 0;
      onTap({ onPaper });
    }
    wake();
  }

  // giro automático ligado/desligado
  watch(auto, (on) => {
    s.brake = !on; // ao parar, freia rápido e fica estática
    if (on) s.target = null; // o giro automático assume
    wake();
  });

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf);
    raf = 0;
    onSpeed(0);
  });

  return { dragging, onPointerDown, onPointerMove, onPointerEnd, nudge, resetView, intro };
}
