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
import { initGamification, checkBadges, getLevel, getLevelProgress, showBadgeNotification, getAvatarInfo } from './gamification.js';

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

  // Setup landing page triggers
  setupLandingPage();

  // Check if new user
  if (isNewUser()) {
    showOnboarding();
  } else {
    bootApp();
  }

  // Trigger initial Lucide SVGs creation
  if (window.lucide) {
    window.lucide.createIcons();
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

// ── Landing Page ────────────────────────────────────────────
function setupLandingPage() {
  const landing = document.getElementById('landing-page');
  const calcBtn = document.getElementById('btn-landing-calc');
  const dashBtn = document.getElementById('btn-landing-dashboard');

  if (landing) {
    calcBtn?.addEventListener('click', () => {
      landing.classList.add('fade-out');
      setTimeout(() => landing.style.display = 'none', 800);
      switchTab('calculator');
      initCalculator();
    });

    dashBtn?.addEventListener('click', () => {
      landing.classList.add('fade-out');
      setTimeout(() => landing.style.display = 'none', 800);
      switchTab('dashboard');
    });
  }
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

  // Re-trigger Lucide Icons render after switching tabs
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupCrossNavigation() {
  // Dashboard "Start Calculator" button
  document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-start-calc' || e.target.id === 'btn-recalc' || e.target.closest('#btn-recalc')) {
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
      if (currentTab === 'profile') {
        renderProfile();
      }
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.innerHTML = theme === 'light' 
      ? `<i data-lucide="moon" style="width:18px;height:18px"></i>` 
      : `<i data-lucide="sun" style="width:18px;height:18px"></i>`;
  }
  if (window.lucide) {
    window.lucide.createIcons();
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
  const avatarInfo = getAvatarInfo(profile.footprint?.total || 0);

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
        Level ${level.level}: ${level.title}
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

    <!-- Evolving Carbon Avatar Card -->
    <div class="card avatar-card mb-6">
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

    <!-- Shareable Scorecard Card -->
    <div class="card mb-6">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="share-2"></i> Share Your Impact</h3>
      </div>
      <p class="card-subtitle" style="margin-bottom:var(--space-4)">
        Download your official scorecard and inspire others to protect the environment!
      </p>
      
      <div id="share-card-container" style="display:flex; justify-content:center; margin-bottom:var(--space-4)">
        <div id="share-card-target" style="
          width: 100%;
          max-width: 360px;
          background: linear-gradient(135deg, #0B1120 0%, #1A2332 100%);
          color: white;
          padding: 2.25rem 2rem;
          border-radius: 1.5rem;
          border: 2px solid #10B981;
          box-shadow: 0 15px 35px rgba(0,0,0,0.35);
          text-align: center;
          position: relative;
          overflow: hidden;
        ">
          <div style="position:absolute; width:150px; height:150px; background:rgba(16,185,129,0.15); border-radius:50%; top:-45px; right:-45px; filter:blur(30px); pointer-events:none;"></div>
          <div style="position:absolute; width:120px; height:120px; background:rgba(59,130,246,0.12); border-radius:50%; bottom:-30px; left:-35px; filter:blur(25px); pointer-events:none;"></div>
          
          <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #34D399; font-weight: 700; margin-bottom: 0.25rem;">Official Scorecard</div>
          <div style="font-size: 2.25rem; font-weight: 700; font-family:'Space Grotesk',sans-serif; margin-bottom: 1.25rem; background: linear-gradient(135deg, #10B981, #3B82F6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">EcoTrack</div>
          
          <div style="font-size: 2.8rem; margin-bottom: 0.5rem; animation: floatAvatar 3s ease-in-out infinite alternate;">${avatarInfo.avatar}</div>
          <div style="font-size: 1.25rem; font-weight: 700; font-family:'Space Grotesk',sans-serif;">${profile.name || 'Eco Warrior'}</div>
          <div style="font-size: 0.8rem; color: #94A3B8; margin-bottom: 1.5rem;">Rank: ${avatarInfo.rank}</div>
          
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; padding: 1.25rem; margin-bottom: 1.25rem;">
            <div style="font-size: 0.7rem; text-transform: uppercase; color: #94A3B8; letter-spacing: 0.05em;">Carbon Footprint</div>
            <div style="font-size: 2.2rem; font-weight: 700; font-family:'Space Grotesk',sans-serif; font-variant-numeric: tabular-nums; color: #10B981; margin: 0.25rem 0;">${profile.footprint?.total || '0'} <span style="font-size:0.95rem; font-weight:500; font-family:'Inter',sans-serif; color:white;">tonnes/yr</span></div>
            <div style="font-size: 0.75rem; color: #34D399; font-weight: 600;">
              ${(profile.footprint?.total || 0) <= 4.7 ? '🌿 Better than Global Average' : '⚠️ Above Global Average'}
            </div>
          </div>
          
          <div style="font-size: 0.75rem; color: #64748B;">EcoTrack: AI-powered Carbon Tracking Companion</div>
        </div>
      </div>
      
      <div style="display:flex; justify-content:center; gap:var(--space-3)">
        <button class="btn btn-primary" id="btn-download-card">
          <i data-lucide="download"></i> Download Scorecard
        </button>
        <button class="btn btn-outline" id="btn-share-card">
          <i data-lucide="share-2"></i> Share Impact
        </button>
      </div>
    </div>

    <!-- Level Progress -->
    <div class="card level-section mb-6">
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
      
      <!-- Dark Mode Theme Settings -->
      <div class="settings-item">
        <div>
          <div class="settings-label">🌙 Dark Mode</div>
          <div class="settings-desc">Toggle dark/light theme</div>
        </div>
        <button class="btn btn-secondary" id="profile-theme-toggle">
          ${getTheme() === 'light' ? 'Enable Dark Mode' : 'Enable Light Mode'}
        </button>
      </div>

      <!-- Gemini API Settings -->
      <div class="settings-item" style="flex-direction:column; align-items:flex-start; gap:var(--space-2)">
        <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
          <div>
            <div class="settings-label">🔑 Gemini API Key</div>
            <div class="settings-desc">For live sustainability advice on Insights tab</div>
          </div>
        </div>
        <div style="display:flex; gap:8px; width:100%; max-width:350px; margin-top:4px;">
          <input type="password" id="settings-gemini-key" class="form-select" style="background:var(--bg-input); border:1px solid var(--border); border-radius:var(--radius-md); padding:6px 10px; font-size:var(--text-xs); flex:1; height:32px" placeholder="Paste API Key here..." value="${profile.settings?.geminiApiKey || ''}">
          <button class="btn btn-secondary" id="btn-save-gemini-key" style="padding:0 var(--space-4); font-size:var(--text-xs); height:32px; flex-shrink:0;">Save</button>
        </div>
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

  // Bind Save Gemini API key button
  document.getElementById('btn-save-gemini-key')?.addEventListener('click', () => {
    const keyInput = document.getElementById('settings-gemini-key');
    const key = keyInput?.value.trim() || '';
    const prof = getProfile();
    if (!prof.settings) prof.settings = {};
    prof.settings.geminiApiKey = key;
    saveProfile(prof);
    alert('🔑 Gemini API Key saved successfully!');
    renderProfile();
  });

  // Bind Download Scorecard image button
  document.getElementById('btn-download-card')?.addEventListener('click', () => {
    const target = document.getElementById('share-card-target');
    if (!target) return;

    if (window.html2canvas) {
      window.html2canvas(target, {
        backgroundColor: null,
        useCORS: true,
        scale: 2 // Save as high-res PNG image
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${profile.name || 'Eco-Warrior'}-ecotrack-scorecard.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    } else {
      alert('html2canvas script is still loading. Please try again in a moment.');
    }
  });

  // Bind Share Impact button
  document.getElementById('btn-share-card')?.addEventListener('click', () => {
    const shareText = `I just calculated my carbon footprint on EcoTrack! My score is ${profile.footprint?.total || 0} tonnes CO₂/year. Check yours and let's reduce our impact together!`;
    const shareData = {
      title: 'EcoTrack Carbon Scorecard',
      text: shareText,
      url: window.location.origin + window.location.pathname
    };

    if (navigator.share) {
      navigator.share(shareData).catch(err => console.log('Web Share API blocked:', err));
    } else {
      navigator.clipboard.writeText(shareText + ' ' + shareData.url);
      alert('📋 scorecard stats copied to clipboard! Share it with your friends!');
    }
  });

  // Re-run lucide icons inside profile page
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
