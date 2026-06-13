// ============================================================
// GAMIFICATION.JS — Points, Badges, Levels, Streaks
// Carbon Footprint Awareness Platform
// ============================================================

import { BADGES, LEVELS } from './data.js';
import { getProfile, saveProfile, calculateStreak, getActionCount } from './storage.js';

export function initGamification() {
  // Check for any new badges on init
  const profile = getProfile();
  return checkBadges(profile);
}

/**
 * Check all badges and return newly unlocked ones
 * @param {Object} profile - User profile
 * @returns {Array} Array of newly unlocked badge objects
 */
export function checkBadges(profile) {
  const currentBadges = profile.badges || [];
  const newlyUnlocked = [];

  for (const badge of BADGES) {
    // Skip already unlocked
    if (currentBadges.includes(badge.id)) continue;

    let isUnlocked = false;

    switch (badge.condition) {
      case 'calculator_completed':
        isUnlocked = (profile.calculatorCompleted || 0) >= badge.threshold;
        break;

      case 'actions_logged':
        isUnlocked = (profile.totalActionsLogged || 0) >= badge.threshold;
        break;

      case 'streak':
        isUnlocked = calculateStreak() >= badge.threshold;
        break;

      case 'co2_saved':
        isUnlocked = (profile.totalCO2Saved || 0) >= badge.threshold;
        break;

      case 'points':
        isUnlocked = (profile.ecoPoints || 0) >= badge.threshold;
        break;

      case 'action_specific':
        isUnlocked = getActionCount(badge.actionId) >= badge.threshold;
        break;

      case 'level':
        isUnlocked = getLevel(profile.ecoPoints || 0).level >= badge.threshold;
        break;

      case 'category_actions':
        isUnlocked = (profile.totalActionsLogged || 0) >= badge.threshold;
        break;
    }

    if (isUnlocked) {
      currentBadges.push(badge.id);
      newlyUnlocked.push(badge);
    }
  }

  // Save if any new badges
  if (newlyUnlocked.length > 0) {
    profile.badges = currentBadges;
    saveProfile(profile);
  }

  return newlyUnlocked;
}

/**
 * Get the current level based on points
 * @param {number} points
 * @returns {Object} Level object
 */
export function getLevel(points) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (points >= lvl.minPoints) current = lvl;
  }
  return current;
}

/**
 * Get level progress details
 * @param {number} points
 * @returns {Object} { current, next, progress }
 */
export function getLevelProgress(points) {
  const current = getLevel(points);
  const currentIdx = LEVELS.findIndex(l => l.level === current.level);
  const next = LEVELS[currentIdx + 1] || null;

  if (!next) return { current, next: null, progress: 100 };

  const range = next.minPoints - current.minPoints;
  const progress = Math.min(((points - current.minPoints) / range) * 100, 100);
  return { current, next, progress: Math.round(progress) };
}

/**
 * Render badge notification popup
 * @param {Object} badge - Badge that was unlocked
 */
export function showBadgeNotification(badge) {
  // Create floating notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    background: white;
    border-radius: 1.5rem;
    padding: 2.5rem;
    text-align: center;
    box-shadow: 0 25px 50px rgba(0,0,0,0.15);
    z-index: 500;
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    max-width: 320px;
    width: 90%;
  `;

  notification.innerHTML = `
    <div style="font-size:4rem; margin-bottom:1rem; animation: badgeBounce 0.6s ease 0.3s both;">${badge.icon}</div>
    <h3 style="font-family:'Outfit',sans-serif; font-size:1.25rem; margin-bottom:0.5rem; color:#0F172A;">
      Badge Unlocked! 🎉
    </h3>
    <p style="font-weight:700; color:#10B981; font-size:1.1rem; margin-bottom:0.5rem;">${badge.label}</p>
    <p style="color:#64748B; font-size:0.875rem;">${badge.description}</p>
    <button style="
      margin-top:1.5rem;
      padding:0.5rem 2rem;
      background:linear-gradient(135deg,#10B981,#059669);
      color:white;
      border:none;
      border-radius:0.75rem;
      font-weight:600;
      font-size:0.875rem;
      cursor:pointer;
    " onclick="this.parentElement.remove(); document.getElementById('badge-overlay')?.remove();">
      Awesome! 🌟
    </button>
  `;

  // Overlay
  const overlay = document.createElement('div');
  overlay.id = 'badge-overlay';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 499;
    animation: fadeIn 0.3s ease;
  `;
  overlay.addEventListener('click', () => {
    notification.remove();
    overlay.remove();
  });

  document.body.appendChild(overlay);
  document.body.appendChild(notification);

  // Animate in
  requestAnimationFrame(() => {
    notification.style.transform = 'translate(-50%, -50%) scale(1)';
  });
}
