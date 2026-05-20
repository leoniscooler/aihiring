// =============================================================
// Research website — interactivity
// =============================================================

// ---------- Animated counters in hero ----------
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = (target * eased).toFixed(1);
    el.textContent = val + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      heroObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.stat .num').forEach((el) => heroObserver.observe(el));

// ---------- Reveal sections on scroll ----------
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      sectionObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.section').forEach((s) => sectionObserver.observe(s));

// ---------- Back-to-top button ----------
const topBtn = document.getElementById('topBtn');
window.addEventListener('scroll', () => {
  topBtn.classList.toggle('visible', window.scrollY > 600);
});
topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// =============================================================
// CHART 1 — Callback rate by race  (Bertrand & Mullainathan data)
// =============================================================
const callbackCtx = document.getElementById('callbackChart');
if (callbackCtx) {
  // Real numbers from the labor_market_discrimination dataset:
  // White-sounding names: 235 callbacks / 2435 apps ≈ 9.65%
  // Black-sounding names: 157 callbacks / 2435 apps ≈ 6.45%
  const callbackChart = new Chart(callbackCtx, {
    type: 'bar',
    data: {
      labels: ['White-sounding names', 'Black-sounding names'],
      datasets: [{
        label: 'Callback rate (%)',
        data: [9.65, 6.45],
        backgroundColor: ['#4a7ba7', '#b04a3e'],
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const total = 2435;
              const callbacks = Math.round((ctx.parsed.y / 100) * total);
              return `${ctx.parsed.y}% — ${callbacks} callbacks out of ${total} applications`;
            }
          }
        },
        title: {
          display: true,
          text: '50% more callbacks for white-sounding names (Bertrand & Mullainathan, 2004)',
          font: { size: 14, family: 'Helvetica Neue, sans-serif' },
          color: '#2d3748',
          padding: { bottom: 15 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 12,
          title: { display: true, text: 'Callback rate (%)' },
          grid: { color: '#e2e8f0' }
        },
        x: { grid: { display: false } }
      },
      onClick: (evt, els) => {
        if (els.length > 0) {
          const idx = els[0].index;
          const labels = ['White-sounding names', 'Black-sounding names'];
          const counts = [235, 157];
          alert(`${labels[idx]}: ${counts[idx]} callbacks out of 2,435 applications (${callbackChart.data.datasets[0].data[idx]}%)`);
        }
      }
    }
  });
}

// =============================================================
// CHART 2 — Model comparison (interactive metric switcher)
// =============================================================
const modelData = {
  'ROC-AUC':   { vals: [0.649, 0.638, 0.670], best: 2,
    caption: 'ROC-AUC measures how well a model ranks callback candidates above non-callbacks. The neural-network ensemble achieved the highest value (0.670) — about the ceiling for this dataset due to label noise.' },
  'AP':        { vals: [0.170, 0.169, 0.161], best: 0,
    caption: 'Average Precision summarizes the precision–recall curve. All three models are nearly identical here, showing the dataset has a hard intrinsic limit.' },
  'F1':        { vals: [0.037, 0.239, 0.244], best: 2,
    caption: 'F1 combines precision and recall. The neural-network ensemble narrowly leads HistGBM, both massively outperforming the untuned baseline.' },
  'Recall':    { vals: [0.020, 0.296, 0.316], best: 2,
    caption: 'Recall = fraction of real callbacks that were caught. The NN catches 31.6% of real callbacks — best of any model.' },
  'Precision': { vals: [0.200, 0.200, 0.199], best: 0,
    caption: 'Precision = of those flagged, what fraction are real callbacks. All three are essentially tied near 20%.' }
};

const modelCtx = document.getElementById('modelChart');
let modelChart;
if (modelCtx) {
  const initialMetric = 'ROC-AUC';
  const labels = ['Gradient Boosting', 'HistGBM (tuned)', 'NN Ensemble (mine)'];
  const baseColors = ['#4a7ba7', '#dd8452', '#8172b3'];

  function buildColors(metric) {
    const best = modelData[metric].best;
    return baseColors.map((c, i) => i === best ? c : c + '99');
  }

  modelChart = new Chart(modelCtx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: initialMetric,
        data: modelData[initialMetric].vals,
        backgroundColor: buildColors(initialMetric),
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.x.toFixed(3)}`
          }
        }
      },
      scales: {
        x: { beginAtZero: true, grid: { color: '#e2e8f0' } },
        y: { grid: { display: false } }
      },
      animation: { duration: 700 }
    }
  });

  document.querySelectorAll('.metric-buttons button').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.metric-buttons button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const m = btn.dataset.metric;
      modelChart.data.datasets[0].label = m;
      modelChart.data.datasets[0].data = modelData[m].vals;
      modelChart.data.datasets[0].backgroundColor = buildColors(m);
      modelChart.update();
      document.getElementById('metric-caption').textContent = modelData[m].caption;
    });
  });
}

// =============================================================
// Smooth nav highlight on scroll
// =============================================================
const navLinks = document.querySelectorAll('#navbar a[href^="#"]');
const sectionsForNav = Array.from(navLinks).map((a) => {
  const id = a.getAttribute('href').slice(1);
  return { link: a, el: document.getElementById(id) };
}).filter((x) => x.el);

window.addEventListener('scroll', () => {
  const y = window.scrollY + 100;
  let active = null;
  for (const { link, el } of sectionsForNav) {
    if (el.offsetTop <= y) active = link;
  }
  navLinks.forEach((l) => l.style.color = '');
  if (active) active.style.color = '#f4a896';
});

// =============================================================
// Click-to-zoom for gallery images
// =============================================================
document.querySelectorAll('.gallery img').forEach((img) => {
  img.addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.92);
      display: flex; align-items: center; justify-content: center;
      z-index: 2000; cursor: zoom-out; padding: 2rem;
    `;
    const big = document.createElement('img');
    big.src = img.src;
    big.style.cssText = 'max-width: 95%; max-height: 95%; border-radius: 6px;';
    overlay.appendChild(big);
    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
  });
});
