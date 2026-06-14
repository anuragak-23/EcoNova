import { describe, it, expect } from 'vitest';
import { getLevel, getLevelProgress, getAvatarInfo } from '../js/gamification.js';

describe('Gamification & Dashboard Utilities', () => {
  describe('Level Calculations', () => {
    it('should assign level 1 for 0 points', () => {
      const lvl = getLevel(0);
      expect(lvl.level).toBe(1);
      expect(lvl.title).toBe('Eco-Curious');
    });

    it('should assign level 2 for 500 points', () => {
      const lvl = getLevel(500);
      expect(lvl.level).toBe(2);
      expect(lvl.title).toBe('Green Beginner');
    });

    it('should assign level 5 for 12000 points', () => {
      const lvl = getLevel(12000);
      expect(lvl.level).toBe(5);
      expect(lvl.title).toBe('Climate Champion');
    });
  });

  describe('Level Progress Tracking', () => {
    it('should calculate 0% progress at level boundary start', () => {
      const progressDetails = getLevelProgress(0);
      expect(progressDetails.progress).toBe(0);
      expect(progressDetails.current.level).toBe(1);
      expect(progressDetails.next.level).toBe(2);
    });

    it('should calculate correct percentage between levels', () => {
      const progressDetails = getLevelProgress(250); // halfway between Level 1 (0) and Level 2 (500)
      expect(progressDetails.progress).toBe(50);
    });

    it('should return 100% progress for max level', () => {
      const progressDetails = getLevelProgress(15000);
      expect(progressDetails.progress).toBe(100);
      expect(progressDetails.next).toBeNull();
    });
  });

  describe('Evolving Carbon Avatar Ranks', () => {
    it('should assign Eco Rookie for zero footprint', () => {
      const avatar = getAvatarInfo(0);
      expect(avatar.rank).toBe('Eco Rookie');
      expect(avatar.avatar).toBe('🌱');
    });

    it('should assign High Polluter for footprint > 10 tonnes', () => {
      const avatar = getAvatarInfo(12.5);
      expect(avatar.rank).toBe('High Polluter');
      expect(avatar.avatar).toBe('🌫️');
    });

    it('should assign Eco Learner for footprint between 4.7 and 10 tonnes', () => {
      const avatar = getAvatarInfo(6.8);
      expect(avatar.rank).toBe('Eco Learner');
      expect(avatar.avatar).toBe('🌿');
    });

    it('should assign Climate Hero for footprint between 2.0 and 4.7 tonnes', () => {
      const avatar = getAvatarInfo(3.2);
      expect(avatar.rank).toBe('Climate Hero');
      expect(avatar.avatar).toBe('🌳');
    });

    it('should assign Planet Guardian for footprint <= 2.0 tonnes', () => {
      const avatar = getAvatarInfo(1.5);
      expect(avatar.rank).toBe('Planet Guardian');
      expect(avatar.avatar).toBe('🌎');
    });
  });
});
