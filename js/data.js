// ============================================================
// DATA.JS — Static Data: Emission Factors, Actions, Tips, Badges
// Carbon Footprint Awareness Platform
// ============================================================

// ── Emission Factors (kg CO₂ per unit) ──────────────────────
// Sources: IPCC AR6, DEFRA 2023, India CEA 2023
export const EMISSION_FACTORS = {
  transport: {
    car_petrol:    { factor: 0.21,  unit: 'km', label: 'Car (Petrol)' },
    car_diesel:    { factor: 0.27,  unit: 'km', label: 'Car (Diesel)' },
    car_electric:  { factor: 0.05,  unit: 'km', label: 'Car (Electric)' },
    motorcycle:    { factor: 0.11,  unit: 'km', label: 'Motorcycle' },
    bus:           { factor: 0.089, unit: 'km', label: 'Public Bus' },
    train:         { factor: 0.041, unit: 'km', label: 'Train / Metro' },
    auto_rickshaw: { factor: 0.15,  unit: 'km', label: 'Auto Rickshaw' },
    bicycle:       { factor: 0,     unit: 'km', label: 'Bicycle' },
    walking:       { factor: 0,     unit: 'km', label: 'Walking' },
    flight_short:  { factor: 0.255, unit: 'km', label: 'Flight (< 3 hrs)' },
    flight_long:   { factor: 0.195, unit: 'km', label: 'Flight (> 3 hrs)' },
  },
  energy: {
    electricity_india:  { factor: 0.82,  unit: 'kWh', label: 'Electricity (India Grid)' },
    electricity_global: { factor: 0.50,  unit: 'kWh', label: 'Electricity (Global Avg)' },
    lpg:                { factor: 2.98,  unit: 'kg',  label: 'LPG Cooking Gas' },
    natural_gas:        { factor: 2.0,   unit: 'm³',  label: 'Natural Gas' },
    solar:              { factor: 0.05,  unit: 'kWh', label: 'Solar Panel' },
  },
  food: {
    meat_heavy:    { factor: 7.19, unit: 'day', label: 'Heavy Meat Eater' },
    meat_medium:   { factor: 5.63, unit: 'day', label: 'Medium Meat Eater' },
    meat_low:      { factor: 4.67, unit: 'day', label: 'Low Meat Eater' },
    pescatarian:   { factor: 3.91, unit: 'day', label: 'Pescatarian' },
    vegetarian:    { factor: 3.81, unit: 'day', label: 'Vegetarian' },
    vegan:         { factor: 2.89, unit: 'day', label: 'Vegan' },
  },
  lifestyle: {
    clothing_fast:   { factor: 600,  unit: 'year', label: 'Fast Fashion Buyer' },
    clothing_mod:    { factor: 300,  unit: 'year', label: 'Moderate Shopper' },
    clothing_min:    { factor: 100,  unit: 'year', label: 'Minimalist' },
    electronics_high:{ factor: 400,  unit: 'year', label: 'Frequent Gadget Buyer' },
    electronics_mod: { factor: 150,  unit: 'year', label: 'Moderate Gadget Buyer' },
    electronics_low: { factor: 50,   unit: 'year', label: 'Rare Gadget Buyer' },
  }
};

// ── Benchmark Averages (tonnes CO₂/year per capita) ─────────
export const BENCHMARKS = {
  global:       { value: 4.7,  label: 'Global Average',        emoji: '🌍', color: '#64748B' },
  india:        { value: 1.9,  label: 'India Average',          emoji: '🇮🇳', color: '#F59E0B' },
  usa:          { value: 15.5, label: 'USA Average',            emoji: '🇺🇸', color: '#EF4444' },
  eu:           { value: 6.8,  label: 'EU Average',             emoji: '🇪🇺', color: '#3B82F6' },
  paris_target: { value: 2.0,  label: 'Paris Agreement Target', emoji: '🎯', color: '#10B981' },
};

// ── Eco-Actions Catalog ─────────────────────────────────────
export const ECO_ACTIONS = [
  // Transport Actions
  { id: 'cycle-commute',     category: 'transport', label: 'Cycled to work/school',         icon: '🚴', impact: 'high',   difficulty: 'moderate', co2Saved: 4.2,  points: 40 },
  { id: 'public-transport',  category: 'transport', label: 'Used public transport',          icon: '🚌', impact: 'high',   difficulty: 'easy',     co2Saved: 3.1,  points: 30 },
  { id: 'carpooled',         category: 'transport', label: 'Carpooled with someone',         icon: '🚗', impact: 'medium', difficulty: 'easy',     co2Saved: 2.5,  points: 25 },
  { id: 'walked',            category: 'transport', label: 'Walked instead of driving',      icon: '🚶', impact: 'medium', difficulty: 'easy',     co2Saved: 2.1,  points: 20 },
  { id: 'wfh',               category: 'transport', label: 'Worked from home',               icon: '🏠', impact: 'high',   difficulty: 'easy',     co2Saved: 3.8,  points: 30 },
  { id: 'combined-errands',  category: 'transport', label: 'Combined multiple errands',      icon: '📋', impact: 'low',    difficulty: 'easy',     co2Saved: 1.2,  points: 15 },
  { id: 'ev-charge',         category: 'transport', label: 'Charged EV with clean energy',   icon: '⚡', impact: 'high',   difficulty: 'moderate', co2Saved: 4.0,  points: 35 },

  // Energy Actions
  { id: 'lights-off',        category: 'energy',    label: 'Turned off unused lights',       icon: '💡', impact: 'low',    difficulty: 'easy',     co2Saved: 0.5,  points: 10 },
  { id: 'unplug-devices',    category: 'energy',    label: 'Unplugged idle devices',         icon: '🔌', impact: 'low',    difficulty: 'easy',     co2Saved: 0.3,  points: 10 },
  { id: 'no-ac',             category: 'energy',    label: 'Skipped AC / used fan instead',  icon: '🌀', impact: 'high',   difficulty: 'moderate', co2Saved: 3.5,  points: 35 },
  { id: 'cold-wash',         category: 'energy',    label: 'Washed clothes in cold water',   icon: '🧺', impact: 'medium', difficulty: 'easy',     co2Saved: 1.5,  points: 20 },
  { id: 'line-dry',          category: 'energy',    label: 'Line-dried clothes',             icon: '👕', impact: 'medium', difficulty: 'easy',     co2Saved: 2.0,  points: 20 },
  { id: 'shorter-shower',    category: 'energy',    label: 'Took a shorter shower (< 5 min)',icon: '🚿', impact: 'medium', difficulty: 'moderate', co2Saved: 1.0,  points: 15 },
  { id: 'solar-cooking',     category: 'energy',    label: 'Used solar/efficient cooking',   icon: '☀️', impact: 'medium', difficulty: 'challenging', co2Saved: 1.8, points: 25 },
  { id: 'led-bulbs',         category: 'energy',    label: 'Switched to LED bulbs',          icon: '💡', impact: 'medium', difficulty: 'easy',     co2Saved: 1.2,  points: 20 },

  // Food Actions
  { id: 'meatless-meal',     category: 'food',      label: 'Had a meatless meal',            icon: '🥗', impact: 'high',   difficulty: 'easy',     co2Saved: 2.5,  points: 25 },
  { id: 'vegan-day',         category: 'food',      label: 'Ate fully vegan today',          icon: '🌱', impact: 'high',   difficulty: 'moderate', co2Saved: 4.3,  points: 40 },
  { id: 'no-food-waste',     category: 'food',      label: 'Zero food waste today',          icon: '♻️', impact: 'medium', difficulty: 'moderate', co2Saved: 1.8,  points: 20 },
  { id: 'local-food',        category: 'food',      label: 'Bought local/seasonal food',     icon: '🏪', impact: 'medium', difficulty: 'easy',     co2Saved: 1.5,  points: 20 },
  { id: 'homemade-meal',     category: 'food',      label: 'Cooked at home (no delivery)',   icon: '🍳', impact: 'medium', difficulty: 'easy',     co2Saved: 1.2,  points: 15 },
  { id: 'reusable-bottle',   category: 'food',      label: 'Used reusable water bottle',     icon: '🍶', impact: 'low',    difficulty: 'easy',     co2Saved: 0.4,  points: 10 },
  { id: 'composted',         category: 'food',      label: 'Composted food scraps',          icon: '🪱', impact: 'medium', difficulty: 'moderate', co2Saved: 1.0,  points: 20 },
  { id: 'no-plastic-bag',    category: 'food',      label: 'Refused single-use plastic',     icon: '🛍️', impact: 'low',    difficulty: 'easy',     co2Saved: 0.3,  points: 10 },

  // Lifestyle Actions
  { id: 'reuse-item',        category: 'lifestyle', label: 'Reused/repaired an item',        icon: '🔧', impact: 'medium', difficulty: 'moderate', co2Saved: 2.0,  points: 25 },
  { id: 'secondhand',        category: 'lifestyle', label: 'Bought secondhand',              icon: '🏷️', impact: 'high',   difficulty: 'easy',     co2Saved: 3.5,  points: 30 },
  { id: 'no-online-order',   category: 'lifestyle', label: 'Avoided online shopping',        icon: '📦', impact: 'medium', difficulty: 'moderate', co2Saved: 1.5,  points: 20 },
  { id: 'digital-receipt',   category: 'lifestyle', label: 'Chose digital over paper',       icon: '📱', impact: 'low',    difficulty: 'easy',     co2Saved: 0.2,  points: 10 },
  { id: 'planted-tree',      category: 'lifestyle', label: 'Planted a tree/plant',           icon: '🌳', impact: 'high',   difficulty: 'challenging', co2Saved: 5.0, points: 50 },
  { id: 'eco-awareness',     category: 'lifestyle', label: 'Shared eco-tips with others',    icon: '📢', impact: 'low',    difficulty: 'easy',     co2Saved: 0.0,  points: 15 },
  { id: 'recycled',          category: 'lifestyle', label: 'Recycled waste properly',        icon: '♻️', impact: 'medium', difficulty: 'easy',     co2Saved: 1.0,  points: 15 },
  { id: 'minimal-screen',    category: 'lifestyle', label: 'Reduced screen time (1hr+)',     icon: '📵', impact: 'low',    difficulty: 'moderate', co2Saved: 0.4,  points: 10 },
];

// ── Achievement Badges ──────────────────────────────────────
export const BADGES = [
  { id: 'first-step',       label: 'First Step',       icon: '🌱', description: 'Complete your first carbon calculation',    condition: 'calculator_completed', threshold: 1 },
  { id: 'action-starter',   label: 'Action Starter',   icon: '⚡', description: 'Log your first eco-action',                condition: 'actions_logged',       threshold: 1 },
  { id: 'week-warrior',     label: 'Week Warrior',     icon: '🔥', description: 'Maintain a 7-day action streak',           condition: 'streak',               threshold: 7 },
  { id: 'fortnight-fury',   label: 'Fortnight Fury',   icon: '💪', description: 'Maintain a 14-day action streak',          condition: 'streak',               threshold: 14 },
  { id: 'monthly-master',   label: 'Monthly Master',   icon: '🏅', description: 'Maintain a 30-day action streak',          condition: 'streak',               threshold: 30 },
  { id: 'century-club',     label: 'Century Club',     icon: '💯', description: 'Log 100 eco-actions',                      condition: 'actions_logged',       threshold: 100 },
  { id: 'pedal-power',      label: 'Pedal Power',      icon: '🚴', description: 'Log 10 cycling commutes',                  condition: 'action_specific',      actionId: 'cycle-commute', threshold: 10 },
  { id: 'green-chef',       label: 'Green Chef',       icon: '🍳', description: 'Log 20 homemade meals',                    condition: 'action_specific',      actionId: 'homemade-meal', threshold: 20 },
  { id: 'tree-hugger',      label: 'Tree Hugger',      icon: '🌳', description: 'Save equivalent of 1 tree (22 kg CO₂)',    condition: 'co2_saved',            threshold: 22 },
  { id: 'forest-friend',    label: 'Forest Friend',    icon: '🌲', description: 'Save equivalent of 10 trees (220 kg CO₂)', condition: 'co2_saved',            threshold: 220 },
  { id: 'point-collector',  label: 'Point Collector',  icon: '💎', description: 'Earn 1,000 eco-points',                    condition: 'points',               threshold: 1000 },
  { id: 'eco-legend',       label: 'Eco Legend',       icon: '👑', description: 'Earn 10,000 eco-points',                   condition: 'points',               threshold: 10000 },
  { id: 'vegan-hero',       label: 'Vegan Hero',       icon: '🌿', description: 'Log 15 vegan days',                        condition: 'action_specific',      actionId: 'vegan-day', threshold: 15 },
  { id: 'zero-waste',       label: 'Zero Waste',       icon: '♻️', description: 'Log 30 zero-food-waste days',              condition: 'action_specific',      actionId: 'no-food-waste', threshold: 30 },
  { id: 'energy-saver',     label: 'Energy Saver',     icon: '⚡', description: 'Log 25 energy-saving actions',             condition: 'category_actions',     category: 'energy', threshold: 25 },
  { id: 'climate-champion', label: 'Climate Champion', icon: '🌍', description: 'Reach Level 5',                            condition: 'level',                threshold: 5 },
];

// ── Level Definitions ───────────────────────────────────────
export const LEVELS = [
  { level: 1, title: 'Eco-Curious',      icon: '🌱', minPoints: 0,     color: '#94A3B8' },
  { level: 2, title: 'Green Beginner',    icon: '🌿', minPoints: 500,   color: '#34D399' },
  { level: 3, title: 'Nature Ally',       icon: '🌳', minPoints: 1500,  color: '#10B981' },
  { level: 4, title: 'Earth Guardian',    icon: '🌲', minPoints: 4000,  color: '#059669' },
  { level: 5, title: 'Climate Champion',  icon: '🌍', minPoints: 10000, color: '#047857' },
];

// ── Daily Tips ──────────────────────────────────────────────
export const DAILY_TIPS = [
  { category: 'transport', tip: 'Cycling just 5 km saves about 1 kg of CO₂ compared to driving. That\'s 365 kg per year!', icon: '🚴' },
  { category: 'transport', tip: 'A single round-trip flight from Delhi to Mumbai emits ~150 kg CO₂ — equal to 2 months of a vegetarian diet.', icon: '✈️' },
  { category: 'transport', tip: 'Carpooling with just one person cuts your commute emissions in half instantly.', icon: '🚗' },
  { category: 'energy',    tip: 'Switching from a 60W incandescent to a 9W LED bulb saves 80 kg CO₂/year.', icon: '💡' },
  { category: 'energy',    tip: 'Setting your AC to 24°C instead of 20°C can reduce energy consumption by up to 24%.', icon: '❄️' },
  { category: 'energy',    tip: 'Phantom loads from plugged-in devices account for 5-10% of household electricity use.', icon: '🔌' },
  { category: 'energy',    tip: 'Air-drying clothes instead of using a dryer saves about 2.4 kg CO₂ per load.', icon: '👕' },
  { category: 'food',      tip: 'Producing 1 kg of beef emits 27 kg CO₂ — that\'s 10x more than 1 kg of chicken.', icon: '🥩' },
  { category: 'food',      tip: 'About 1/3 of all food produced globally is wasted. Reducing food waste is one of the easiest wins.', icon: '🍎' },
  { category: 'food',      tip: 'Eating locally grown seasonal produce can reduce food transport emissions by up to 90%.', icon: '🏪' },
  { category: 'food',      tip: 'A vegan diet produces 50% fewer CO₂ emissions than a meat-heavy diet.', icon: '🌱' },
  { category: 'lifestyle', tip: 'The fashion industry produces 10% of global CO₂ emissions — more than aviation and shipping combined.', icon: '👗' },
  { category: 'lifestyle', tip: 'Buying one fewer new garment per month saves approximately 25 kg CO₂ per year.', icon: '🛍️' },
  { category: 'lifestyle', tip: 'A single smartphone takes about 70 kg of CO₂ to manufacture. Keep yours longer!', icon: '📱' },
  { category: 'lifestyle', tip: 'Recycling 1 kg of aluminum saves 9 kg of CO₂ compared to producing new aluminum.', icon: '♻️' },
  { category: 'general',   tip: 'If every person planted one tree, it would absorb ~170 billion kg of CO₂ in 10 years.', icon: '🌳' },
  { category: 'general',   tip: 'The average person can reduce their footprint by 20-30% through simple daily choices.', icon: '📊' },
  { category: 'general',   tip: 'Even small actions matter: turning off one light for 8 hours saves 0.4 kg CO₂.', icon: '✨' },
];

// ── Impact Equivalents ──────────────────────────────────────
// Used to translate kg CO₂ into relatable terms
export const IMPACT_EQUIVALENTS = {
  tree_year:      { kgCO2: 22,   label: 'trees absorbing CO₂ for a year',   icon: '🌳', singular: 'tree absorbing CO₂ for a year' },
  km_driven:      { kgCO2: 0.21, label: 'km of car driving avoided',        icon: '🚗', singular: 'km of car driving avoided' },
  phone_charges:  { kgCO2: 0.008,label: 'smartphone charges',               icon: '📱', singular: 'smartphone charge' },
  led_hours:      { kgCO2: 0.007,label: 'hours of LED light',               icon: '💡', singular: 'hour of LED light' },
  showers:        { kgCO2: 0.5,  label: 'hot showers saved',                icon: '🚿', singular: 'hot shower saved' },
  flights_delhi_mumbai: { kgCO2: 150, label: 'Delhi-Mumbai flights offset', icon: '✈️', singular: 'Delhi-Mumbai flight offset' },
};

// ── Calculator Questions ────────────────────────────────────
export const CALCULATOR_QUESTIONS = {
  transport: {
    title: 'How do you travel?',
    icon: '🚗',
    description: 'How do you get around?',
    questions: [
      {
        id: 'commute_mode',
        label: 'Primary commute mode',
        type: 'select',
        options: [
          { value: 'car_petrol',    label: '🚗 Car (Petrol)' },
          { value: 'car_diesel',    label: '🚗 Car (Diesel)' },
          { value: 'car_electric',  label: '⚡ Car (Electric)' },
          { value: 'motorcycle',    label: '🏍️ Motorcycle' },
          { value: 'bus',           label: '🚌 Public Bus' },
          { value: 'train',         label: '🚆 Train / Metro' },
          { value: 'auto_rickshaw', label: '🛺 Auto Rickshaw' },
          { value: 'bicycle',       label: '🚴 Bicycle' },
          { value: 'walking',       label: '🚶 Walking' },
          { value: 'wfh',           label: '🏠 Work from Home' },
        ]
      },
      {
        id: 'commute_distance',
        label: 'Daily commute distance (one way, km)',
        type: 'range',
        min: 0, max: 100, step: 1, default: 10,
        unit: 'km'
      },
      {
        id: 'commute_days',
        label: 'Commute days per week',
        type: 'range',
        min: 0, max: 7, step: 1, default: 5,
        unit: 'days'
      },
      {
        id: 'flights_short',
        label: 'Short domestic flights per year',
        type: 'range',
        min: 0, max: 50, step: 1, default: 2,
        unit: 'flights'
      },
      {
        id: 'flights_long',
        label: 'Long / international flights per year',
        type: 'range',
        min: 0, max: 30, step: 1, default: 0,
        unit: 'flights'
      },
    ]
  },
  energy: {
    title: 'How much electricity do you use?',
    icon: '🏠',
    description: 'Your home energy usage',
    questions: [
      {
        id: 'electricity_bill',
        label: 'Monthly electricity units (kWh)',
        type: 'range',
        min: 0, max: 1000, step: 10, default: 150,
        unit: 'kWh',
        helpText: 'Check your electricity bill. Average Indian household uses 80-150 kWh/month.'
      },
      {
        id: 'cooking_fuel',
        label: 'Primary cooking fuel',
        type: 'select',
        options: [
          { value: 'lpg',         label: '🔥 LPG Gas' },
          { value: 'natural_gas', label: '🔵 Natural Gas / PNG' },
          { value: 'electric',    label: '⚡ Electric / Induction' },
          { value: 'solar',       label: '☀️ Solar Cooker' },
        ]
      },
      {
        id: 'lpg_cylinders',
        label: 'LPG cylinders per year (14.2 kg each)',
        type: 'range',
        min: 0, max: 24, step: 1, default: 8,
        unit: 'cylinders'
      },
      {
        id: 'ac_usage',
        label: 'AC usage in summer (hours/day)',
        type: 'range',
        min: 0, max: 24, step: 1, default: 4,
        unit: 'hrs/day'
      },
      {
        id: 'renewable',
        label: 'Do you use any renewable energy?',
        type: 'select',
        options: [
          { value: 'none',    label: '❌ No' },
          { value: 'partial', label: '🔋 Partially (solar panels etc.)' },
          { value: 'full',    label: '☀️ Fully renewable' },
        ]
      },
    ]
  },
  food: {
    title: 'What does your diet look like?',
    icon: '🍔',
    description: 'What you eat matters',
    questions: [
      {
        id: 'diet_type',
        label: 'Your diet type',
        type: 'select',
        options: [
          { value: 'meat_heavy',  label: '🥩 Heavy Meat Eater (daily meat)' },
          { value: 'meat_medium', label: '🍗 Medium Meat (3-5x/week)' },
          { value: 'meat_low',    label: '🍖 Low Meat (1-2x/week)' },
          { value: 'pescatarian', label: '🐟 Pescatarian (fish only)' },
          { value: 'vegetarian',  label: '🥬 Vegetarian' },
          { value: 'vegan',       label: '🌱 Vegan' },
        ]
      },
      {
        id: 'food_waste',
        label: 'How much food do you waste weekly?',
        type: 'select',
        options: [
          { value: 'high',   label: '😟 A lot (>30% wasted)' },
          { value: 'medium', label: '😐 Some (10-30% wasted)' },
          { value: 'low',    label: '😊 Very little (<10%)' },
          { value: 'none',   label: '🌟 Almost zero waste' },
        ]
      },
      {
        id: 'food_source',
        label: 'Where do you get most food?',
        type: 'select',
        options: [
          { value: 'local',    label: '🏪 Local markets / farms' },
          { value: 'mixed',    label: '🛒 Mix of local + supermarket' },
          { value: 'imported', label: '🌍 Mostly supermarket / imported' },
        ]
      },
      {
        id: 'food_delivery',
        label: 'Food delivery orders per week',
        type: 'range',
        min: 0, max: 21, step: 1, default: 3,
        unit: 'orders'
      },
    ]
  },
  lifestyle: {
    title: 'What do your consumption habits look like?',
    icon: '🛍️',
    description: 'Your consumption habits',
    questions: [
      {
        id: 'clothing_habit',
        label: 'Clothing shopping habits',
        type: 'select',
        options: [
          { value: 'fast',      label: '🛍️ Fast fashion (monthly buys)' },
          { value: 'moderate',  label: '👔 Moderate (every few months)' },
          { value: 'minimal',   label: '🌿 Minimalist (rarely buy new)' },
          { value: 'secondhand',label: '♻️ Mostly secondhand / thrift' },
        ]
      },
      {
        id: 'electronics_habit',
        label: 'New electronics purchases per year',
        type: 'range',
        min: 0, max: 10, step: 1, default: 1,
        unit: 'items'
      },
      {
        id: 'online_shopping',
        label: 'Online shopping orders per month',
        type: 'range',
        min: 0, max: 30, step: 1, default: 4,
        unit: 'orders'
      },
      {
        id: 'recycling',
        label: 'How often do you recycle?',
        type: 'select',
        options: [
          { value: 'always',    label: '♻️ Always (segregate waste)' },
          { value: 'sometimes', label: '🔄 Sometimes' },
          { value: 'rarely',    label: '😕 Rarely' },
          { value: 'never',     label: '❌ Never' },
        ]
      },
    ]
  }
};

// ── Category Colors ─────────────────────────────────────────
export const CATEGORY_COLORS = {
  transport: { primary: '#3B82F6', light: '#DBEAFE', gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' },
  energy:    { primary: '#F59E0B', light: '#FEF3C7', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
  food:      { primary: '#10B981', light: '#D1FAE5', gradient: 'linear-gradient(135deg, #10B981, #059669)' },
  lifestyle: { primary: '#8B5CF6', light: '#EDE9FE', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' },
};

// ── Category Metadata ───────────────────────────────────────
export const CATEGORIES = {
  transport: { label: 'Transport',  icon: '🚗', color: CATEGORY_COLORS.transport },
  energy:    { label: 'Energy',     icon: '⚡', color: CATEGORY_COLORS.energy },
  food:      { label: 'Food',       icon: '🍔', color: CATEGORY_COLORS.food },
  lifestyle: { label: 'Lifestyle',  icon: '🛍️', color: CATEGORY_COLORS.lifestyle },
};
