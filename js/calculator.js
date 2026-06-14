// ============================================================
// CALCULATOR.JS — Multi-step Carbon Footprint Calculator
// Carbon Footprint Awareness Platform
// ============================================================

import { CALCULATOR_QUESTIONS, EMISSION_FACTORS, BENCHMARKS, CATEGORY_COLORS } from './data.js';
import { getProfile, saveProfile } from './storage.js';

let currentStep = 0;
const steps = ['transport', 'energy', 'food', 'lifestyle', 'results'];
export const answers = {};
let resultsChart = null;
let breakdownChart = null;

export function getCurrentStep() { return currentStep; }

export function initCalculator() {
  const container = document.getElementById('calculator-content');
  if (!container) return;

  currentStep = 0;
  Object.keys(answers).forEach(k => delete answers[k]);

  container.innerHTML = `
    <div class="calculator-wrapper">
      <div class="calc-progress" id="calc-progress">
        ${steps.slice(0, 4).map((step, i) => `
          <div class="calc-progress-step">
            <div class="calc-progress-dot ${i === 0 ? 'active' : ''}" data-step="${i}">
              ${CALCULATOR_QUESTIONS[step] ? CALCULATOR_QUESTIONS[step].icon : '📊'}
            </div>
            ${i < 3 ? '<div class="calc-progress-line"></div>' : ''}
          </div>
        `).join('')}
        <div class="calc-progress-step">
          <div class="calc-progress-dot" data-step="4">📊</div>
        </div>
      </div>

      ${steps.map((step, i) => `
        <div class="calc-step ${i === 0 ? 'active' : ''}" id="calc-step-${i}">
          ${i < 4 ? renderQuestionStep(step, i) : '<div id="calc-results"></div>'}
        </div>
      `).join('')}
    </div>
  `;

  // Bind range inputs
  container.querySelectorAll('input[type="range"]').forEach(input => {
    input.addEventListener('input', (e) => {
      const display = document.getElementById(`val-${e.target.id}`);
      if (display) display.textContent = e.target.value;
      e.target.setAttribute('aria-valuenow', e.target.value);
    });
  });

  // Bind navigation buttons
  container.querySelectorAll('.btn-calc-next').forEach(btn => {
    btn.addEventListener('click', () => nextStep());
  });
  container.querySelectorAll('.btn-calc-prev').forEach(btn => {
    btn.addEventListener('click', () => prevStep());
  });
}

function renderQuestionStep(stepKey, stepIndex) {
  const step = CALCULATOR_QUESTIONS[stepKey];
  if (!step) return '';

  return `
    <div class="calc-step-header">
      <div class="calc-step-icon">${step.icon}</div>
      <h2 class="calc-step-title">${step.title}</h2>
      <p class="calc-step-desc">${step.description}</p>
    </div>

    ${step.questions.map(q => renderQuestion(q, stepKey)).join('')}

    <div class="btn-group">
      ${stepIndex > 0 ? '<button class="btn btn-secondary btn-calc-prev">← Back</button>' : ''}
      <button class="btn btn-primary btn-lg btn-calc-next">
        ${stepIndex < 3 ? 'Next →' : 'Calculate My Footprint 🌍'}
      </button>
    </div>
  `;
}

function renderQuestion(q, stepKey) {
  const id = `${stepKey}_${q.id}`;

  if (q.type === 'select') {
    return `
      <div class="form-group">
        <label class="form-label" for="${id}">${q.label}</label>
        <select class="form-select" id="${id}" name="${id}">
          ${q.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
        </select>
        ${q.helpText ? `<p class="form-help">${q.helpText}</p>` : ''}
      </div>
    `;
  }

  if (q.type === 'range') {
    return `
      <div class="form-group">
        <label class="form-label" for="${id}">${q.label}</label>
        <div class="range-input-group">
          <div class="range-value-display">
            <span class="range-value" id="val-${id}">${q.default}</span>
            <span class="range-unit">${q.unit}</span>
          </div>
          <input type="range" id="${id}" name="${id}"
            min="${q.min}" max="${q.max}" step="${q.step}" value="${q.default}"
            aria-label="${q.label}"
            aria-valuemin="${q.min}"
            aria-valuemax="${q.max}"
            aria-valuenow="${q.default}">
        </div>
        ${q.helpText ? `<p class="form-help">${q.helpText}</p>` : ''}
      </div>
    `;
  }

  return '';
}

function collectAnswers(stepIndex) {
  const stepKey = steps[stepIndex];
  const step = CALCULATOR_QUESTIONS[stepKey];
  if (!step) return;

  step.questions.forEach(q => {
    const id = `${stepKey}_${q.id}`;
    const el = document.getElementById(id);
    if (el) {
      answers[q.id] = q.type === 'range' ? parseFloat(el.value) : el.value;
    }
  });
}

function nextStep() {
  collectAnswers(currentStep);
  if (currentStep < steps.length - 1) {
    currentStep++;
    updateStepUI();
    if (currentStep === 4) {
      renderResults();
    }
  }
}

function prevStep() {
  if (currentStep > 0) {
    currentStep--;
    updateStepUI();
  }
}

function updateStepUI() {
  // Update step visibility
  document.querySelectorAll('.calc-step').forEach((el, i) => {
    el.classList.toggle('active', i === currentStep);
  });

  // Update progress dots
  document.querySelectorAll('.calc-progress-dot').forEach((dot, i) => {
    dot.classList.remove('active', 'completed');
    if (i === currentStep) dot.classList.add('active');
    else if (i < currentStep) dot.classList.add('completed');
  });

  // Update progress lines
  document.querySelectorAll('.calc-progress-line').forEach((line, i) => {
    line.classList.toggle('active', i < currentStep);
  });
}

export function calculateFootprint() {
  const result = { transport: 0, energy: 0, food: 0, lifestyle: 0, total: 0 };

  // ── Transport ──
  const commuteMode = answers.commute_mode || 'car_petrol';
  const commuteDist = answers.commute_distance || 10;
  const commuteDays = answers.commute_days || 5;
  const flightsShort = answers.flights_short || 0;
  const flightsLong = answers.flights_long || 0;

  if (commuteMode !== 'wfh') {
    const modeFactor = EMISSION_FACTORS.transport[commuteMode]?.factor || 0.21;
    result.transport += modeFactor * commuteDist * 2 * commuteDays * 52 / 1000;
  }
  result.transport += flightsShort * 800 * EMISSION_FACTORS.transport.flight_short.factor / 1000;
  result.transport += flightsLong * 4000 * EMISSION_FACTORS.transport.flight_long.factor / 1000;

  // ── Energy ──
  const electricityBill = answers.electricity_bill || 150;
  const cookingFuel = answers.cooking_fuel || 'lpg';
  const lpgCylinders = answers.lpg_cylinders || 8;
  const acUsage = answers.ac_usage || 4;
  const renewable = answers.renewable || 'none';

  let elecMultiplier = 1;
  if (renewable === 'full') elecMultiplier = 0.1;
  else if (renewable === 'partial') elecMultiplier = 0.5;

  result.energy += electricityBill * EMISSION_FACTORS.energy.electricity_india.factor * elecMultiplier * 12 / 1000;

  if (cookingFuel === 'lpg') {
    result.energy += lpgCylinders * 14.2 * EMISSION_FACTORS.energy.lpg.factor / 1000;
  } else if (cookingFuel === 'natural_gas') {
    result.energy += lpgCylinders * 10 * EMISSION_FACTORS.energy.natural_gas.factor / 1000;
  }

  result.energy += acUsage * 1.5 * EMISSION_FACTORS.energy.electricity_india.factor * elecMultiplier * 120 / 1000;

  // ── Food ──
  const dietType = answers.diet_type || 'vegetarian';
  const foodWaste = answers.food_waste || 'low';
  const foodSource = answers.food_source || 'mixed';
  const foodDelivery = answers.food_delivery || 3;

  const wasteMultiplier = { high: 1.3, medium: 1.15, low: 1.05, none: 1.0 }[foodWaste] || 1.05;
  const sourceMultiplier = { imported: 1.2, mixed: 1.1, local: 1.0 }[foodSource] || 1.1;

  result.food += EMISSION_FACTORS.food[dietType].factor * 365 * wasteMultiplier * sourceMultiplier / 1000;
  result.food += foodDelivery * 0.5 * 52 / 1000;

  // ── Lifestyle ──
  const clothingHabit = answers.clothing_habit || 'moderate';
  const electronicsHabit = answers.electronics_habit || 1;
  const onlineShopping = answers.online_shopping || 4;
  const recycling = answers.recycling || 'sometimes';

  const clothingValues = { fast: 600, moderate: 300, minimal: 100, secondhand: 50 };
  const recycleMultiplier = { always: 0.85, sometimes: 0.95, rarely: 1.0, never: 1.05 }[recycling] || 0.95;

  result.lifestyle += (clothingValues[clothingHabit] || 300) / 1000;
  result.lifestyle += electronicsHabit * 70 / 1000;
  result.lifestyle += onlineShopping * 0.5 * 12 / 1000;
  result.lifestyle *= recycleMultiplier;

  // ── Total ──
  result.transport = Math.round(result.transport * 100) / 100;
  result.energy = Math.round(result.energy * 100) / 100;
  result.food = Math.round(result.food * 100) / 100;
  result.lifestyle = Math.round(result.lifestyle * 100) / 100;
  result.total = Math.round((result.transport + result.energy + result.food + result.lifestyle) * 100) / 100;

  return result;
}

function renderResults() {
  const footprint = calculateFootprint();
  const container = document.getElementById('calc-results');
  if (!container) return;

  // Save to profile
  const profile = getProfile();
  profile.footprint = {
    ...profile.footprint,
    ...footprint,
    lastCalculated: new Date().toISOString(),
    calculatorAnswers: { ...answers },
  };
  profile.calculatorCompleted = (profile.calculatorCompleted || 0) + 1;
  if (!profile.badges) profile.badges = [];
  saveProfile(profile);

  // Determine rating
  let rating, ratingColor, ratingEmoji;
  if (footprint.total <= BENCHMARKS.paris_target.value) {
    rating = 'Excellent! Below Paris Target';
    ratingColor = '#10B981';
    ratingEmoji = '🌟';
  } else if (footprint.total <= BENCHMARKS.india.value) {
    rating = 'Good! Below India Average';
    ratingColor = '#34D399';
    ratingEmoji = '👍';
  } else if (footprint.total <= BENCHMARKS.global.value) {
    rating = 'Average — Room to Improve';
    ratingColor = '#F59E0B';
    ratingEmoji = '⚠️';
  } else {
    rating = 'Above Average — Let\'s Reduce!';
    ratingColor = '#EF4444';
    ratingEmoji = '🔴';
  }

  container.innerHTML = `
    <div class="results-hero">
      <h2>Your Carbon Footprint</h2>
      <p>Based on your lifestyle, here's your estimated annual carbon footprint</p>
      <div class="results-score">${footprint.total} tonnes</div>
      <div class="score-badge" style="border-color:${ratingColor}; color:${ratingColor}; background:${ratingColor}15">
        ${ratingEmoji} ${rating}
      </div>
    </div>

    <div class="card mb-6">
      <div class="card-header">
        <h3 class="card-title">📊 Category Breakdown</h3>
      </div>
      <div class="chart-container" style="height:280px">
        <canvas id="results-doughnut"></canvas>
      </div>
    </div>

    <div class="card mb-6">
      <div class="card-header">
        <h3 class="card-title">📏 How You Compare</h3>
      </div>
      <div class="results-comparison">
        <div class="comparison-item you">
          <div class="comparison-emoji">🧑</div>
          <div class="comparison-value" style="color:${ratingColor}">${footprint.total}t</div>
          <div class="comparison-label">You</div>
        </div>
        ${Object.entries(BENCHMARKS).map(([key, b]) => `
          <div class="comparison-item">
            <div class="comparison-emoji">${b.emoji}</div>
            <div class="comparison-value" style="color:${b.color}">${b.value}t</div>
            <div class="comparison-label">${b.label}</div>
          </div>
        `).join('')}
      </div>
      <div class="comparison-bars mt-6">
        <div class="comparison-bar-row">
          <span class="comparison-bar-label">You</span>
          <div class="comparison-bar-track">
            <div class="comparison-bar-fill" style="width:${Math.min((footprint.total / 16) * 100, 100)}%; background:${ratingColor}" id="bar-you">
            </div>
          </div>
          <span class="comparison-bar-value">${footprint.total}t</span>
        </div>
        ${Object.entries(BENCHMARKS).map(([key, b]) => `
          <div class="comparison-bar-row">
            <span class="comparison-bar-label">${b.emoji} ${b.label.split(' ')[0]}</span>
            <div class="comparison-bar-track">
              <div class="comparison-bar-fill" style="width:${Math.min((b.value / 16) * 100, 100)}%; background:${b.color}">
              </div>
            </div>
            <span class="comparison-bar-value">${b.value}t</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="stats-grid mb-6">
      <div class="stat-card transport">
        <div class="stat-card-icon">🚗</div>
        <div class="stat-card-value">${footprint.transport}</div>
        <div class="stat-card-label">Transport (tonnes)</div>
      </div>
      <div class="stat-card energy">
        <div class="stat-card-icon">⚡</div>
        <div class="stat-card-value">${footprint.energy}</div>
        <div class="stat-card-label">Energy (tonnes)</div>
      </div>
      <div class="stat-card food">
        <div class="stat-card-icon">🍔</div>
        <div class="stat-card-value">${footprint.food}</div>
        <div class="stat-card-label">Food (tonnes)</div>
      </div>
      <div class="stat-card lifestyle">
        <div class="stat-card-icon">🛍️</div>
        <div class="stat-card-value">${footprint.lifestyle}</div>
        <div class="stat-card-label">Lifestyle (tonnes)</div>
      </div>
    </div>

    <div class="btn-group">
      <button class="btn btn-secondary" id="btn-retake">🔄 Retake Calculator</button>
      <button class="btn btn-primary btn-lg" id="btn-goto-dashboard">📊 Go to Dashboard</button>
    </div>
  `;

  // Render doughnut chart
  setTimeout(() => {
    renderResultsChart(footprint);
    animateComparisonBars();
  }, 100);

  // Bind buttons
  document.getElementById('btn-retake')?.addEventListener('click', () => {
    initCalculator();
  });

  document.getElementById('btn-goto-dashboard')?.addEventListener('click', () => {
    document.querySelector('[data-tab="dashboard"]')?.click();
  });
}

function renderResultsChart(footprint) {
  const canvas = document.getElementById('results-doughnut');
  if (!canvas) return;

  if (resultsChart) { resultsChart.destroy(); resultsChart = null; }

  const ctx = canvas.getContext('2d');
  resultsChart = new Chart(ctx, {
    type: 'doughnut',
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
        borderWidth: 3,
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim() || '#FFFFFF',
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyleWidth: 12,
            font: { family: "'Inter', sans-serif", size: 13, weight: '600' },
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#475569',
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.9)',
          titleFont: { family: "'Inter', sans-serif", size: 14, weight: '700' },
          bodyFont: { family: "'Inter', sans-serif", size: 13 },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.parsed} tonnes CO₂/year`
          }
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1200,
        easing: 'easeOutQuart',
      }
    }
  });
}

function animateComparisonBars() {
  const bars = document.querySelectorAll('.comparison-bar-fill');
  bars.forEach((bar, i) => {
    const targetWidth = bar.style.width;
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.width = targetWidth;
    }, 100 + i * 150);
  });
}
