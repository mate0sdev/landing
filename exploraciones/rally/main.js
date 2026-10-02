import { PROFILE, TEXT } from "./content.js";

/* ================================================================== */
/* Estado general                                                      */
/* ================================================================== */

const $ = (sel, root = document) => root.querySelector(sel);
const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = motionQuery.matches;
motionQuery.addEventListener?.("change", (e) => (reducedMotion = e.matches));
const SCORE_LABELS = ["0", "15", "30", "40"];

const store = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
};

let lang = store.get("mate0s-lang") || ((navigator.language || "es").toLowerCase().startsWith("es") ? "es" : "en");
if (!TEXT[lang]) lang = "es";
const t = () => TEXT[lang];

const state = {
  you: 0,
  bug: 0,
  unlocked: 0,
  /** idle: bola en el logo · ready: esperando saque · play · pause: entre puntos · done: juego ganado */
  phase: "idle",
  ballOut: false,
  bugLine: 0,
  open: -1,
};

/* ================================================================== */
/* Interfaz: textos, capítulos y marcador                              */
/* ================================================================== */

const els = {
  zero: $("[data-zero]"),
  chapters: $("[data-chapters]"),
  announce: $("[data-announce]"),
  serve: $("[data-serve]"),
  serveBtn: $('[data-action="serve"]'),
  skipBtn: $('[data-action="skip"]'),
  langBtn: $('[data-action="lang"]'),
  youScore: $('[data-score="you"]'),
  bugScore: $('[data-score="bug"]'),
  canvas: $("#court"),
  wrap: $(".court-wrap"),
};

function renderStatic() {
  const tx = t();
  document.documentElement.lang = tx.lang;
  document.title = tx.title;
  document.querySelectorAll("[data-t]").forEach((el) => {
    el.textContent = tx[el.dataset.t];
  });
  els.langBtn.textContent = lang === "es" ? "EN" : "ES";
  els.skipBtn.textContent = tx.skip;
  els.canvas.setAttribute("aria-label", tx.courtLabel);
  updateServeButton();
  renderScore(false);
  renderChapters([]);
}

function updateServeButton() {
  els.serveBtn.textContent = state.phase === "done" ? t().playAgain : t().serve;
}

function scoreLabel(n) {
  return n >= 4 ? t().chapters[3].score : SCORE_LABELS[n];
}

function renderScore(bump = true, who) {
  els.youScore.textContent = scoreLabel(state.you);
  els.bugScore.textContent = scoreLabel(state.bug);
  if (bump && !reducedMotion) {
    const el = who === "bug" ? els.bugScore : els.youScore;
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }
}

function scoreLine() {
  const tx = t();
  return `(${tx.you} ${scoreLabel(state.you)}, ${tx.bug} ${scoreLabel(state.bug)})`;
}

function contactLinks() {
  const items = [];
  if (PROFILE.email) items.push({ label: PROFILE.email, href: `mailto:${PROFILE.email}` });
  if (PROFILE.linkedin) items.push({ label: "LinkedIn", href: PROFILE.linkedin });
  if (PROFILE.github) items.push({ label: `GitHub · ${PROFILE.github.split("/").pop()}`, href: PROFILE.github });
  return items;
}

/** @param {number[]} fresh índices recién desbloqueados (para animarlos) */
function renderChapters(fresh) {
  const tx = t();
  els.chapters.replaceChildren(
    ...tx.chapters.map((ch, i) => {
      const li = document.createElement("li");
      const locked = i >= state.unlocked;
      li.className = `chapter${locked ? " is-locked" : ""}${fresh.includes(i) ? " just-unlocked" : ""}`;
      if (fresh.includes(i)) li.style.setProperty("--delay", `${fresh.indexOf(i) * 140}ms`);

      if (!locked && i === state.open) li.classList.add("is-open");

      const heading = document.createElement("h2");
      heading.className = "ch-heading";
      const head = document.createElement("button");
      head.type = "button";
      head.className = "ch-head";
      head.disabled = locked;
      head.setAttribute("aria-expanded", String(!locked && i === state.open));
      head.setAttribute("aria-controls", `ch-body-${i}`);
      head.addEventListener("click", () => {
        state.open = state.open === i ? -1 : i;
        renderChapters([]);
        els.chapters.querySelectorAll(".ch-head")[i].focus();
      });

      const score = document.createElement("span");
      score.className = "ch-score";
      score.textContent = ch.score;

      const title = document.createElement("span");
      title.className = "ch-title";
      title.textContent = ch.title;

      const toggle = document.createElement("span");
      toggle.className = "ch-toggle";
      toggle.setAttribute("aria-hidden", "true");
      
      head.append(score, title, toggle);
      heading.append(head);

      const lock = document.createElement("p");
      lock.className = "ch-lock";
      lock.textContent = tx.locked.replace("{score}", ch.score);

      const body = document.createElement("div");
      body.className = "ch-body";
      body.id = `ch-body-${i}`;
      for (const p of ch.body ?? []) {
        const el = document.createElement("p");
        el.textContent = p;
        body.append(el);
      }
      if (ch.link) {
        const p = document.createElement("p");
        const a = Object.assign(document.createElement("a"), { href: ch.link.href, textContent: ch.link.label, target: "_blank", rel: "noopener" });
        p.append(a);
        body.append(p);
      }
      if (ch.stack) {
        const ul = document.createElement("ul");
        ul.className = "stack";
        for (const s of ch.stack) ul.append(Object.assign(document.createElement("li"), { textContent: s }));
        body.append(ul);
      }
      if (ch.contact) {
        const ul = document.createElement("ul");
        ul.className = "contact";
        for (const c of contactLinks()) {
          const li2 = document.createElement("li");
          const external = !c.href.startsWith("mailto:");
          li2.append(Object.assign(document.createElement("a"), { href: c.href, textContent: c.label, ...(external ? { target: "_blank", rel: "noopener" } : {}) }));
          ul.append(li2);
        }
        body.append(ul);
      }

      li.append(heading, lock, body);
      return li;
    }),
  );
  els.chapters.querySelectorAll(".just-unlocked").forEach((li) => {
    const d = li.style.getPropertyValue("--delay");
    li.querySelectorAll(".ch-score, .ch-body").forEach((n) => (n.style.animationDelay = d));
  });
}

function announce(msg) {
  els.announce.textContent = msg;
}

function unlockUpTo(n) {
  const before = state.unlocked;
  state.unlocked = Math.max(state.unlocked, Math.min(4, n));
  const fresh = [];
  for (let i = before; i < state.unlocked; i++) fresh.push(i);
  if (fresh.length) {
    state.open = fresh.length > 1 ? 0 : fresh[fresh.length - 1];
    renderChapters(reducedMotion ? [] : fresh);
  }
  return fresh;
}

/* ================================================================== */
/* Motor del rally                                                     */
/* Unidades de pista: 10 × 20 (proporción real de una pista de pádel)  */
/* ================================================================== */

const W = 10;
const H = 20;
const PLAYER_Y = 18.3;
const BUG_Y = 1.7;
const PADDLE_H = 0.36;
const BALL_R = 0.3;
const TUNE = { bugBase: 3.2, bugPerPoint: 0.4, bugWidth: 2.0, aimSpread: 2.1 };
const START_SPEED = 11.5;
const MAX_SPEED = 21;

const g = {
  px: W / 2,
  target: W / 2,
  pw: 2.5,
  cx: W / 2,
  cw: TUNE.bugWidth,
  ball: { x: W / 2, y: PLAYER_Y - 1, vx: 0, vy: 0 },
  /** qué pared de fondo ya se ha usado en este tramo ("you" | "bug" | null) */
  back: null,
  squash: 0,
  aimError: 0,
  flashes: [],
  keys: { left: false, right: false },
};

const ctx = els.canvas.getContext("2d");
let dpr = 1;
let cssW = 0;
let cssH = 0;
const INK = "#1b3bff";
const PAPER = "#f5f7ff";
const ink = (a) => `rgba(27, 59, 255, ${a})`;

function resize() {
  const r = els.canvas.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  cssW = r.width;
  cssH = r.height;
  els.canvas.width = Math.round(r.width * dpr);
  els.canvas.height = Math.round(r.height * dpr);
  draw();
}

new ResizeObserver(resize).observe(els.wrap);
window.addEventListener("resize", resize);

function placeBallOnPaddle() {
  g.ball.x = g.px;
  g.ball.y = PLAYER_Y - PADDLE_H / 2 - BALL_R - 0.05;
  g.ball.vx = 0;
  g.ball.vy = 0;
  g.back = null;
}

function launch() {
  const dir = Math.random() < 0.5 ? -1 : 1;
  g.ball.vx = dir * (1.5 + Math.random() * 2.5);
  g.ball.vy = -START_SPEED;
  g.aimError = (Math.random() * 2 - 1) * 1.2;
  state.phase = "play";
  setServeVisible(false);
}

function speed() {
  return Math.hypot(g.ball.vx, g.ball.vy);
}

function hitPaddle(side) {
  const b = g.ball;
  const cx = side === "you" ? g.px : g.cx;
  const half = (side === "you" ? g.pw : g.cw) / 2;
  const off = Math.max(-1, Math.min(1, (b.x - cx) / half));
  const s = Math.min(MAX_SPEED, Math.max(START_SPEED, speed()) * 1.07);
  const angle = off * 1.0;
  b.vx = s * Math.sin(angle);
  b.vy = (side === "you" ? -1 : 1) * s * Math.cos(angle);
  b.y = side === "you" ? PLAYER_Y - PADDLE_H / 2 - BALL_R : BUG_Y + PADDLE_H / 2 + BALL_R;
  g.back = null;
  g.squash = 1;
  if (window.__rally) window.__rally.hits = (window.__rally.hits || 0) + 1;
  if (side === "you") g.aimError = (Math.random() * 2 - 1) * (TUNE.aimSpread - state.you * 0.15);
}

function flash(kind, x, y) {
  g.flashes.push({ kind, x, y, life: 1 });
}

function step(dt) {
  // Jugador
  if (g.keys.left) g.target -= 15 * dt;
  if (g.keys.right) g.target += 15 * dt;
  g.target = Math.max(g.pw / 2, Math.min(W - g.pw / 2, g.target));
  g.px += (g.target - g.px) * Math.min(1, dt * 20);

  g.squash = Math.max(0, g.squash - dt * 6);
  g.flashes = g.flashes.map((f) => ({ ...f, life: f.life - dt * (f.kind === "unlock" ? 1 : 2.2) })).filter((f) => f.life > 0);

  if (state.phase === "ready") {
    placeBallOnPaddle();
    return;
  }
  if (state.phase !== "play") return;

  // Bug: sigue la bola cuando viene hacia él, con error y velocidad limitada
  const b = g.ball;
  // Solo reacciona cuando la bola cruza la red hacia su campo
  const coming = b.vy < 0 && b.y < H / 2 + 1;
  const aim = coming ? b.x + g.aimError : W / 2;
  const bugSpeed = TUNE.bugBase + state.you * TUNE.bugPerPoint;
  const delta = aim - g.cx;
  g.cx += Math.sign(delta) * Math.min(Math.abs(delta), bugSpeed * dt);
  g.cx = Math.max(g.cw / 2, Math.min(W - g.cw / 2, g.cx));

  // Bola (subpasos para no atravesar palas a alta velocidad)
  const steps = Math.ceil((speed() * dt) / 0.15);
  const h = dt / Math.max(1, steps);
  for (let i = 0; i < steps && state.phase === "play"; i++) {
    b.x += b.vx * h;
    b.y += b.vy * h;

    // Cristales laterales
    if (b.x < BALL_R) {
      b.x = BALL_R;
      b.vx = Math.abs(b.vx);
      flash("side", 0, b.y);
    } else if (b.x > W - BALL_R) {
      b.x = W - BALL_R;
      b.vx = -Math.abs(b.vx);
      flash("side", W, b.y);
    }

    // Palas
    const nearPlayer = Math.abs(b.y - PLAYER_Y) < BALL_R + PADDLE_H / 2 && Math.abs(b.x - g.px) < g.pw / 2 + BALL_R;
    if (nearPlayer && (b.vy > 0 || g.back === "you")) hitPaddle("you");
    const nearBug = Math.abs(b.y - BUG_Y) < BALL_R + PADDLE_H / 2 && Math.abs(b.x - g.cx) < g.cw / 2 + BALL_R;
    if (nearBug && b.vy < 0) hitPaddle("bug");

    // Cristal de fondo: como en el pádel, la bola rebota una vez y sigue viva
    if (b.y > H - BALL_R) {
      if (g.back !== "you") {
        b.y = H - BALL_R;
        b.vy = -Math.abs(b.vy) * 0.7;
        b.vx *= 0.85;
        g.back = "you";
        flash("back", b.x, H);
      } else return pointTo("bug");
    } else if (b.y < BALL_R) {
      // El bug no sabe jugar con la pared: si la bola llega a su cristal, punto tuyo
      flash("back", b.x, 0);
      return pointTo("you");
    }

    // Tras el rebote en tu cristal, si pasa tu pala sin que la toques: punto del bug
    if (g.back === "you" && b.vy < 0 && b.y < PLAYER_Y - 1.2) return pointTo("bug");
  }
}

function pointTo(who) {
  state.phase = "pause";
  window.__rally?.events.push({ who, x: +g.ball.x.toFixed(2), y: +g.ball.y.toFixed(2), vx: +g.ball.vx.toFixed(2), vy: +g.ball.vy.toFixed(2), back: g.back, px: +g.px.toFixed(2), cx: +g.cx.toFixed(2) });
  const tx = t();
  if (who === "you") {
    state.you++;
    renderScore(true, "you");
    const fresh = unlockUpTo(state.you);
    announce(`${fresh.length ? tx.point(tx.chapters[fresh[0]].title) : tx.pointRepeat} ${scoreLine()}`);
    if (fresh.length) g.flashes.push({ kind: "unlock", x: W / 2, y: H / 2, life: 1.8, text: tx.chapters[fresh[0]].title });
    if (state.you >= 4) {
      setTimeout(winGame, 900);
      return;
    }
  } else {
    state.bug++;
    renderScore(true, "bug");
    announce(`${tx.bugPoint[state.bugLine++ % tx.bugPoint.length]} ${scoreLine()}`);
    if (state.bug >= 4) {
      setTimeout(() => {
        announce(t().bugGame);
        state.you = 0;
        state.bug = 0;
        renderScore(false);
        toReady();
      }, 1100);
      return;
    }
  }
  setTimeout(toReady, 850);
}

function toReady() {
  kick();
  state.phase = "ready";
  placeBallOnPaddle();
  setServeVisible(true);
}

function winGame() {
  state.phase = "done";
  announce(t().youGame);
  updateServeButton();
  flyBallHome();
  setServeVisible(true);
}

function setServeVisible(visible) {
  els.serve.classList.toggle("is-hidden", !visible);
  updateServeButton();
}

/* ------------------------------------------------------------------ */
/* Dibujo                                                              */
/* ------------------------------------------------------------------ */

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function draw() {
  if (!cssW) return;
  const s = cssW / W;
  ctx.setTransform(dpr * s, 0, 0, dpr * s, 0, 0);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  // Cristales (paredes)
  const glass = 0.2;
  ctx.fillStyle = ink(0.07);
  ctx.fillRect(0, 0, W, glass);
  ctx.fillRect(0, H - glass, W, glass);
  ctx.fillRect(0, 0, glass, H);
  ctx.fillRect(W - glass, 0, glass, H);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 0.06;
  ctx.strokeRect(0.03, 0.03, W - 0.06, H - 0.06);

  // Líneas de saque y central
  ctx.strokeStyle = ink(0.5);
  ctx.lineWidth = 0.05;
  ctx.beginPath();
  ctx.moveTo(0, 3.05);
  ctx.lineTo(W, 3.05);
  ctx.moveTo(0, H - 3.05);
  ctx.lineTo(W, H - 3.05);
  ctx.moveTo(W / 2, 3.05);
  ctx.lineTo(W / 2, H - 3.05);
  ctx.stroke();

  // Red
  ctx.strokeStyle = INK;
  ctx.lineWidth = 0.1;
  ctx.setLineDash([0.22, 0.14]);
  ctx.beginPath();
  ctx.moveTo(0, H / 2);
  ctx.lineTo(W, H / 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = INK;
  for (const x of [0.12, W - 0.12]) {
    ctx.beginPath();
    ctx.arc(x, H / 2, 0.16, 0, Math.PI * 2);
    ctx.fill();
  }

  // Destellos en los cristales
  for (const f of g.flashes) {
    if (f.kind === "unlock") {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const a = Math.min(1, f.life);
      const size = Math.max(16, Math.min(26, cssW / 14));
      ctx.font = `800 ${size}px Anybody, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const w = ctx.measureText(f.text).width + 28;
      const cx = (W / 2) * s;
      const cy = (H / 2 + 2.4) * s;
      ctx.fillStyle = `rgba(245, 247, 255, ${a})`;
      ctx.fillRect(cx - w / 2, cy - size, w, size * 2);
      ctx.strokeStyle = ink(a);
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - w / 2, cy - size, w, size * 2);
      ctx.fillStyle = ink(a);
      ctx.fillText(f.text, cx, cy + 1);
      ctx.restore();
      continue;
    }
    ctx.fillStyle = ink(0.35 * f.life);
    if (f.kind === "side") ctx.fillRect(f.x === 0 ? 0 : W - 0.45, f.y - 1.4, 0.45, 2.8);
    else ctx.fillRect(f.x - 1.6, f.y === 0 ? 0 : H - 0.45, 3.2, 0.45);
    if (f.kind === "back" && f.y === H && f.life > 0.35) {
      // Texto en píxeles de pantalla: el canvas escalado deforma las fuentes pequeñas
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = ink(Math.min(1, f.life * 1.4));
      ctx.font = `800 15px Anybody, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(t().wall, Math.max(1.6, Math.min(W - 1.6, f.x)) * s, (H - 0.9) * s);
      ctx.restore();
    }
  }

  // Pala del bug: hueca
  ctx.strokeStyle = INK;
  ctx.lineWidth = 0.09;
  roundRect(g.cx - g.cw / 2, BUG_Y - PADDLE_H / 2, g.cw, PADDLE_H, PADDLE_H / 2);
  ctx.stroke();

  // Tu pala: maciza y perforada, como una pala de pádel
  ctx.fillStyle = INK;
  roundRect(g.px - g.pw / 2, PLAYER_Y - PADDLE_H / 2, g.pw, PADDLE_H, PADDLE_H / 2);
  ctx.fill();
  ctx.fillStyle = PAPER;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(g.px + i * 0.3, PLAYER_Y, 0.05, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bola (el 0 del logo)
  if (state.ballOut && state.phase !== "idle" && state.phase !== "done") {
    const b = g.ball;
    const sq = g.squash * 0.35;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(Math.atan2(b.vy, b.vx || 0.0001));
    ctx.scale(1 + sq, 1 - sq);
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(0, 0, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Bucle: solo corre cuando hay algo que mover y la pista está a la vista
let last = performance.now();
let running = false;
let courtVisible = true;
function needsFrames() {
  return courtVisible && (state.phase === "play" || state.phase === "ready" || state.phase === "pause" || g.flashes.length > 0 || g.keys.left || g.keys.right || Math.abs(g.target - g.px) > 0.01);
}
function frame(now) {
  const dt = Math.min(1 / 30, (now - last) / 1000);
  last = now;
  step(dt);
  draw();
  if (needsFrames()) requestAnimationFrame(frame);
  else running = false;
}
function kick() {
  if (running) return;
  running = true;
  last = performance.now();
  requestAnimationFrame(frame);
}
new IntersectionObserver(([entry]) => {
  courtVisible = entry.isIntersecting;
  if (courtVisible) kick();
}).observe(els.wrap);
kick();

/* ------------------------------------------------------------------ */
/* El 0 del logo sale volando a la pista (y vuelve al ganar)           */
/* ------------------------------------------------------------------ */

function courtToScreen(x, y) {
  const r = els.canvas.getBoundingClientRect();
  return { x: r.left + (x / W) * r.width, y: r.top + (y / H) * r.height, scale: r.width / W };
}

function zeroBox() {
  const r = els.zero.getBoundingClientRect();
  const d = r.height * 0.52;
  return { x: r.left + r.width / 2, y: r.top + r.height * 0.56, d };
}

function fly(from, to, done) {
  if (reducedMotion) return done();
  const dot = document.createElement("div");
  dot.className = "ball-fly";
  dot.style.width = dot.style.height = `${to.d}px`;
  document.body.append(dot);
  const s0 = from.d / to.d;
  const midY = Math.min(from.y, to.y) - 120;
  const anim = dot.animate(
    [
      { transform: `translate(${from.x - to.d / 2}px, ${from.y - to.d / 2}px) scale(${s0})` },
      { transform: `translate(${(from.x + to.x) / 2 - to.d / 2}px, ${midY}px) scale(${(s0 + 1) / 2})`, offset: 0.45 },
      { transform: `translate(${to.x - to.d / 2}px, ${to.y - to.d / 2}px) scale(1)` },
    ],
    { duration: 720, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
  );
  anim.onfinish = () => {
    dot.remove();
    done();
  };
}

function flyBallOut(done) {
  const z = zeroBox();
  placeBallOnPaddle();
  const p = courtToScreen(g.ball.x, g.ball.y);
  els.zero.classList.add("is-out");
  fly(z, { x: p.x, y: p.y, d: BALL_R * 2 * p.scale }, () => {
    state.ballOut = true;
    done();
  });
}

function flyBallHome() {
  const p = courtToScreen(g.ball.x, g.ball.y);
  const z = zeroBox();
  state.ballOut = false;
  const from = { x: p.x, y: p.y, d: BALL_R * 2 * p.scale };
  if (reducedMotion) return els.zero.classList.remove("is-out");
  const dot = document.createElement("div");
  dot.className = "ball-fly";
  dot.style.width = dot.style.height = `${z.d}px`;
  document.body.append(dot);
  const s0 = from.d / z.d;
  const anim = dot.animate(
    [
      { transform: `translate(${from.x - z.d / 2}px, ${from.y - z.d / 2}px) scale(${s0})` },
      { transform: `translate(${(from.x + z.x) / 2 - z.d / 2}px, ${Math.min(from.y, z.y) - 140}px) scale(0.8)`, offset: 0.5 },
      { transform: `translate(${z.x - z.d / 2}px, ${z.y - z.d / 2}px) scale(1)` },
    ],
    { duration: 820, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
  );
  anim.onfinish = () => {
    dot.remove();
    els.zero.classList.remove("is-out");
  };
}

/* ================================================================== */
/* Controles                                                           */
/* ================================================================== */

function serve() {
  if (state.phase === "idle") {
    setServeVisible(false);
    state.phase = "pause";
    flyBallOut(() => {
      state.phase = "ready";
      launch();
    });
  } else if (state.phase === "ready") {
    launch();
  } else if (state.phase === "done") {
    state.you = 0;
    state.bug = 0;
    renderScore(false);
    setServeVisible(false);
    state.phase = "pause";
    flyBallOut(() => {
      state.phase = "ready";
      launch();
    });
  }
  els.canvas.focus({ preventScroll: true });
  kick();
}

els.serveBtn.addEventListener("click", serve);

els.canvas.tabIndex = 0;
els.canvas.addEventListener("pointermove", (e) => {
  const r = els.canvas.getBoundingClientRect();
  g.target = ((e.clientX - r.left) / r.width) * W;
  kick();
});
els.canvas.addEventListener("pointerdown", (e) => {
  const r = els.canvas.getBoundingClientRect();
  g.target = ((e.clientX - r.left) / r.width) * W;
  if (state.phase === "ready") launch();
  kick();
});

document.addEventListener("keydown", (e) => {
  const inGame = document.activeElement === els.canvas || (state.phase === "play" && document.activeElement === document.body);
  if (!inGame) return;
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
    g.keys.left = true;
    e.preventDefault();
  } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
    g.keys.right = true;
    e.preventDefault();
  } else if (e.key === " ") {
    e.preventDefault();
    serve();
  }
  kick();
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") g.keys.left = false;
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") g.keys.right = false;
});

els.skipBtn.addEventListener("click", () => {
  unlockUpTo(4);
  announce(t().skipped);
  els.chapters.focus({ preventScroll: true });
  els.chapters.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest" });
});

els.langBtn.addEventListener("click", () => {
  lang = lang === "es" ? "en" : "es";
  store.set("mate0s-lang", lang);
  renderStatic();
  announce("");
});

document.addEventListener("visibilitychange", () => {
  last = performance.now();
});
window.addEventListener("blur", () => {
  g.keys.left = g.keys.right = false;
});

renderStatic();

console.log(
  "%cmate0s%c\n¿Mirando el código? Me caes bien. Está todo en %cgithub.com/mate0sdev",
  "font: 800 28px Anybody, sans-serif; color: #1b3bff",
  "color: #1b3bff",
  "color: #1b3bff; font-weight: 700",
);

// Solo para pruebas automáticas: ?debug expone el estado del juego.
if (new URLSearchParams(location.search).has("debug")) window.__rally = { g, state, events: [], step, launch, placeBallOnPaddle, tune: TUNE };
