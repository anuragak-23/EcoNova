// ============================================================
// STORAGE.JS — LocalStorage Abstraction Layer
// Carbon Footprint Awareness Platform
// ============================================================

const STORAGE_PREFIX = 'cfp_';

// ── Helpers ─────────────────────────────────────────────────
function getKey(key) {
  return STORAGE_PREFIX + key;
}

function save(key, data) {
  try {
    localStorage.setItem(getKey(key), JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Storage save error:', e);
    return false;
  }
}

function load(key) {
  try {
    const raw = localStorage.getItem(getKey(key));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Storage load error:', e);
    return null;
  }
}

function remove(key) {
  localStorage.removeItem(getKey(key));
}

// ── User Profile ────────────────────────────────────────────
const DEFAULT_PROFILE = {
  name: 'Eco Warrior',
  createdAt: new Date().toISOString(),
  footprint: {
    total: 0,
    transport: 0,
    energy: 0,
    food: 0,
    lifestyle: 0,
    lastCalculated: null,
    calculatorAnswers: null,
  },
  ecoPoints: 0,
  streak: 0,
  longestStreak: 0,
  totalCO2Saved: 0,
  totalActionsLogged: 0,
  calculatorCompleted: 0,
  badges: [],
  settings: {
    theme: 'light',
    units: 'metric',
    country: 'IN',
  },
};

export function getProfile() {
  const profile = load('profile');
  if (!profile) {
    save('profile', DEFAULT_PROFILE);
    return { ...DEFAULT_PROFILE };
  }
  // Merge with defaults to handle version upgrades
  return { ...DEFAULT_PROFILE, ...profile, footprint: { ...DEFAULT_PROFILE.footprint, ...profile.footprint }, settings: { ...DEFAULT_PROFILE.settings, ...profile.settings } };
}

export function saveProfile(profile) {
  return save('profile', profile);
}

export function updateProfile(updates) {
  const profile = getProfile();
  const merged = deepMerge(profile, updates);
  return save('profile', merged);
}

export function isNewUser() {
  return load('profile') === null;
}

// ── Daily Logs ──────────────────────────────────────────────
export function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getDailyLog(dateKey) {
  const logs = load('daily_logs') || {};
  return logs[dateKey] || { date: dateKey, actions: [], pointsEarned: 0, co2Saved: 0 };
}

export function saveDailyLog(dateKey, log) {
  const logs = load('daily_logs') || {};
  logs[dateKey] = log;
  save('daily_logs', logs);
}

export function getAllLogs() {
  return load('daily_logs') || {};
}

export function getRecentLogs(days = 30) {
  const logs = getAllLogs();
  const result = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    result.push(logs[key] || { date: key, actions: [], pointsEarned: 0, co2Saved: 0 });
  }

  return result;
}

// ── Streak Calculation ──────────────────────────────────────
export function calculateStreak() {
  const logs = getAllLogs();
  let streak = 0;
  const today = new Date();

  // Check if user has logged today
  const todayKey = getTodayKey();
  const todayLog = logs[todayKey];
  const hasLoggedToday = todayLog && todayLog.actions && todayLog.actions.length > 0;

  // Start from today (or yesterday if not logged today)
  const startOffset = hasLoggedToday ? 0 : 1;

  for (let i = startOffset; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const log = logs[key];

    if (log && log.actions && log.actions.length > 0) {
      streak++;
    } else {
      break;
    }
  }

  // If logged today, add today to streak
  if (hasLoggedToday) {
    streak++;
  }

  return streak;
}

// ── Action-Specific Counts ──────────────────────────────────
export function getActionCount(actionId) {
  const logs = getAllLogs();
  let count = 0;
  for (const log of Object.values(logs)) {
    if (log.actions && log.actions.includes(actionId)) {
      count++;
    }
  }
  return count;
}

export function getCategoryActionCount(category) {
  // This requires knowing which actions belong to which category
  // We'll import ECO_ACTIONS from data.js when needed
  const logs = getAllLogs();
  let count = 0;
  for (const log of Object.values(logs)) {
    if (log.actions) {
      count += log.actions.length; // simplified
    }
  }
  return count;
}

// ── Statistics ──────────────────────────────────────────────
export function getStats() {
  const profile = getProfile();
  const logs = getAllLogs();
  const logValues = Object.values(logs);

  const totalActions = logValues.reduce((sum, log) => sum + (log.actions ? log.actions.length : 0), 0);
  const totalCO2Saved = logValues.reduce((sum, log) => sum + (log.co2Saved || 0), 0);
  const totalPoints = logValues.reduce((sum, log) => sum + (log.pointsEarned || 0), 0);
  const daysActive = logValues.filter(log => log.actions && log.actions.length > 0).length;

  return {
    totalActions,
    totalCO2Saved: Math.round(totalCO2Saved * 10) / 10,
    totalPoints,
    daysActive,
    streak: calculateStreak(),
    longestStreak: profile.longestStreak || 0,
    footprint: profile.footprint,
    level: profile.level || 1,
    badges: profile.badges || [],
  };
}

// ── Weekly Data for Charts ──────────────────────────────────
export function getWeeklyData(weeks = 4) {
  const logs = getAllLogs();
  const result = [];
  const today = new Date();

  for (let w = weeks - 1; w >= 0; w--) {
    let weekCO2 = 0;
    let weekActions = 0;
    let weekPoints = 0;
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - (w * 7 + 6));

    for (let d = 0; d < 7; d++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + d);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const log = logs[key];
      if (log) {
        weekCO2 += log.co2Saved || 0;
        weekActions += log.actions ? log.actions.length : 0;
        weekPoints += log.pointsEarned || 0;
      }
    }

    const label = `Week ${weeks - w}`;
    result.push({ label, co2Saved: Math.round(weekCO2 * 10) / 10, actions: weekActions, points: weekPoints });
  }

  return result;
}

// ── Theme ───────────────────────────────────────────────────
export function getTheme() {
  const profile = getProfile();
  return profile.settings.theme || 'light';
}

export function setTheme(theme) {
  updateProfile({ settings: { theme } });
}

// ── Reset ───────────────────────────────────────────────────
export function resetAllData() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
  keys.forEach(k => localStorage.removeItem(k));
}

// ── Deep Merge Utility ──────────────────────────────────────
function deepMerge(target, source) {
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}
