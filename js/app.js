// ============================================================
// APP.JS — Main Application Controller
// Carbon Footprint Awareness Platform
// ============================================================

import { BADGES, LEVELS } from './data.js';
import { getProfile, saveProfile, isNewUser, getTheme, setTheme, calculateStreak, getStats, resetAllData } from './storage.js';
import { initDashboard, refreshDashboard } from './dashboard.js';
import { initCalculator } from './calculator.js';
import { initActions, refreshActions } from './actions.js';
import { initInsights } from './insights.js';
import { initGamification, checkBadges, getLevel, getLevelProgress, showBadgeNotification } from './gamification.js';

let currentTab = 'dashboard';
let initialized = false;

// ── App Initialization ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // Apply theme
  applyTheme(getTheme());

  // Setup navigation
  setupNavigation();

  // Setup theme toggle
  setupThemeToggle();

  // Check if new user
  if (isNewUser()) {
    showOnboarding();
  } else {
    bootApp();
  }

  initialized = true;
}

function bootApp() {
  // Initialize all modules
  initDashboard();
  initCalculator();
  initActions();
  initInsights();
  renderProfile();

  // Check badges
  const profile = getProfile();
  const newBadges = initGamification();
  if (newBadges && newBadges.length > 0) {
    setTimeout(() => showBadgeNotification(newBadges[0]), 1000);
  }

  // Update header stats
  updateHeaderDisplay();

  // Setup calculator-to-dashboard navigation
  setupCrossNavigation();
}

// ── Navigation ──────────────────────────────────────────────
function setupNavigation() {
  const navItems = document.querySelectorAll('[data-tab]');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;
      switchTab(tab);
    });
  });
}

function switchTab(tab) {
  currentTab = tab;

  // Update nav items (both top and bottom)
  document.querySelectorAll('[data-tab]').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tab);
  });

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `tab-${tab}`);
  });

  // Refresh tab content when switching
  switch (tab) {
    case 'dashboard':
      refreshDashboard();
      break;
    case 'calculator':
      // Don't reinit if user is mid-calculation
      break;
    case 'actions':
      refreshActions();
      break;
    case 'insights':
      initInsights();
      break;
    case 'profile':
      renderProfile();
      break;
  }

  // Check badges on tab switch
  const profile = getProfile();
  const newBadges = checkBadges(profile);
  if (newBadges.length > 0) {
    setTimeout(() => showBadgeNotification(newBadges[0]), 500);
  }

  // Update header
  updateHeaderDisplay();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupCrossNavigation() {
  // Dashboard "Start Calculator" button
  document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-start-calc' || e.target.id === 'btn-recalc') {
      switchTab('calculator');
      initCalculator();
    }
  });
}

// ── Theme ───────────────────────────────────────────────────
function setupThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = getTheme();
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      setTheme(next);
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.textContent = theme === 'light' ? '🌙' : '☀️';
  }
}

// ── Header Display ──────────────────────────────────────────
function updateHeaderDisplay() {
  const profile = getProfile();
  const streak = calculateStreak();

  const streakContainer = document.getElementById('header-streak');
  const streakValue = document.getElementById('header-streak-value');
  const pointsContainer = document.getElementById('header-points');
  const pointsValue = document.getElementById('header-points-value');

  if (streak > 0 && streakContainer) {
    streakContainer.style.display = 'flex';
    if (streakValue) streakValue.textContent = streak;
  } else if (streakContainer) {
    streakContainer.style.display = 'none';
  }

  const totalPoints = profile.ecoPoints || 0;
  if (totalPoints > 0 && pointsContainer) {
    pointsContainer.style.display = 'flex';
    if (pointsValue) pointsValue.textContent = totalPoints;
  } else if (pointsContainer) {
    pointsContainer.style.display = 'none';
  }
}

// ── Onboarding ──────────────────────────────────────────────
function showOnboarding() {
  const overlay = document.createElement('div');
  overlay.className = 'onboarding-overlay';
  overlay.id = 'onboarding';

  overlay.innerHTML = `
    <div class="onboarding-card">
      <div class="onboarding-icon">🌍</div>
      <h2 class="onboarding-title">Welcome to EcoTrack!</h2>
      <p class="onboarding-text">
        Your personal carbon footprint companion. Track your emissions, log eco-actions, earn badges, and make a real difference for our planet.
      </p>
      <input type="text" class="onboarding-input" id="onboarding-name"
        placeholder="What should we call you?"
        value="Eco Warrior" maxlength="30">
      <button class="btn btn-primary btn-lg btn-block" id="onboarding-start">
        Let's Get Started! 🌱
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  // Focus input
  setTimeout(() => {
    document.getElementById('onboarding-name')?.focus();
    document.getElementById('onboarding-name')?.select();
  }, 500);

  // Handle start
  document.getElementById('onboarding-start')?.addEventListener('click', () => {
    const nameInput = document.getElementById('onboarding-name');
    const name = nameInput?.value.trim() || 'Eco Warrior';

    const profile = getProfile();
    profile.name = name;
    profile.createdAt = new Date().toISOString();
    saveProfile(profile);

    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
      overlay.remove();
      bootApp();
    }, 300);
  });

  // Enter key
  document.getElementById('onboarding-name')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('onboarding-start')?.click();
    }
  });
}

// ── Profile Tab ─────────────────────────────────────────────
function renderProfile() {
  const container = document.getElementById('profile-content');
  if (!container) return;

  const profile = getProfile();
  const stats = getStats();
  const level = getLevel(profile.ecoPoints || 0);
  const levelProgress = getLevelProgress(profile.ecoPoints || 0);
  const streak = calculateStreak();
  const unlockedBadges = profile.badges || [];

  const joinedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Today';

  container.innerHTML = `
    <!-- Profile Header -->
    <div class="profile-header">
      <div class="profile-avatar">${level.icon}</div>
      <h2 class="profile-name">${profile.name || 'Eco Warrior'}</h2>
      <p class="profile-joined">Joined ${joinedDate}</p>
      <div class="score-badge mt-2" style="border-color:${level.color}; color:${level.color}; background:${level.color}15">
        ${level.icon} Level ${level.level}: ${level.title}
      </div>
    </div>

    <!-- Stats -->
    <div class="profile-stats">
      <div class="profile-stat">
        <div class="profile-stat-value">${stats.totalActions}</div>
        <div class="profile-stat-label">Actions</div>
      </div>
      <div class="profile-stat">
        <div class="profile-stat-value">${stats.totalCO2Saved.toFixed(1)}</div>
        <div class="profile-stat-label">kg CO₂ Saved</div>
      </div>
      <div class="profile-stat">
        <div class="profile-stat-value">${streak}</div>
        <div class="profile-stat-label">Day Streak</div>
      </div>
      <div class="profile-stat">
        <div class="profile-stat-value">${profile.ecoPoints || 0}</div>
        <div class="profile-stat-label">Points</div>
      </div>
    </div>

    <!-- Level Progress -->
    <div class="card level-section">
      <div class="level-card">
        <div class="level-icon">${level.icon}</div>
        <div class="level-info">
          <div class="level-title">Level ${level.level}: ${level.title}</div>
          <div class="level-subtitle">
            ${levelProgress.next
              ? `${levelProgress.next.minPoints - (profile.ecoPoints || 0)} points to ${levelProgress.next.title}`
              : '🎉 Maximum level reached!'}
          </div>
          <div class="level-progress-bar">
            <div class="level-progress-fill" style="width:${levelProgress.progress}%"></div>
          </div>
          <div class="level-progress-text">
            <span>${profile.ecoPoints || 0} pts</span>
            <span>${levelProgress.next ? levelProgress.next.minPoints + ' pts' : 'MAX'}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- All Levels -->
    <div class="card mb-6">
      <div class="card-header">
        <h3 class="card-title">📈 Level Progression</h3>
      </div>
      <div style="display:flex; flex-direction:column; gap:var(--space-3)">
        ${LEVELS.map(lvl => `
          <div style="display:flex; align-items:center; gap:var(--space-3); padding:var(--space-3); border-radius:var(--radius-lg); background:${lvl.level <= level.level ? 'var(--primary-bg)' : 'var(--bg-input)'}; opacity:${lvl.level <= level.level ? 1 : 0.5}">
            <span style="font-size:1.5rem">${lvl.icon}</span>
            <div style="flex:1">
              <div style="font-weight:700; font-size:var(--text-sm)">Level ${lvl.level}: ${lvl.title}</div>
              <div style="font-size:var(--text-xs); color:var(--text-tertiary)">${lvl.minPoints} points required</div>
            </div>
            ${lvl.level <= level.level ? '<span style="color:var(--primary); font-weight:700">✓</span>' : '<span style="color:var(--text-tertiary)">🔒</span>'}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Achievement Badges -->
    <div class="card mb-6">
      <div class="card-header">
        <h3 class="card-title">🏆 Achievements</h3>
        <span style="font-size:var(--text-sm); color:var(--text-secondary)">${unlockedBadges.length}/${BADGES.length}</span>
      </div>
      <div class="badges-grid">
        ${BADGES.map(badge => {
          const isUnlocked = unlockedBadges.includes(badge.id);
          return `
            <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}">
              ${!isUnlocked ? '<div class="badge-lock">🔒</div>' : ''}
              <div class="badge-icon">${badge.icon}</div>
              <div class="badge-name">${badge.label}</div>
              <div class="badge-desc">${badge.description}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Carbon Footprint Summary -->
    ${profile.footprint && profile.footprint.total > 0 ? `
      <div class="card mb-6">
        <div class="card-header">
          <h3 class="card-title">🌍 Your Footprint</h3>
          <span style="font-size:var(--text-sm); color:var(--text-secondary)">
            Last calculated: ${profile.footprint.lastCalculated
              ? new Date(profile.footprint.lastCalculated).toLocaleDateString('en-IN')
              : 'N/A'}
          </span>
        </div>
        <div class="stats-grid" style="margin-bottom:0">
          <div class="stat-card primary">
            <div class="stat-card-icon">🌍</div>
            <div class="stat-card-value">${profile.footprint.total}</div>
            <div class="stat-card-label">Total (tonnes/yr)</div>
          </div>
          <div class="stat-card transport">
            <div class="stat-card-icon">🚗</div>
            <div class="stat-card-value">${profile.footprint.transport}</div>
            <div class="stat-card-label">Transport</div>
          </div>
          <div class="stat-card energy">
            <div class="stat-card-icon">⚡</div>
            <div class="stat-card-value">${profile.footprint.energy}</div>
            <div class="stat-card-label">Energy</div>
          </div>
          <div class="stat-card food">
            <div class="stat-card-icon">🍔</div>
            <div class="stat-card-value">${profile.footprint.food}</div>
            <div class="stat-card-label">Food</div>
          </div>
        </div>
      </div>
    ` : ''}

    <!-- Settings -->
    <div class="card">
      <h3 class="settings-title">⚙️ Settings</h3>
      <div class="settings-item">
        <div>
          <div class="settings-label">🌙 Dark Mode</div>
          <div class="settings-desc">Toggle dark/light theme</div>
        </div>
        <button class="btn btn-secondary" id="profile-theme-toggle">
          ${getTheme() === 'light' ? 'Enable Dark Mode' : 'Enable Light Mode'}
        </button>
      </div>
      <div class="settings-item">
        <div>
          <div class="settings-label">🔄 Recalculate Footprint</div>
          <div class="settings-desc">Take the calculator again</div>
        </div>
        <button class="btn btn-secondary" id="profile-recalc">Recalculate</button>
      </div>
      <div class="settings-item">
        <div>
          <div class="settings-label">🗑️ Reset All Data</div>
          <div class="settings-desc">Clear all data and start fresh</div>
        </div>
        <button class="btn btn-danger" id="profile-reset">Reset Data</button>
      </div>
    </div>
  `;

  // Bind settings buttons
  document.getElementById('profile-theme-toggle')?.addEventListener('click', () => {
    const current = getTheme();
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    setTheme(next);
    renderProfile(); // Re-render to update button text
  });

  document.getElementById('profile-recalc')?.addEventListener('click', () => {
    switchTab('calculator');
    initCalculator();
  });

  document.getElementById('profile-reset')?.addEventListener('click', () => {
    if (confirm('⚠️ Are you sure? This will delete ALL your data including footprint, actions, badges, and points. This cannot be undone.')) {
      resetAllData();
      location.reload();
    }
  });
}
