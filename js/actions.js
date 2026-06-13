// ============================================================
// ACTIONS.JS — Eco-Action Tracker
// Carbon Footprint Awareness Platform
// ============================================================

import { ECO_ACTIONS, CATEGORIES } from './data.js';
import { getProfile, saveProfile, getTodayKey, getDailyLog, saveDailyLog, calculateStreak } from './storage.js';

let activeFilters = { category: 'all', impact: 'all' };

export function initActions() {
  renderActions();
}

export function refreshActions() {
  renderActions();
}

function renderActions() {
  const container = document.getElementById('actions-content');
  if (!container) return;

  const todayKey = getTodayKey();
  const todayLog = getDailyLog(todayKey);
  const checkedActions = todayLog.actions || [];

  container.innerHTML = `
    <!-- Today's Summary -->
    <div class="today-summary">
      <div class="today-stat">
        <div class="today-stat-value" style="color:var(--primary)" id="today-actions-count">${checkedActions.length}</div>
        <div class="today-stat-label">Actions Today</div>
      </div>
      <div class="today-stat">
        <div class="today-stat-value" style="color:var(--cat-food)" id="today-co2-saved">${(todayLog.co2Saved || 0).toFixed(1)}</div>
        <div class="today-stat-label">kg CO₂ Saved</div>
      </div>
      <div class="today-stat">
        <div class="today-stat-value" style="color:var(--warning)" id="today-points">${todayLog.pointsEarned || 0}</div>
        <div class="today-stat-label">Points Earned</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="actions-header">
      <h2 style="font-size:var(--text-xl)">✅ Log Today's Eco-Actions</h2>
      <div class="actions-filter" id="action-filters">
        <button class="filter-chip active" data-filter="category" data-value="all">All</button>
        ${Object.entries(CATEGORIES).map(([key, cat]) =>
          `<button class="filter-chip" data-filter="category" data-value="${key}">${cat.icon} ${cat.label}</button>`
        ).join('')}
        <span style="width:1px;height:24px;background:var(--border);margin:0 4px"></span>
        <button class="filter-chip" data-filter="impact" data-value="high">🔴 High</button>
        <button class="filter-chip" data-filter="impact" data-value="medium">🟡 Medium</button>
        <button class="filter-chip" data-filter="impact" data-value="low">🔵 Low</button>
      </div>
    </div>

    <!-- Actions Grid -->
    <div class="actions-grid" id="actions-grid">
      ${renderActionCards(checkedActions)}
    </div>
  `;

  // Bind filter clicks
  container.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => handleFilterClick(chip));
  });

  // Bind action card clicks
  bindActionCardClicks();
}

function renderActionCards(checkedActions, categoryFilter = 'all', impactFilter = 'all') {
  let filtered = ECO_ACTIONS;

  if (categoryFilter !== 'all') {
    filtered = filtered.filter(a => a.category === categoryFilter);
  }
  if (impactFilter !== 'all') {
    filtered = filtered.filter(a => a.impact === impactFilter);
  }

  if (filtered.length === 0) {
    return `
      <div class="empty-state" style="grid-column:1/-1;padding:var(--space-8)">
        <div class="empty-state-icon">🔍</div>
        <h3 class="empty-state-title">No actions found</h3>
        <p class="empty-state-text">Try changing the filters to see more actions.</p>
      </div>
    `;
  }

  return filtered.map(action => {
    const isChecked = checkedActions.includes(action.id);
    return `
      <div class="action-card ${isChecked ? 'checked' : ''}" data-action-id="${action.id}">
        <div class="action-check">
          ${isChecked ? '✓' : ''}
        </div>
        <div class="action-info">
          <div class="action-name">${action.icon} ${action.label}</div>
          <div class="action-meta">
            <span class="action-co2">🌿 ${action.co2Saved} kg</span>
            <span class="action-points">⭐ ${action.points} pts</span>
            <span class="impact-badge ${action.impact}">${action.impact}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function handleFilterClick(chip) {
  const filterType = chip.dataset.filter;
  const filterValue = chip.dataset.value;

  if (filterType === 'category') {
    activeFilters.category = filterValue;
    // Update active state for category chips
    document.querySelectorAll('.filter-chip[data-filter="category"]').forEach(c => {
      c.classList.toggle('active', c.dataset.value === filterValue);
    });
  } else if (filterType === 'impact') {
    // Toggle impact filter
    if (activeFilters.impact === filterValue) {
      activeFilters.impact = 'all';
      chip.classList.remove('active');
    } else {
      activeFilters.impact = filterValue;
      document.querySelectorAll('.filter-chip[data-filter="impact"]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    }
  }

  // Re-render actions grid
  const todayKey = getTodayKey();
  const todayLog = getDailyLog(todayKey);
  const grid = document.getElementById('actions-grid');
  if (grid) {
    grid.innerHTML = renderActionCards(todayLog.actions || [], activeFilters.category, activeFilters.impact);
    bindActionCardClicks();
  }
}

function bindActionCardClicks() {
  document.querySelectorAll('.action-card').forEach(card => {
    card.addEventListener('click', () => handleActionToggle(card));
  });
}

function handleActionToggle(card) {
  const actionId = card.dataset.actionId;
  const action = ECO_ACTIONS.find(a => a.id === actionId);
  if (!action) return;

  const todayKey = getTodayKey();
  const todayLog = getDailyLog(todayKey);
  const isCurrentlyChecked = todayLog.actions.includes(actionId);

  if (isCurrentlyChecked) {
    // Uncheck
    todayLog.actions = todayLog.actions.filter(id => id !== actionId);
    todayLog.co2Saved = Math.max(0, (todayLog.co2Saved || 0) - action.co2Saved);
    todayLog.pointsEarned = Math.max(0, (todayLog.pointsEarned || 0) - action.points);
    card.classList.remove('checked');
    card.querySelector('.action-check').textContent = '';
    showToast(`❌ Removed: ${action.label}`);
  } else {
    // Check
    todayLog.actions.push(actionId);
    todayLog.co2Saved = (todayLog.co2Saved || 0) + action.co2Saved;
    todayLog.pointsEarned = (todayLog.pointsEarned || 0) + action.points;
    card.classList.add('checked');
    card.querySelector('.action-check').textContent = '✓';

    // Add a little bounce animation
    card.style.transform = 'scale(1.03)';
    setTimeout(() => { card.style.transform = ''; }, 200);

    showToast(`✅ +${action.co2Saved} kg CO₂ saved! +${action.points} points`);
  }

  // Save daily log
  saveDailyLog(todayKey, todayLog);

  // Update profile totals
  const profile = getProfile();
  if (isCurrentlyChecked) {
    profile.totalCO2Saved = Math.max(0, (profile.totalCO2Saved || 0) - action.co2Saved);
    profile.totalActionsLogged = Math.max(0, (profile.totalActionsLogged || 0) - 1);
    profile.ecoPoints = Math.max(0, (profile.ecoPoints || 0) - action.points);
  } else {
    profile.totalCO2Saved = (profile.totalCO2Saved || 0) + action.co2Saved;
    profile.totalActionsLogged = (profile.totalActionsLogged || 0) + 1;
    profile.ecoPoints = (profile.ecoPoints || 0) + action.points;
  }
  saveProfile(profile);

  // Update today's summary
  updateTodaySummary(todayLog);

  // Update header stats
  updateHeaderStats(profile);
}

function updateTodaySummary(todayLog) {
  const actionsCount = document.getElementById('today-actions-count');
  const co2Saved = document.getElementById('today-co2-saved');
  const points = document.getElementById('today-points');

  if (actionsCount) actionsCount.textContent = todayLog.actions.length;
  if (co2Saved) co2Saved.textContent = (todayLog.co2Saved || 0).toFixed(1);
  if (points) points.textContent = todayLog.pointsEarned || 0;
}

function updateHeaderStats(profile) {
  const streakEl = document.getElementById('header-streak-value');
  const pointsEl = document.getElementById('header-points-value');
  const streakContainer = document.getElementById('header-streak');
  const pointsContainer = document.getElementById('header-points');

  if (pointsEl) pointsEl.textContent = profile.ecoPoints || 0;
  if (pointsContainer) pointsContainer.style.display = 'flex';

  // Recalculate streak
  const streak = calculateStreak();

  if (streakEl && streakContainer) {
    streakEl.textContent = streak;
    if (streak > 0) {
      streakContainer.style.display = 'flex';
    } else {
      streakContainer.style.display = 'none';
    }
  }
}

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.id = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// Export showToast for use by other modules
export { showToast };
