import { describe, it, expect } from 'vitest';
import { generateRuleBasedAdvice } from '../js/ai.js';

describe('AI Sustainability Advice Processing', () => {
  const mockFootprint = {
    transport: 8.0,
    energy: 5.0,
    food: 4.0,
    lifestyle: 2.0,
    total: 19.0
  };

  it('should format transport recommendations correctly when transport is the highest category', () => {
    const html = generateRuleBasedAdvice(mockFootprint, 'transport');

    // Asserts
    expect(html).toContain('Local Rule-based Coach Advice Generated');
    expect(html).toContain('TRANSPORT');
    expect(html).toContain('Cycle or walk for short trips');
    expect(html).toContain('<strong>'); // Check markdown parser replaces ** with <strong>
    
    // Estimated reduction is footprint.transport * 0.4 = 8.0 * 0.4 = 3.2
    expect(html).toContain('-3.2 tonnes CO₂ / year');
  });

  it('should format energy recommendations correctly when energy is the highest category', () => {
    const html = generateRuleBasedAdvice(mockFootprint, 'energy');

    expect(html).toContain('ENERGY');
    expect(html).toContain('Switch to 100% LED lighting');
    
    // Estimated reduction is footprint.energy * 0.3 = 5.0 * 0.3 = 1.5
    expect(html).toContain('-1.5 tonnes CO₂ / year');
  });

  it('should format food recommendations correctly when food is the highest category', () => {
    const html = generateRuleBasedAdvice(mockFootprint, 'food');

    expect(html).toContain('FOOD');
    expect(html).toContain('Adopt Meatless Mondays');
    
    // Estimated reduction is footprint.food * 0.35 = 4.0 * 0.35 = 1.4
    expect(html).toContain('-1.4 tonnes CO₂ / year');
  });

  it('should format lifestyle recommendations correctly when lifestyle is the highest category', () => {
    const html = generateRuleBasedAdvice(mockFootprint, 'lifestyle');

    expect(html).toContain('LIFESTYLE');
    expect(html).toContain('secondhand or thrift clothing');
    
    // Estimated reduction is footprint.lifestyle * 0.25 = 2.0 * 0.25 = 0.5
    expect(html).toContain('-0.5 tonnes CO₂ / year');
  });
});
