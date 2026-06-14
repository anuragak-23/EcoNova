// ============================================================
// AI.JS — AI Sustainability Coach Module
// Carbon Footprint Awareness Platform
// ============================================================

import { getProfile } from './storage.js';

/**
 * Initializes the AI Coach widget inside a specified container
 * @param {string} containerId - Element ID to render into
 */
export async function initAICoach(containerId = 'ai-coach-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const profile = getProfile();
  const hasFootprint = profile.footprint && profile.footprint.total > 0;

  if (!hasFootprint) {
    container.innerHTML = ''; // Hide if no footprint
    return;
  }

  // Determine serverless API config status
  let isConfigured = false;
  try {
    const res = await fetch('/api/gemini-status');
    if (res.ok) {
      const data = await res.json();
      isConfigured = !!data.configured;
    }
  } catch (e) {
    console.warn('EcoNova: Serverless AI status check failed, using Local Demo mode.');
    isConfigured = false;
  }

  container.innerHTML = `
    <div class="card mb-6 glow-card" style="border: 1px solid var(--primary-glow);">
      <div class="card-header" style="margin-bottom:var(--space-2)">
        <h3 class="card-title" style="color:var(--primary); font-size:var(--text-xl)">
          🤖 Eco AI Coach
        </h3>
        ${isConfigured ? `
          <span style="font-size:0.7rem; background:rgba(16,185,129,0.1); color:var(--primary); padding:2px 8px; border-radius:var(--radius-full); font-weight:700">
            GEMINI AI ACTIVE
          </span>
        ` : `
          <span style="font-size:0.7rem; background:rgba(59,130,246,0.1); color:var(--secondary); padding:2px 8px; border-radius:var(--radius-full); font-weight:700">
            OFFLINE DEMO MODE
          </span>
        `}
      </div>
      
      <p class="card-subtitle" style="margin-bottom:var(--space-4)">
        Get personalized, machine-learning-driven recommendations based on your carbon score.
      </p>

      <div id="ai-coach-output" class="ai-coach-output" style="margin-bottom:var(--space-4)">
        <!-- Empty or loaded content -->
      </div>

      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:var(--space-3)">
        <button class="btn btn-primary" id="btn-generate-ai">
          <i data-lucide="sparkles"></i> Generate Personalized Advice
        </button>
      </div>
    </div>
  `;

  // Bind Generate Button
  const btn = document.getElementById('btn-generate-ai');
  btn?.addEventListener('click', () => handleGenerateAdvice(profile, isConfigured));

  // Run lucide icons replacement
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

async function handleGenerateAdvice(profile, isConfigured) {
  const output = document.getElementById('ai-coach-output');
  const btn = document.getElementById('btn-generate-ai');
  if (!output || !btn) return;

  // Set loading state
  btn.disabled = true;
  const originalHtml = btn.innerHTML;
  btn.innerHTML = `<span class="spinner" style="display:inline-block; width:16px; height:16px; border:2px solid white; border-top-color:transparent; border-radius:50%; animation: spin 1s linear infinite; margin-right:8px; vertical-align:middle;"></span> Consulting AI Sustainability Coach...`;

  output.innerHTML = `
    <div style="padding:var(--space-6); text-align:center; color:var(--text-secondary)">
      <div style="font-size:2.5rem; margin-bottom:var(--space-2); animation: floatAvatar 1.5s ease-in-out infinite alternate;">🤖</div>
      <p style="font-weight:600; font-size:var(--text-sm);">Analyzing emissions dataset & footprints...</p>
      <p style="font-size:var(--text-xs); color:var(--text-tertiary); margin-top:2px;">Correlating benchmarks and formulating reductions...</p>
    </div>
  `;

  // Determine highest category
  const fp = profile.footprint;
  const cats = { transport: fp.transport, energy: fp.energy, food: fp.food, lifestyle: fp.lifestyle };
  const highestCategory = Object.entries(cats).sort((a, b) => b[1] - a[1])[0][0];

  try {
    if (!isConfigured) {
      // Simulate network delay for realistic experience
      await new Promise(resolve => setTimeout(resolve, 1500));
      output.innerHTML = generateRuleBasedAdvice(fp, highestCategory);
    } else {
      const responseHtml = await generateGeminiAdvice(fp, highestCategory);
      output.innerHTML = `
        <div class="ai-response-content">
          ${responseHtml}
        </div>
      `;
    }
  } catch (error) {
    console.error('AI Coach Error:', error);
    output.innerHTML = `
      <div style="background:var(--danger-bg); border:1px dashed var(--danger); padding:var(--space-4); border-radius:var(--radius-lg); color:var(--danger); font-size:var(--text-sm);">
        ⚠️ <strong>AI insights are temporarily unavailable.</strong> Please try again later.
        <br><br>
        <button class="btn btn-secondary btn-sm" id="btn-ai-fallback-retry" style="padding:4px 12px; font-size:0.75rem; margin-top:4px">
          Use Offline AI Fallback
        </button>
      </div>
    `;
    
    document.getElementById('btn-ai-fallback-retry')?.addEventListener('click', () => {
      output.innerHTML = generateRuleBasedAdvice(fp, highestCategory);
    });
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}

function generateRuleBasedAdvice(footprint, highestCategory) {
  let co2Reduction = 0;
  let actions = [];

  if (highestCategory === 'transport') {
    co2Reduction = (footprint.transport * 0.4).toFixed(1);
    actions = [
      "🚴 **Cycle or walk for short trips (< 5 km)**: This can eliminate up to 40% of your transport emissions.",
      "🚌 **Utilize metro or bus transit**: Switching from driving petrol cars to metro saves 80%+ CO₂ per km.",
      "🚗 **Commit to carpooling**: Sharing rides twice a week with colleagues cuts commute impact by 20%.",
      "✈️ **Optimize business/leisure travel**: Combine trips or choose train alternatives for short-haul flights.",
      "⚡ **Transition to Electric Vehicles**: If buying a vehicle, go electric to reduce transport impact by 75%."
    ];
  } else if (highestCategory === 'energy') {
    co2Reduction = (footprint.energy * 0.3).toFixed(1);
    actions = [
      "💡 **Switch to 100% LED lighting**: Replace remaining incandescent or CFL bulbs to cut light electricity by 80%.",
      "❄️ **Set AC thermostat to 24°C or 25°C**: Every degree higher saves up to 6% on cooling costs.",
      "🔌 **Unplug standby phantom loads**: Idle electronics plugged in consume 5-10% of household energy.",
      "☀️ **Install solar water heaters or panels**: Transitioning to solar cuts residential emissions substantially.",
      "👕 **Line-dry laundry**: Skipping the dryer for natural line-drying saves up to 2.4 kg CO₂ per load."
    ];
  } else if (highestCategory === 'food') {
    co2Reduction = (footprint.food * 0.35).toFixed(1);
    actions = [
      "🥗 **Adopt Meatless Mondays**: Reducing meat intake by just one day a week saves about 250 kg CO₂ annually.",
      "♻️ **Practice Zero Food Waste**: Segment grocery shopping and freeze extras. 1/3 of food is wasted globally.",
      "🌱 **Explore vegan/plant-based alternatives**: Incorporate lentils, tofu, and grains over dairy and beef.",
      "🏪 **Source local & seasonal produce**: Shorter transit distances reduce food logistics footprint by up to 90%.",
      "🍳 **Cook fresh at home**: Minimize commercial food deliveries which generate packaging and delivery emissions."
    ];
  } else {
    co2Reduction = (footprint.lifestyle * 0.25).toFixed(1);
    actions = [
      "🏷️ **Opt for secondhand or thrift clothing**: Extending garment life by 9 months reduces carbon impact by 30%.",
      "📱 **Extend electronics lifecycles**: Keep smartphones/laptops for 3-4 years rather than replacing annually.",
      "📦 **Consolidate online shopping orders**: Avoid single-item express deliveries to reduce shipping overhead.",
      "🌳 **Plant one tree or maintain balcony greens**: Absorbs CO₂ and builds eco-consciousness.",
      "♻️ **Implement proper waste segregation**: Recycled plastic and metal save significant lifecycle manufacturing energy."
    ];
  }

  return `
    <div style="background:var(--bg-input); padding:var(--space-4); border-radius:var(--radius-xl); border:1px solid var(--border); font-size:var(--text-sm); line-height:1.6">
      <div style="display:flex; align-items:center; gap:var(--space-2); color:var(--primary); font-weight:700; margin-bottom:var(--space-3)">
        <span>✅ Local Rule-based Coach Advice Generated</span>
      </div>
      <p style="margin-bottom:var(--space-3); color:var(--text-secondary)">Based on your highest emission category (<strong>${highestCategory.toUpperCase()}</strong>), here is your tailored action plan:</p>
      
      <ul style="margin-left:var(--space-4); margin-bottom:var(--space-4); display:flex; flex-direction:column; gap:var(--space-2)">
        ${actions.map(act => `<li>${act.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}
      </ul>
      
      <div class="ai-impact-banner" style="background:var(--primary-bg); padding:var(--space-4); border-radius:var(--radius-lg); border-left:4px solid var(--primary); text-align:center">
        <div style="font-size:var(--text-xs); color:var(--text-secondary); text-transform:uppercase; font-weight:700; letter-spacing:0.05em">Estimated Annual Impact</div>
        <div style="font-size:var(--text-2xl); font-weight:800; color:var(--primary)">-${co2Reduction} tonnes CO₂ / year</div>
        <div style="font-size:var(--text-xs); color:var(--text-tertiary); margin-top:2px;">If all 5 recommendations are successfully adopted</div>
      </div>
    </div>
  `;
}

async function generateGeminiAdvice(footprint, highestCategory) {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ footprint, highestCategory })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Gemini API request failed');
  }

  const json = await response.json();
  if (json.error) {
    throw new Error(json.error);
  }
  return json.text;
}
