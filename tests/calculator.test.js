import { describe, it, expect, beforeEach } from 'vitest';
import { calculateFootprint, answers } from '../js/calculator.js';

describe('Carbon Footprint Calculator Engine', () => {
  beforeEach(() => {
    // Clear answers before each test to ensure isolation
    Object.keys(answers).forEach(k => delete answers[k]);
  });

  it('should calculate valid footprint for default answers', () => {
    const footprint = calculateFootprint();

    expect(footprint).toHaveProperty('transport');
    expect(footprint).toHaveProperty('energy');
    expect(footprint).toHaveProperty('food');
    expect(footprint).toHaveProperty('lifestyle');
    expect(footprint).toHaveProperty('total');

    expect(footprint.total).toBeGreaterThan(0);
    expect(footprint.transport).toBeGreaterThanOrEqual(0);
    expect(footprint.energy).toBeGreaterThanOrEqual(0);
    expect(footprint.food).toBeGreaterThanOrEqual(0);
    expect(footprint.lifestyle).toBeGreaterThanOrEqual(0);
  });

  it('should return zero commute transport emissions for WFH users without flights', () => {
    answers.commute_mode = 'wfh';
    answers.flights_short = 0;
    answers.flights_long = 0;

    const footprint = calculateFootprint();
    expect(footprint.transport).toBe(0);
  });

  it('should increase transport emissions with short and long flights', () => {
    answers.commute_mode = 'wfh';
    answers.flights_short = 2;
    answers.flights_long = 1;

    const footprint = calculateFootprint();
    expect(footprint.transport).toBeGreaterThan(0);
  });

  it('should reduce energy footprint when renewable source is full', () => {
    // Scenario 1: No renewable
    answers.electricity_bill = 2000;
    answers.cooking_fuel = 'lpg';
    answers.lpg_cylinders = 10;
    answers.ac_usage = 8;
    answers.renewable = 'none';
    const footprintNoRenewable = calculateFootprint();

    // Scenario 2: Full renewable
    answers.renewable = 'full';
    const footprintFullRenewable = calculateFootprint();

    expect(footprintFullRenewable.energy).toBeLessThan(footprintNoRenewable.energy);
  });

  it('should return vegan diet emissions lower than heavy meat diet emissions', () => {
    answers.diet_type = 'vegan';
    const footprintVegan = calculateFootprint();

    answers.diet_type = 'meat_heavy';
    const footprintMeat = calculateFootprint();

    expect(footprintVegan.food).toBeLessThan(footprintMeat.food);
  });

  it('should yield lower lifestyle emissions when recycling habit is always', () => {
    answers.clothing_habit = 'moderate';
    answers.electronics_habit = 1;
    answers.online_shopping = 2;
    answers.recycling = 'always';
    const footprintRecycle = calculateFootprint();

    answers.recycling = 'never';
    const footprintNoRecycle = calculateFootprint();

    expect(footprintRecycle.lifestyle).toBeLessThan(footprintNoRecycle.lifestyle);
  });
});
