import { describe, it, expect } from 'vitest';
import { validateRegistrationInput } from '../js/auth.js';

describe('User Registration Validation', () => {
  it('should invalidate registration with an empty or missing name', () => {
    const res1 = validateRegistrationInput('test@econova.ai', 'password123', '');
    const res2 = validateRegistrationInput('test@econova.ai', 'password123', '   ');

    expect(res1.valid).toBe(false);
    expect(res1.error).toBe('Name is required');
    expect(res2.valid).toBe(false);
    expect(res2.error).toBe('Name is required');
  });

  it('should invalidate registration with an invalid email address', () => {
    const res1 = validateRegistrationInput('invalidemail', 'password123', 'Eco Warrior');
    const res2 = validateRegistrationInput('', 'password123', 'Eco Warrior');

    expect(res1.valid).toBe(false);
    expect(res1.error).toBe('Invalid email address');
    expect(res2.valid).toBe(false);
    expect(res2.error).toBe('Invalid email address');
  });

  it('should invalidate registration with a password under 6 characters', () => {
    const res = validateRegistrationInput('test@econova.ai', '12345', 'Eco Warrior');

    expect(res.valid).toBe(false);
    expect(res.error).toBe('Password must be at least 6 characters');
  });

  it('should validate registration with correct values', () => {
    const res = validateRegistrationInput('test@econova.ai', 'password123', 'Eco Warrior');

    expect(res.valid).toBe(true);
    expect(res.error).toBeUndefined();
  });
});
