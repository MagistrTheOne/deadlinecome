import { describe, it, expect } from 'vitest';
import { generateId, generateKey, formatDate } from '@/lib/utils';

describe('UUID Generation', () => {
  describe('generateId', () => {
    it('should generate valid UUID v4', () => {
      const id = generateId();

      // UUID v4 regex pattern
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(uuidRegex.test(id)).toBe(true);
      expect(typeof id).toBe('string');
      expect(id.length).toBe(36);
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with correct version (4)', () => {
      const id = generateId();
      const version = id.split('-')[2][0];

      expect(version).toBe('4');
    });
  });

  describe('generateKey', () => {
    it('should generate key with prefix and number', () => {
      const key = generateKey('WEB');

      expect(key.startsWith('WEB-')).toBe(true);
      expect(key.split('-')).toHaveLength(2);

      const [, numberPart] = key.split('-');
      expect(parseInt(numberPart)).toBeGreaterThan(0);
    });

    it('should generate unique keys for same prefix', () => {
      const key1 = generateKey('WEB');
      const key2 = generateKey('WEB');

      // Ключи должны быть уникальными (с высокой вероятностью)
      expect(key1).not.toBe(key2);
    });

    it('should handle different prefixes', () => {
      const webKey = generateKey('WEB');
      const apiKey = generateKey('API');
      const taskKey = generateKey('TASK');

      expect(webKey.startsWith('WEB-')).toBe(true);
      expect(apiKey.startsWith('API-')).toBe(true);
      expect(taskKey.startsWith('TASK-')).toBe(true);
    });
  });
});

describe('Date Formatting', () => {
  describe('formatDate', () => {
    it('should format Date object correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date);

      expect(formatted).toBe('Jan 15, 2024');
    });

    it('should format ISO string correctly', () => {
      const isoString = '2024-01-15T10:30:00Z';
      const formatted = formatDate(isoString);

      expect(formatted).toBe('Jan 15, 2024');
    });

    it('should handle different date formats', () => {
      const dateString = '2024-02-29';
      const formatted = formatDate(dateString);

      expect(formatted).toBe('Feb 29, 2024');
    });
  });
});

describe('Utility Functions', () => {
  it('should export all required functions', () => {
    expect(typeof generateId).toBe('function');
    expect(typeof generateKey).toBe('function');
    expect(typeof formatDate).toBe('function');
  });
});
