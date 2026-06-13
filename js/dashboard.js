// ============================================================
// DASHBOARD.JS — Main Dashboard Rendering
// Carbon Footprint Awareness Platform
// ============================================================

import { DAILY_TIPS, BENCHMARKS, CATEGORY_COLORS, LEVELS } from './data.js';
import { getProfile, getStats, getWeeklyData, calculateStreak } from './storage.js';

let scoreChart = null;
let breakdownChart = null;
let trendChart = null;

export function initDashboard() {
  renderDashboard();
}

export function refreshDashboard() {
  if (scoreChart) { scoreChart.destroy(); scoreChart = null; }
  if (breakdownChart) { breakdownChart.destroy(); breakdownChart = null; }
  if (trendChart) { trendChart.destroy(); trendChart = null; }
  renderDashboard();
}

function renderDashboard() {
  const container = document.getElementById('dashboard-content');
  if (!container) return;

  const profile = getProfile();
  const stats = getStats();
  const tip = getDailyTip();
  const hasFootprint = profile.footprint && profile.footprint.total > 0;

  container.innerHTML = `
    <!-- Daily Tip -->
    <div class="daily-tip">
      <div class="daily-tip-icon">${tip.icon}</div>
      <div>
        <div class="daily-tip-label">💡 Daily Eco-Tip</div>
        <div class="daily-tip-text">${tip.tip}</div>
      </div>
    </div>

    ${hasFootprint ? renderFootprintDashboard(profile, stats) : renderEmptyState()}
  `;

  if (hasFootprint) {
    setTimeout(() => {
      renderScoreRing(profile.footprint);
      renderBreakdownChart(profile.footprint);
      renderTrendChart();
      animateStatCounters();
    }, 150);
  }
}

function renderEmptyState() {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">🌍</div>
      <h3 class="empty-state-title">Welcome to EcoTrack!</h3>
      <p class="empty-state-text">
        Start by calculating your carbon footprint. It only takes 2 minutes and helps us personalize your experience.
      </p>
      <button class="btn btn-primary btn-lg" id="btn-start-calc">
        🧮 Calculate My Footprint
      </button>
    </div>
  `;
}

function renderFootprintDashboard(profile, stats) {
  const fp = profile.footprint;
  const level = getLevel(stats.totalPoints);
  const levelProgress = getLevelProgress(stats.totalPoints);

  return `
    <!-- Score + Stats Row -->
    <div class="dashboard-grid">
      <!-- Carbon Score -->
      <div class="card card-glass">
        <div class="score-section">
          <div class="score-ring-container">
            <canvas id="score-ring-canvas"></canvas>
            <div class="score-ring-text">
              <div class="score-ring-value">${fp.total}</div>
              <div class="score-ring-unit">tonnes CO₂/yr</div>
            </div>
          </div>
          <div class="score-badge">
            ${level.icon} ${level.title}
          </div>
          <p class="score-ring-label">
            ${fp.total <= BENCHMARKS.paris_target.value ? '🌟 Below Paris Agreement Target!' :
              fp.total <= BENCHMARKS.india.value ? '👍 Below India Average' :
              fp.total <= BENCHMARKS.global.value ? '⚠️ Below Global Average' :
              '🔴 Above Global Average'}
          </p>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="flex flex-col gap-4">
        <div class="stats-grid" style="margin-bottom:0">
          <div class="stat-card primary">
            <div class="stat-card-icon">🌿</div>
            <div class="stat-card-value" data-counter="${stats.totalCO2Saved}">0</div>
            <div class="stat-card-label">kg CO₂ Saved</div>
          </div>
          <div class="stat-card transport">
            <div class="stat-card-icon">✅</div>
            <div class="stat-card-value" data-counter="${stats.totalActions}">0</div>
            <div class="stat-card-label">Actions Taken</div>
          </div>
          <div class="stat-card energy">
            <div class="stat-card-icon">🔥</div>
            <div class="stat-card-value" data-counter="${stats.streak}">0</div>
            <div class="stat-card-label">Day Streak</div>
          </div>
          <div class="stat-card food">
            <div class="stat-card-icon">💎</div>
            <div class="stat-card-value" data-counter="${stats.totalPoints}">0</div>
            <div class="stat-card-label">Eco Points</div>
          </div>
        </div>

        <!-- Level Progress -->
        <div class="card">
          <div class="level-card" style="padding: var(--space-4)">
            <div class="level-icon" style="width:56px;height:56px;font-size:1.8rem">${level.icon}</div>
            <div class="level-info">
              <div class="level-title" style="font-size:var(--text-base)">Level ${level.level}: ${level.title}</div>
              <div class="level-progress-bar">
                <div class="level-progress-fill" style="width:${levelProgress.progress}%"></div>
              </div>
              <div class="level-progress-text">
                <span>${stats.totalPoints} pts</span>
                <span>${levelProgress.next ? levelProgress.next.minPoints + ' pts' : 'MAX'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="dashboard-grid">
      <!-- Category Breakdown -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">📊 Emission Breakdown</h3>
        </div>
        <div class="chart-container" style="height:250px">
          <canvas id="breakdown-chart"></canvas>
        </div>
      </div>

      <!-- Weekly Trend -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">📈 Weekly CO₂ Saved</h3>
        </div>
        <div class="chart-container" style="height:250px">
          <canvas id="trend-chart"></canvas>
        </div>
      </div>
    </div>

    <!-- Recalculate -->
    <div class="text-center mt-4">
      <button class="btn btn-outline" id="btn-recalc">🔄 Recalculate Footprint</button>
    </div>
  `;
}

function renderScoreRing(footprint) {
  const canvas = document.getElementById('score-ring-canvas');
  if (!canvas) return;

  if (scoreChart) { scoreChart.destroy(); scoreChart = null; }

  const maxVal = Math.max(footprint.total, BENCHMARKS.usa.value);
  const remaining = Math.max(0, maxVal - footprint.total);

  let color;
  if (footprint.total <= BENCHMARKS.paris_target.value) color = '#10B981';
  else if (footprint.total <= BENCHMARKS.india.value) color = '#34D399';
  else if (footprint.total <= BENCHMARKS.global.value) color = '#F59E0B';
  else color = '#EF4444';

  const ctx = canvas.getContext('2d');
  scoreChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [footprint.total, remaining],
        backgroundColor: [color, 'rgba(148,163,184,0.12)'],
        borderWidth: 0,
        hoverOffset: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '80%',
      rotation: -90,
      circumference: 360,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      animation: {
        animateRotate: true,
        duration: 1500,
        easing: 'easeOutQuart',
      },
      events: [],
    }
  });
}

function renderBreakdownChart(footprint) {
  const canvas = document.getElementById('breakdown-chart');
  if (!canvas) return;

  if (breakdownChart) { breakdownChart.destroy(); breakdownChart = null; }

  const ctx = canvas.getContext('2d');
  breakdownChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Transport', 'Energy', 'Food', 'Lifestyle'],
      datasets: [{
        data: [footprint.transport, footprint.energy, footprint.food, footprint.lifestyle],
        backgroundColor: [
          CATEGORY_COLORS.transport.primary,
          CATEGORY_COLORS.energy.primary,
          CATEGORY_COLORS.food.primary,
          CATEGORY_COLORS.lifestyle.primary,
        ],
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 36,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.9)',
          titleFont: { family: "'Inter', sans-serif", weight: '700' },
          bodyFont: { family: "'Inter', sans-serif" },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.x} tonnes CO₂/year`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: "'Inter', sans-serif", size: 12 },
            color: '#94A3B8',
            callback: (val) => val + 't'
          },
          border: { display: false },
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { family: "'Inter', sans-serif", size: 13, weight: '600' },
            color: '#475569',
          },
          border: { display: false },
        }
      },
      animation: {
        duration: 1200,
        easing: 'easeOutQuart',
      }
    }
  });
}

function renderTrendChart() {
  const canvas = document.getElementById('trend-chart');
  if (!canvas) return;

  if (trendChart) { trendChart.destroy(); trendChart = null; }

  const weeklyData = getWeeklyData(4);

  const ctx = canvas.getContext('2d');

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, 0, 0, 250);
  gradient.addColorStop(0, 'rgba(16,185,129,0.3)');
  gradient.addColorStop(1, 'rgba(16,185,129,0.02)');

  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: weeklyData.map(w => w.label),
      datasets: [{
        label: 'CO₂ Saved (kg)',
        data: weeklyData.map(w => w.co2Saved),
        borderColor: '#10B981',
        backgroundColor: gradient,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.9)',
          titleFont: { family: "'Inter', sans-serif", weight: '700' },
          bodyFont: { family: "'Inter', sans-serif" },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.y} kg CO₂ saved`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: "'Inter', sans-serif", size: 12 },
            color: '#94A3B8',
          },
          border: { display: false },
        },
        y: {
          grid: { color: 'rgba(148,163,184,0.1)' },
          ticks: {
            font: { family: "'Inter', sans-serif", size: 12 },
            color: '#94A3B8',
            callback: (val) => val + ' kg'
          },
          border: { display: false },
          beginAtZero: true,
        }
      },
      animation: {
        duration: 1500,
        easing: 'easeOutQuart',
      }
    }
  });
}

function animateStatCounters() {
  document.querySelectorAll('[data-counter]').forEach(el => {
    const target = parseFloat(el.dataset.counter) || 0;
    const isFloat = target % 1 !== 0;
    const duration = 1200;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      const current = target * eased;
      el.textContent = isFloat ? current.toFixed(1) : Math.round(current);
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  });
}

function getDailyTip() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
}

function getLevel(points) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (points >= lvl.minPoints) current = lvl;
  }
  return current;
}

function getLevelProgress(points) {
  const current = getLevel(points);
  const currentIdx = LEVELS.findIndex(l => l.level === current.level);
  const next = LEVELS[currentIdx + 1] || null;

  if (!next) return { current, next: null, progress: 100 };

  const range = next.minPoints - current.minPoints;
  const progress = Math.min(((points - current.minPoints) / range) * 100, 100);
  return { current, next, progress: Math.round(progress) };
}
