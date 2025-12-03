import { describe, it, expect } from 'vitest';
import { parseSql } from '../../src/parser/parseSql';

describe('parseSql', () => {
  it('should parse valid SQL', () => {
    const sql = 'SELECT id FROM users WHERE id = 1';
    const ast = parseSql(sql);

    expect(ast).toBeDefined();
  });

  it('should throw error for empty SQL', () => {
    expect(() => parseSql('')).toThrow();
  });

  it('should throw error for invalid SQL', () => {
    expect(() => parseSql('SELCT FROM')).toThrow();
  });
});
