// ============================================================
// DASHBOARD.JS — Main Dashboard Rendering
// Carbon Footprint Awareness Platform
// ============================================================

import { DAILY_TIPS, BENCHMARKS, CATEGORY_COLORS } from './data.js';
import { getProfile, getStats, getWeeklyData } from './storage.js';
import { getAvatarInfo, getLevel, getLevelProgress } from './gamification.js';

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
    <!-- Welcome Greeting Header -->
    ${hasFootprint ? renderWelcomeHeader(profile) : ''}

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
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }, 150);
  } else {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}

function renderWelcomeHeader(profile) {
  const hour = new Date().getHours();
  let greeting = 'Good Evening';
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 17) greeting = 'Good Afternoon';

  return `
    <div class="welcome-card mb-6 card" style="background: linear-gradient(135deg, var(--primary-bg), var(--secondary-bg)); border: 1px solid var(--primary-glow)">
      <h2 style="font-size:var(--text-2xl); font-weight:800; margin-bottom:2px">
        ${greeting}, <span class="highlight-gradient" style="font-weight:800">${profile.name || 'Eco Warrior'}</span>! 🌱
      </h2>
      <p style="color:var(--text-secondary); font-size:var(--text-sm)">
        Welcome back to your sustainability dashboard. Here is your environmental footprint summary.
      </p>
    </div>
  `;
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
        <i data-lucide="calculator"></i> Calculate My Footprint
      </button>
    </div>
  `;
}

function renderFootprintDashboard(profile, stats) {
  const fp = profile.footprint;
  const level = getLevel(stats.totalPoints);
  const levelProgress = getLevelProgress(stats.totalPoints);
  const avatarInfo = getAvatarInfo(fp.total);

  return `
    <!-- Score + Avatar Row -->
    <div class="dashboard-grid">
      
      <!-- Carbon Score Ring -->
      <div class="card card-glass">
        <div class="card-header" style="margin-bottom:0; padding-bottom:0;">
          <h3 class="card-title"><i data-lucide="activity"></i> Carbon Score</h3>
        </div>
        <div class="score-section">
          <div class="score-ring-container">
            <canvas id="score-ring-canvas"></canvas>
            <div class="score-ring-text">
              <div class="score-ring-value">${fp.total}</div>
              <div class="score-ring-unit">tonnes CO₂/yr</div>
            </div>
          </div>
          <div class="score-badge" style="border-color:${avatarInfo.color}; color:${avatarInfo.color}; background:${avatarInfo.color}15">
            Level ${level.level}: ${level.title}
          </div>
          <p class="score-ring-label">
            ${fp.total <= BENCHMARKS.paris_target.value ? '🌟 Below Paris Agreement Target!' :
              fp.total <= BENCHMARKS.india.value ? '👍 Below India Average' :
              fp.total <= BENCHMARKS.global.value ? '⚠️ Below Global Average' :
              '🔴 Above Global Average'}
          </p>
        </div>
      </div>

      <!-- Evolving Carbon Avatar Card -->
      <div class="card avatar-card">
        <div class="avatar-img-wrapper" style="border-color: ${avatarInfo.color}; box-shadow: 0 0 15px ${avatarInfo.color}25">
          ${avatarInfo.avatar}
        </div>
        <div class="avatar-info">
          <div class="avatar-rank-label">Current Carbon Rank</div>
          <div class="avatar-rank-value" style="color: ${avatarInfo.color}">${avatarInfo.rank}</div>
          <div class="avatar-desc">${avatarInfo.description}</div>
          
          <div class="avatar-progress-container">
            <div class="avatar-progress-bar">
              <div class="avatar-progress-fill" style="width: ${avatarInfo.progress}%; background: ${avatarInfo.color}"></div>
            </div>
            <div class="avatar-progress-text">
              <span>Next: ${avatarInfo.nextRank}</span>
              <span>${avatarInfo.progress}%</span>
            </div>
          </div>
        </div>
      </div>
      
    </div>

    <!-- Cumulative Environmental Impact Summary Card -->
    <div class="card mb-6">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="leaf"></i> Cumulative Environmental Impact</h3>
      </div>
      <p class="card-subtitle" style="margin-bottom:var(--space-5)">
        A live summary of all greenhouse gas emissions saved and environmental offsets achieved.
      </p>
      
      <div class="stats-grid" style="margin-bottom:0">
        <div class="stat-card primary">
          <div class="stat-card-icon">🌿</div>
          <div class="stat-card-value" data-counter="${stats.totalCO2Saved}">0</div>
          <div class="stat-card-label">kg CO₂ Saved</div>
        </div>
        <div class="stat-card food">
          <div class="stat-card-icon">🌳</div>
          <div class="stat-card-value" data-counter="${(stats.totalCO2Saved / 22).toFixed(1)}">0</div>
          <div class="stat-card-label">Trees Saved (yearly equiv)</div>
        </div>
        <div class="stat-card transport">
          <div class="stat-card-icon">🚗</div>
          <div class="stat-card-value" data-counter="${(stats.totalCO2Saved / 0.21).toFixed(0)}">0</div>
          <div class="stat-card-label">km Driving Avoided</div>
        </div>
        <div class="stat-card energy">
          <div class="stat-card-icon">🔌</div>
          <div class="stat-card-value" data-counter="${(stats.totalCO2Saved / 0.008).toFixed(0)}">0</div>
          <div class="stat-card-label">Phone Charges Saved</div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="dashboard-grid">
      <!-- Category Breakdown -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="bar-chart-3"></i> Emission Breakdown</h3>
        </div>
        <div class="chart-container" style="height:250px">
          <canvas id="breakdown-chart"></canvas>
        </div>
      </div>

      <!-- Weekly Trend -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="line-chart"></i> Weekly CO₂ Saved</h3>
        </div>
        <div class="chart-container" style="height:250px">
          <canvas id="trend-chart"></canvas>
        </div>
      </div>
    </div>

    <!-- Recalculate -->
    <div class="text-center mt-4">
      <button class="btn btn-outline" id="btn-recalc">
        <i data-lucide="refresh-cw"></i> Recalculate Footprint
      </button>
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
        backgroundColor: [color, 'rgba(148,163,184,0.1)'],
        borderWidth: 0,
        hoverOffset: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '82%',
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

  // Create visual gradient bars
  const gradTransport = ctx.createLinearGradient(0, 0, 350, 0);
  gradTransport.addColorStop(0, '#3B82F6');
  gradTransport.addColorStop(1, '#1D4ED8');

  const gradEnergy = ctx.createLinearGradient(0, 0, 350, 0);
  gradEnergy.addColorStop(0, '#F59E0B');
  gradEnergy.addColorStop(1, '#D97706');

  const gradFood = ctx.createLinearGradient(0, 0, 350, 0);
  gradFood.addColorStop(0, '#10B981');
  gradFood.addColorStop(1, '#059669');

  const gradLifestyle = ctx.createLinearGradient(0, 0, 350, 0);
  gradLifestyle.addColorStop(0, '#8B5CF6');
  gradLifestyle.addColorStop(1, '#7C3AED');

  breakdownChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Transport', 'Energy', 'Food', 'Lifestyle'],
      datasets: [{
        data: [footprint.transport, footprint.energy, footprint.food, footprint.lifestyle],
        backgroundColor: [gradTransport, gradEnergy, gradFood, gradLifestyle],
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 28,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.95)',
          titleFont: { family: "'Inter', sans-serif", weight: '700', size: 13 },
          bodyFont: { family: "'Inter', sans-serif", size: 12 },
          padding: 12,
          cornerRadius: 10,
          borderColor: '#10B981',
          borderWidth: 1,
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.x} tonnes CO₂/year`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: "'Inter', sans-serif", size: 11 },
            color: '#94A3B8',
            callback: (val) => val + 't'
          },
          border: { display: false },
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { family: "'Outfit', sans-serif", size: 13, weight: '600' },
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

  // Gradient fill under trend line
  const gradient = ctx.createLinearGradient(0, 0, 0, 250);
  gradient.addColorStop(0, 'rgba(16,185,129,0.25)');
  gradient.addColorStop(1, 'rgba(16,185,129,0.01)');

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
        tension: 0.45,
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
          backgroundColor: 'rgba(15,23,42,0.95)',
          titleFont: { family: "'Inter', sans-serif", weight: '700', size: 13 },
          bodyFont: { family: "'Inter', sans-serif", size: 12 },
          padding: 12,
          cornerRadius: 10,
          borderColor: '#10B981',
          borderWidth: 1,
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.y} kg CO₂ saved`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: "'Inter', sans-serif", size: 11 },
            color: '#94A3B8',
          },
          border: { display: false },
        },
        y: {
          grid: { color: 'rgba(148,163,184,0.06)' },
          ticks: {
            font: { family: "'Inter', sans-serif", size: 11 },
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
