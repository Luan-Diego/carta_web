// Motor de áudio da carta (Web Audio API).
// Todos os sons são sintetizados no navegador: não há arquivos de áudio.
// Não depende do Vue.

export function createSound() {
  let ctx = null;
  let master = null;
  let fx = null;
  let noise = null;
  let whoosh = null;
  let enabled = true;

  function init() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = enabled ? 0.9 : 0;
    master.connect(ctx.destination);

    // eco suave para o brilho dos sinos
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.23;
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2800;
    fx = ctx.createGain();
    fx.gain.value = 0.5;
    fx.connect(delay);
    delay.connect(lp);
    lp.connect(fb);
    fb.connect(delay);
    lp.connect(master);

    // ruído branco (base do farfalhar de papel e do "whoosh")
    const len = ctx.sampleRate * 2;
    noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    // "whoosh" contínuo, acompanha a velocidade do giro
    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 0.7;
    bp.frequency.value = 500;
    const g = ctx.createGain();
    g.gain.value = 0;
    src.connect(bp);
    bp.connect(g);
    g.connect(master);
    src.start();
    whoosh = { bp, g };
    return true;
  }

  function unlock() {
    if (!init()) return;
    if (ctx.state === 'suspended') ctx.resume();
  }

  const ready = () => enabled && init();

  /* --- sons básicos --- */
  function thump(t, f = 180, vol = 0.3) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.4, t + 0.14);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + 0.25);
  }

  function tick(t, f = 1200, vol = 0.07) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.6, t + 0.05);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + 0.08);
  }

  // farfalhar de papel: ruído filtrado com pequenos estalos aleatórios
  function rustle(t, dur = 0.5, vol = 0.2, bright = 1) {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1200 * bright;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 4200 * bright;
    bp.Q.value = 0.6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    const n = Math.max(4, Math.round(dur * 22));
    for (let i = 0; i < n; i++) {
      const x = i / n;
      const tt = t + x * dur;
      const a = vol * (0.25 + Math.random() * 0.75) * Math.pow(Math.sin(Math.PI * x), 0.7);
      g.gain.setTargetAtTime(a, tt, 0.004);
      g.gain.setTargetAtTime(a * 0.15, tt + 0.012, 0.01);
    }
    g.gain.setTargetAtTime(0, t + dur, 0.03);
    src.connect(hp);
    hp.connect(bp);
    bp.connect(g);
    g.connect(master);
    src.start(t, Math.random() * 1.5, dur + 0.2);
  }

  // sino suave (fundamental + harmônicos)
  function bell(t, f, vol = 0.1, dur = 1.8) {
    const partials = [
      [1, 1, dur],
      [2.01, 0.28, dur * 0.5],
      [3.99, 0.1, dur * 0.25],
    ];
    for (const [mult, amp, decay] of partials) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f * mult;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol * amp, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      o.connect(g);
      g.connect(master);
      g.connect(fx);
      o.start(t);
      o.stop(t + decay + 0.05);
    }
  }

  /* --- API --- */
  return {
    unlock,
    isEnabled: () => enabled,

    // padrão vindo da configuração; a escolha salva de quem visita vence
    applyDefault(v) {
      enabled = v !== false;
      try {
        const saved = localStorage.getItem('carta:som');
        if (saved) enabled = saved !== 'off';
      } catch {
        /* sem armazenamento: usa o padrão */
      }
      if (ctx) master.gain.value = enabled ? 0.9 : 0;
    },

    setEnabled(v) {
      enabled = v;
      try {
        localStorage.setItem('carta:som', v ? 'on' : 'off');
      } catch {
        /* sem armazenamento: vale só nesta visita */
      }
      if (ctx) master.gain.setTargetAtTime(v ? 0.9 : 0, ctx.currentTime, 0.03);
    },

    ui() {
      if (!ready()) return;
      tick(ctx.currentTime + 0.01, 1000, 0.09);
    },

    // gota d'água suave ("plip"): o tom sobe rápido e some; um eco bem leve
    drop() {
      if (!ready()) return;
      const t = ctx.currentTime + 0.005;
      const f = 520 * (0.92 + Math.random() * 0.16);
      for (const [mult, vol, dur] of [[1, 0.13, 0.16], [2.4, 0.03, 0.07]]) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f * mult, t);
        o.frequency.exponentialRampToValueAtTime(f * mult * 1.9, t + 0.07);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g);
        g.connect(master);
        g.connect(fx);
        o.start(t);
        o.stop(t + dur + 0.05);
      }
    },

    open() {
      if (!ready()) return;
      const t = ctx.currentTime + 0.03;
      thump(t, 190, 0.34); // toque no lacre
      tick(t + 0.01, 1400, 0.07);
      rustle(t + 0.15, 0.55, 0.2, 1.1); // aba abrindo
      rustle(t + 0.8, 0.85, 0.26, 1); // carta subindo
      rustle(t + 1.55, 0.6, 0.18, 0.8); // carta vindo para a frente
      bell(t + 2.0, 783.99, 0.11, 1.8); // arpejo final
      bell(t + 2.14, 1174.66, 0.09, 2.2);
      bell(t + 2.3, 1567.98, 0.06, 2.4);
    },

    close() {
      if (!ready()) return;
      const t = ctx.currentTime + 0.03;
      thump(t, 170, 0.22);
      rustle(t, 0.5, 0.18, 0.8); // carta voltando
      rustle(t + 0.5, 0.7, 0.2, 1); // carta entrando no envelope
      rustle(t + 1.15, 0.5, 0.16, 1.1); // aba fechando
      thump(t + 1.8, 150, 0.3);
      bell(t + 1.85, 587.33, 0.07, 1.2);
    },

    // "whoosh" proporcional à velocidade do giro
    speed(v) {
      if (!ctx || !whoosh) return;
      const now = ctx.currentTime;
      const gain = enabled ? Math.min(0.05, Math.max(0, v - 0.5) * 0.004) : 0;
      whoosh.g.gain.setTargetAtTime(gain, now, 0.06);
      whoosh.bp.frequency.setTargetAtTime(350 + Math.min(v, 14) * 70, now, 0.06);
    },
  };
}
