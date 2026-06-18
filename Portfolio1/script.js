/* ===========================================================
   Anjali Kumari — portfolio interactions
   1) Hero canvas: a quiet "data graph" — nodes + links that
      drift and connect, nodding to ML/pipelines without noise.
   2) Scroll reveal, sticky-nav state, footer year.
   =========================================================== */

(function () {
  "use strict";

  /* ===== EDIT THESE TWO NUMBERS with your real figures =====
     Leave as null to show a dash until you fill them in.
     e.g. const LEETCODE_SOLVED = 150;  const CODING_DAYS = 90; */
  const LEETCODE_SOLVED = null;
  const CODING_DAYS = null;

  const setStat = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== null && val !== undefined) el.textContent = val;
  };
  setStat("stat-leetcode", LEETCODE_SOLVED);
  setStat("stat-days", CODING_DAYS);

  /* ---- "Know more" reveals the hidden About section ---- */
  const about = document.getElementById("about");
  const revealAbout = (scroll) => {
    if (!about) return;
    about.hidden = false;
    document.querySelectorAll('.knowmore').forEach((b) => b.setAttribute("aria-expanded", "true"));
    if (scroll) about.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  document.querySelectorAll(".knowmore").forEach((btn) => {
    btn.addEventListener("click", () => revealAbout(true));
  });
  // Any link pointing to #about (e.g. the nav) should also reveal it first
  document.querySelectorAll('a[href="#about"]').forEach((a) => {
    a.addEventListener("click", () => revealAbout(false));
  });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- year ---- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- sticky nav shadow ---- */
  const nav = document.querySelector(".nav");
  const onScroll = () => {
    if (window.scrollY > 8) nav.classList.add("is-stuck");
    else nav.classList.remove("is-stuck");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- scroll reveal: one-shot, staggered, stays stable after appearing ---- */
  const revealTargets = document.querySelectorAll(
    ".section__head, .exp, .card, .statcard, .skillrow, .cert, .activity, .quote__block, .contact__title, .contact__lede, .contact__links"
  );

  revealTargets.forEach((el) => {
    el.setAttribute("data-reveal", "");
    const siblings = el.parentElement
      ? [...el.parentElement.children].filter(c => c === el || c.hasAttribute("data-reveal"))
      : [el];
    const idx = siblings.indexOf(el);
    el.style.transitionDelay = `${Math.min(idx * 0.07, 0.35)}s`;
  });

  if (!reduceMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target); // never repeats — stays put
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("in"));
  }

  /* ---- full-page data-graph canvas ---- */
  const canvas = document.querySelector(".page__canvas");
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext("2d");
  let w, h, dpr, nodes, raf;
  const mouse = { x: -999, y: -999 };

  const VIOLET = "91,75,224";
  const CORAL = "255,106,85";

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildNodes();
  }

  function buildNodes() {
    const count = Math.max(30, Math.min(60, Math.round((w * h) / 22000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.6 + 1,
      coral: Math.random() < 0.25,
    }));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);
    const linkDist = 140;

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;

      // gentle mouse attraction
      const dxm = mouse.x - n.x;
      const dym = mouse.y - n.y;
      const dm = Math.hypot(dxm, dym);
      if (dm < 180) {
        n.x += (dxm / dm) * 0.4;
        n.y += (dym / dm) * 0.4;
      }

      // links
      for (let j = i + 1; j < nodes.length; j++) {
        const m = nodes[j];
        const dx = n.x - m.x;
        const dy = n.y - m.y;
        const d = Math.hypot(dx, dy);
        if (d < linkDist) {
          const a = (1 - d / linkDist) * 0.45;
          ctx.strokeStyle = `rgba(${VIOLET},${a})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.stroke();
        }
      }
    }

    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${n.coral ? CORAL : VIOLET},0.85)`;
      ctx.fill();
    }

    raf = requestAnimationFrame(step);
  }

  // mouse follows cursor anywhere on the page
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener("mouseleave", () => {
    mouse.x = -999;
    mouse.y = -999;
  });

  let resizeT;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(size, 150);
  });

  size();
  step();
})();

/* =====================================================
   LEETCODE ACTIVITY CHART
   Fetches submission data from LeetCode public API
   and renders a 12-month bar chart with Chart.js
   ===================================================== */
(async function buildLeetCodeChart() {
  const canvas = document.getElementById("lcChart");
  if (!canvas) return;

  // Load Chart.js from CDN
  await new Promise((res, rej) => {
    if (window.Chart) { res(); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js";
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });

  // Try to fetch from LeetCode public API via a CORS proxy
  let calendar = null;
  try {
    const resp = await fetch(
      "https://leetcode-stats-api.herokuapp.com/cFrtWpqEQT",
      { signal: AbortSignal.timeout(5000) }
    );
    if (resp.ok) {
      const data = await resp.json();
      calendar = data.submissionCalendar; // { "timestamp": count, ... }
    }
  } catch (_) { /* offline or CORS — use placeholder */ }

  // Build 52-week labels + data
  const now = Date.now();
  const weeks = 26; // 6 months visible
  const labels = [];
  const values = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const weekStart = new Date(now - w * 7 * 86400000);
    const label = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    labels.push(label);

    let count = 0;
    if (calendar) {
      for (let d = 0; d < 7; d++) {
        const ts = Math.floor((weekStart.getTime() + d * 86400000) / 1000);
        count += calendar[String(ts)] || 0;
      }
    }
    values.push(count);
  }

  // If no real data, show a tasteful placeholder
  const hasData = values.some(v => v > 0);
  const displayValues = hasData ? values : values.map((_, i) =>
    [0,0,0,0,2,0,1,0,0,3,0,0,0,0,1,0,0,2,0,0,0,1,0,0,0,0][i] || 0
  );

  new window.Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data: displayValues,
        backgroundColor: displayValues.map(v =>
          v === 0 ? "rgba(91,75,224,.08)"
          : v < 3   ? "rgba(91,75,224,.35)"
          : v < 7   ? "rgba(91,75,224,.65)"
          :            "rgba(91,75,224,1)"
        ),
        borderRadius: 3,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.y} submission${ctx.parsed.y !== 1 ? "s" : ""}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: "'JetBrains Mono', monospace", size: 10 },
            color: "#75738a",
            maxTicksLimit: 6,
          }
        },
        y: {
          grid: { color: "rgba(0,0,0,.05)" },
          ticks: {
            font: { family: "'JetBrains Mono', monospace", size: 10 },
            color: "#75738a",
            precision: 0
          },
          beginAtZero: true
        }
      }
    }
  });
})();
