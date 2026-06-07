

const ring = document.getElementById('cursor-ring');
const dot  = document.getElementById('cursor-dot');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

(function moveCursor() {
  rx += (mx - rx) * .15;
  ry += (my - ry) * .15;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  dot.style.left  = mx + 'px';
  dot.style.top   = my + 'px';
  requestAnimationFrame(moveCursor);
})();

/* ═══════════════════════════════════════════════════
   2.  PARTICLE / GRID CANVAS
═══════════════════════════════════════════════════ */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const PARTICLE_COUNT = 90;
const pts = Array.from({ length: PARTICLE_COUNT }, () => ({
  x:  Math.random() * window.innerWidth,
  y:  Math.random() * window.innerHeight,
  vx: (Math.random() - .5) * .45,
  vy: (Math.random() - .5) * .45,
  r:  Math.random() * 1.4 + .3,
  a:  Math.random() * .55 + .1
}));

let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

function drawParticles() {
  ctx.clearRect(0, 0, W, H);

  /* faint grid */
  ctx.strokeStyle = 'rgba(0,245,255,.025)';
  ctx.lineWidth = .5;
  const GRID = 60;
  for (let x = 0; x < W; x += GRID) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += GRID) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  /* particles */
  pts.forEach(p => {
    const dx = p.x - mouseX, dy = p.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 100) {
      const force = (100 - dist) / 100 * .4;
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;
    }

    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed > 1.5) { p.vx /= speed * .9; p.vy /= speed * .9; }

    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = W;
    if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H;
    if (p.y > H) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,245,255,${p.a})`;
    ctx.fill();
  });

  /* connections */
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 110) {
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[j].x, pts[j].y);
        ctx.strokeStyle = `rgba(0,245,255,${.13 * (1 - d / 110)})`;
        ctx.lineWidth = .6;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(drawParticles);
}
drawParticles();

/* ═══════════════════════════════════════════════════
   3.  SCROLL REVEAL
═══════════════════════════════════════════════════ */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: .12 });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));
document.querySelectorAll('.card, .contact-card').forEach(el => io.observe(el));

/* ═══════════════════════════════════════════════════
   4.  ACTIVE NAV HIGHLIGHT
═══════════════════════════════════════════════════ */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('nav a');

window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 200) cur = s.id;
  });
  navLinks.forEach(a => {
    const active = a.getAttribute('href') === '#' + cur;
    a.style.color       = active ? 'var(--bg-deep)' : '';
    a.style.background  = active ? 'var(--cyan)'    : '';
    a.style.borderColor = active ? 'var(--cyan)'    : '';
  });
});

/* ═══════════════════════════════════════════════════
   5.  FORM SUBMISSION + TOAST
═══════════════════════════════════════════════════ */
const form  = document.getElementById('sub-form');
const toast = document.getElementById('toast');

form.addEventListener('submit', e => {
  e.preventDefault();
  toast.classList.add('show');
  form.reset();
  setTimeout(() => toast.classList.remove('show'), 3200);
});

/* ═══════════════════════════════════════════════════
   6.  TYPEWRITER — header subtitle
═══════════════════════════════════════════════════ */
const sub  = document.querySelector('.header-sub');
const full = sub.textContent;
sub.textContent = '';
let ti = 0;

function typeWriter() {
  if (ti <= full.length) {
    sub.textContent = full.slice(0, ti++);
    setTimeout(typeWriter, 38);
  }
}
setTimeout(typeWriter, 1100);

/* ═══════════════════════════════════════════════════
   7.  SCRAMBLE TEXT — card numbers on hover
═══════════════════════════════════════════════════ */
document.querySelectorAll('.card-num').forEach(el => {
  const base = el.textContent;
  el.parentElement.addEventListener('mouseenter', () => {
    let i = 0;
    const chars = '0123456789ABCDEF';
    const iv = setInterval(() => {
      el.textContent = '// '
        + chars[Math.floor(Math.random() * chars.length)]
        + chars[Math.floor(Math.random() * chars.length)]
        + chars[Math.floor(Math.random() * chars.length)];
      if (++i > 8) { clearInterval(iv); el.textContent = base; }
    }, 45);
  });
});

/* ═══════════════════════════════════════════════════
   8.  HEADER PARALLAX
═══════════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  document.querySelector('h1').style.transform            = `translateY(${y * .18}px)`;
  document.querySelector('.header-badge').style.transform = `translateY(${y * .1}px)`;
});
  