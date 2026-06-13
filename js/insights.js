// ============================================================
// INSIGHTS.JS — Personalized Insights & Recommendations
// Carbon Footprint Awareness Platform
// ============================================================

import { ECO_ACTIONS, IMPACT_EQUIVALENTS, CATEGORIES, BENCHMARKS } from './data.js';
import { getProfile, getStats } from './storage.js';

export function initInsights() {
  renderInsights();
}

function renderInsights() {
  const container = document.getElementById('insights-content');
  if (!container) return;

  const profile = getProfile();
  const stats = getStats();
  const hasFootprint = profile.footprint && profile.footprint.total > 0;

  if (!hasFootprint) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💡</div>
        <h3 class="empty-state-title">Unlock Personalized Insights</h3>
        <p class="empty-state-text">
          Complete the carbon calculator first, and we'll generate personalized recommendations to help you reduce your footprint.
        </p>
        <button class="btn btn-primary btn-lg" onclick="document.querySelector('[data-tab=calculator]').click()">
          🧮 Take the Calculator
        </button>
      </div>
    `;
    return;
  }

  const insights = generateInsights(profile, stats);
  const topActions = getTopActions(profile);
  const equivalents = calculateEquivalents(stats.totalCO2Saved);

  container.innerHTML = `
    <h2 style="font-size:var(--text-2xl); margin-bottom:var(--space-2)">💡 Your Personalized Insights</h2>
    <p style="color:var(--text-secondary); margin-bottom:var(--space-6)">
      Based on your footprint of <strong>${profile.footprint.total} tonnes CO₂/year</strong>, here's how you can make the biggest impact.
    </p>

    <!-- Impact Equivalents -->
    ${stats.totalCO2Saved > 0 ? `
      <div class="card mb-6" style="background: linear-gradient(135deg, var(--primary-bg), var(--secondary-bg));">
        <div class="card-header">
          <h3 class="card-title">🌟 Your Impact So Far</h3>
        </div>
        <p style="color:var(--text-secondary); margin-bottom:var(--space-4)">
          You've saved <strong style="color:var(--primary)">${stats.totalCO2Saved} kg CO₂</strong> through your actions!
        </p>
        <div class="stats-grid" style="margin-bottom:0">
          ${equivalents.map(eq => `
            <div class="stat-card primary" style="border-left-color: var(--primary)">
              <div class="stat-card-icon">${eq.icon}</div>
              <div class="stat-card-value" style="font-size:var(--text-2xl)">${eq.value}</div>
              <div class="stat-card-label">${eq.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Biggest Impact Actions -->
    <div class="card mb-6">
      <div class="card-header">
        <h3 class="card-title">🎯 Biggest Impact Actions</h3>
      </div>
      <p class="card-subtitle" style="margin-bottom:var(--space-4)">
        Focus on these actions to reduce your <strong>${getHighestCategory(profile.footprint)}</strong> emissions — your highest category.
      </p>
      <div class="actions-grid" style="margin-bottom:0">
        ${topActions.map(action => `
          <div class="insight-card" style="cursor:pointer" onclick="document.querySelector('[data-tab=actions]').click()">
            <div class="insight-icon ${action.category}">${action.icon}</div>
            <div class="insight-body">
              <div class="insight-title">${action.label}</div>
              <div class="action-meta" style="margin-top:var(--space-1)">
                <span class="action-co2">🌿 ${action.co2Saved} kg CO₂/day</span>
                <span class="action-points">⭐ ${action.points} pts</span>
              </div>
              <div class="insight-impact">
                ${(action.co2Saved * 365).toFixed(0)} kg CO₂ saved per year
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Personalized Insights -->
    <div class="card mb-6">
      <div class="card-header">
        <h3 class="card-title">📊 Detailed Insights</h3>
      </div>
      <div class="insights-list">
        ${insights.map(insight => `
          <div class="insight-card">
            <div class="insight-icon ${insight.category}">${insight.icon}</div>
            <div class="insight-body">
              <div class="insight-title">${insight.title}</div>
              <div class="insight-text">${insight.text}</div>
              ${insight.impact ? `<div class="insight-impact">${insight.impact}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Comparison Insight -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">🌍 Where You Stand</h3>
      </div>
      <div class="comparison-bars">
        <div class="comparison-bar-row">
          <span class="comparison-bar-label">🧑 You</span>
          <div class="comparison-bar-track">
            <div class="comparison-bar-fill" style="width:${Math.min((profile.footprint.total / 16) * 100, 100)}%; background:${profile.footprint.total <= 2 ? '#10B981' : profile.footprint.total <= 4.7 ? '#F59E0B' : '#EF4444'}"></div>
          </div>
          <span class="comparison-bar-value">${profile.footprint.total}t</span>
        </div>
        ${Object.entries(BENCHMARKS).map(([key, b]) => `
          <div class="comparison-bar-row">
            <span class="comparison-bar-label">${b.emoji} ${b.label.split(' ')[0]}</span>
            <div class="comparison-bar-track">
              <div class="comparison-bar-fill" style="width:${Math.min((b.value / 16) * 100, 100)}%; background:${b.color}"></div>
            </div>
            <span class="comparison-bar-value">${b.value}t</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function getHighestCategory(footprint) {
  const cats = { transport: footprint.transport, energy: footprint.energy, food: footprint.food, lifestyle: footprint.lifestyle };
  const highest = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
  return CATEGORIES[highest[0]]?.label || 'Transport';
}

function getTopActions(profile) {
  const fp = profile.footprint;
  const cats = { transport: fp.transport, energy: fp.energy, food: fp.food, lifestyle: fp.lifestyle };
  const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  const topCategory = sorted[0][0];

  // Get highest-impact actions from the top category
  return ECO_ACTIONS
    .filter(a => a.category === topCategory)
    .sort((a, b) => b.co2Saved - a.co2Saved)
    .slice(0, 3);
}

function generateInsights(profile, stats) {
  const fp = profile.footprint;
  const insights = [];

  // Transport insights
  if (fp.transport > 1.5) {
    insights.push({
      category: 'transport',
      icon: '🚴',
      title: 'Switch Your Commute',
      text: `Your transport emissions are ${fp.transport} tonnes/year. Cycling or using public transport just 2 days a week could reduce this by 30-40%.`,
      impact: `Potential saving: ${(fp.transport * 0.35).toFixed(1)} tonnes CO₂/year`,
    });
  }

  if (fp.transport > 0.5) {
    insights.push({
      category: 'transport',
      icon: '✈️',
      title: 'Consider Flight Alternatives',
      text: 'A single return domestic flight emits as much CO₂ as 3 months of car commuting. Consider trains for shorter distances.',
      impact: 'Each avoided domestic flight saves ~150 kg CO₂',
    });
  }

  // Energy insights
  if (fp.energy > 1.0) {
    insights.push({
      category: 'energy',
      icon: '💡',
      title: 'Optimize Home Energy',
      text: `Your energy footprint is ${fp.energy} tonnes/year. Simple changes like LED bulbs, unplugging devices, and using a fan instead of AC can make a big difference.`,
      impact: `Potential saving: ${(fp.energy * 0.25).toFixed(1)} tonnes CO₂/year`,
    });
  }

  if (fp.energy > 0.5) {
    insights.push({
      category: 'energy',
      icon: '☀️',
      title: 'Explore Renewable Energy',
      text: 'Even a small solar panel setup can offset 30-50% of household electricity. Many states offer subsidies for rooftop solar.',
      impact: 'Solar panels can reduce energy footprint by 40-60%',
    });
  }

  // Food insights
  if (fp.food > 2.0) {
    insights.push({
      category: 'food',
      icon: '🥬',
      title: 'Try More Plant-Based Meals',
      text: `Your food footprint is ${fp.food} tonnes/year. Having 2-3 meatless days per week can reduce food emissions by 25%.`,
      impact: `Potential saving: ${(fp.food * 0.25).toFixed(1)} tonnes CO₂/year`,
    });
  }

  insights.push({
    category: 'food',
    icon: '🏪',
    title: 'Buy Local & Seasonal',
    text: 'Locally sourced food travels shorter distances and has a smaller carbon footprint. Visit your local farmer\'s market!',
    impact: 'Local food can reduce food transport emissions by up to 90%',
  });

  // Lifestyle insights
  if (fp.lifestyle > 0.3) {
    insights.push({
      category: 'lifestyle',
      icon: '♻️',
      title: 'Embrace Conscious Consumption',
      text: 'Before buying new, ask: "Do I really need this?" Extending the life of clothing by 9 months reduces its carbon footprint by 20-30%.',
      impact: `Potential saving: ${(fp.lifestyle * 0.3).toFixed(1)} tonnes CO₂/year`,
    });
  }

  // General insights
  insights.push({
    category: 'general',
    icon: '🌳',
    title: 'Plant Trees for Long-Term Impact',
    text: 'A single tree absorbs about 22 kg of CO₂ per year. Planting trees in your community creates lasting positive impact.',
    impact: '10 trees offset about 220 kg CO₂ per year',
  });

  if (stats.streak >= 7) {
    insights.push({
      category: 'general',
      icon: '🔥',
      title: 'Amazing Streak!',
      text: `You've maintained a ${stats.streak}-day eco-action streak! Consistency is key to making a real difference. Keep it up!`,
      impact: null,
    });
  }

  if (stats.totalActions >= 50) {
    insights.push({
      category: 'general',
      icon: '🏆',
      title: 'Action Hero',
      text: `You've logged ${stats.totalActions} eco-actions! Your consistent effort is making a real difference for the planet.`,
      impact: `Total impact: ${stats.totalCO2Saved.toFixed(1)} kg CO₂ saved`,
    });
  }

  return insights;
}

function calculateEquivalents(kgCO2Saved) {
  if (kgCO2Saved <= 0) return [];

  const equivalents = [];

  // Trees
  const trees = kgCO2Saved / IMPACT_EQUIVALENTS.tree_year.kgCO2;
  if (trees >= 0.1) {
    equivalents.push({
      icon: '🌳',
      value: trees >= 1 ? Math.round(trees) : trees.toFixed(1),
      label: trees >= 2 ? IMPACT_EQUIVALENTS.tree_year.label : IMPACT_EQUIVALENTS.tree_year.singular,
    });
  }

  // km driven
  const km = kgCO2Saved / IMPACT_EQUIVALENTS.km_driven.kgCO2;
  if (km >= 1) {
    equivalents.push({
      icon: '🚗',
      value: Math.round(km),
      label: IMPACT_EQUIVALENTS.km_driven.label,
    });
  }

  // Showers
  const showers = kgCO2Saved / IMPACT_EQUIVALENTS.showers.kgCO2;
  if (showers >= 1) {
    equivalents.push({
      icon: '🚿',
      value: Math.round(showers),
      label: showers >= 2 ? IMPACT_EQUIVALENTS.showers.label : IMPACT_EQUIVALENTS.showers.singular,
    });
  }

  return equivalents.slice(0, 4);
}
