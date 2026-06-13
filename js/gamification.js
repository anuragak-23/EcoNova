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
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  const bgColor = theme === 'dark' ? '#1E293B' : '#FFFFFF';
  const textColor = theme === 'dark' ? '#F1F5F9' : '#0F172A';
  const descColor = theme === 'dark' ? '#94A3B8' : '#64748B';
  const cardBorder = theme === 'dark' ? '1px solid #334155' : 'none';

  // Create floating notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    background: ${bgColor};
    color: ${textColor};
    border-radius: 1.5rem;
    border: ${cardBorder};
    padding: 2.5rem;
    text-align: center;
    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
    z-index: 99999;
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    max-width: 320px;
    width: 90%;
  `;

  notification.innerHTML = `
    <div style="font-size:4rem; margin-bottom:1rem; animation: badgeBounce 0.6s ease 0.3s both;">${badge.icon}</div>
    <h3 style="font-family:'Outfit',sans-serif; font-size:1.25rem; margin-bottom:0.5rem;">
      Badge Unlocked! 🎉
    </h3>
    <p style="font-weight:700; color:#10B981; font-size:1.1rem; margin-bottom:0.5rem;">${badge.label}</p>
    <p style="color:${descColor}; font-size:0.875rem;">${badge.description}</p>
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
    background: rgba(0,0,0,0.5);
    z-index: 99998;
    animation: fadeIn 0.3s ease;
  `;
  overlay.addEventListener('click', () => {
    notification.remove();
    overlay.remove();
  });

  document.body.appendChild(overlay);
  document.body.appendChild(notification);

  // Trigger Confetti
  if (window.confetti) {
    window.confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 }
    });
    setTimeout(() => {
      window.confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } });
      window.confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } });
    }, 250);
  }

  // Trigger Sound Chime
  playBadgeChime();

  // Animate in
  requestAnimationFrame(() => {
    notification.style.transform = 'translate(-50%, -50%) scale(1)';
  });
}

function playBadgeChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // First tone (C5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.4);

    // Second tone (E5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
    gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.62);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.62);
  } catch (e) {
    console.warn('Success sound play blocked:', e);
  }
}

/**
 * Calculates evolving Carbon Avatar details based on total yearly CO2 emissions.
 * @param {number} footprintTotal - Total footprint in tonnes/year
 * @returns {Object} Avatar details
 */
export function getAvatarInfo(footprintTotal) {
  if (footprintTotal === 0 || !footprintTotal) {
    return {
      rank: 'Eco Rookie',
      avatar: '🌱',
      description: 'Evolve your avatar by calculating your carbon footprint first!',
      color: '#94A3B8',
      nextRank: 'Eco Learner',
      threshold: '10.0',
      progress: 0
    };
  }

  if (footprintTotal > 10) {
    return {
      rank: 'High Polluter',
      avatar: '🌫️',
      description: 'Your carbon footprint is high. Take daily actions to start reducing it!',
      color: '#EF4444',
      nextRank: 'Eco Learner',
      threshold: '10.0',
      progress: Math.max(0, Math.min(100, Math.round(((15 - footprintTotal) / 5) * 100)))
    };
  } else if (footprintTotal > 4.7) {
    return {
      rank: 'Eco Learner',
      avatar: '🌿',
      description: 'You are doing better! Log actions to cut emissions below global average.',
      color: '#F59E0B',
      nextRank: 'Climate Hero',
      threshold: '4.7',
      progress: Math.max(0, Math.min(100, Math.round(((10 - footprintTotal) / 5.3) * 100)))
    };
  } else if (footprintTotal > 2.0) {
    return {
      rank: 'Climate Hero',
      avatar: '🌳',
      description: 'Fantastic! Below global average. Aim for the Paris target!',
      color: '#10B981',
      nextRank: 'Planet Guardian',
      threshold: '2.0',
      progress: Math.max(0, Math.min(100, Math.round(((4.7 - footprintTotal) / 2.7) * 100)))
    };
  } else {
    return {
      rank: 'Planet Guardian',
      avatar: '🌎',
      description: 'Incredible! You have reached the ultimate climate target. Keep it up!',
      color: '#059669',
      nextRank: 'Maximum Rank Reached! 🌟',
      threshold: '0.0',
      progress: 100
    };
  }
}

