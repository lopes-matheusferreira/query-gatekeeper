import { describe, it, expect } from 'vitest';
import { parseSql } from '../../src/parser/parseSql';
import { maxLimitRule } from '../../src/rules';

describe('maxLimitRule', () => {
  it('should require LIMIT when maxLimit is set', () => {
    const sql = 'SELECT id FROM users';
    const ast = parseSql(sql);
    const result = maxLimitRule.validate({
      sql,
      dialect: 'postgres',
      options: { sql, dialect: 'postgres', maxLimit: 10 },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(1);
    expect(result[0].code).toBe('LIMIT_REQUIRED');
  });

  it('should reject LIMIT over max', () => {
    const sql = 'SELECT id FROM users LIMIT 50';
    const ast = parseSql(sql);
    const result = maxLimitRule.validate({
      sql,
      dialect: 'postgres',
      options: { sql, dialect: 'postgres', maxLimit: 10 },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(1);
    expect(result[0].code).toBe('LIMIT_EXCEEDS_MAX');
  });

  it('should allow LIMIT within max', () => {
    const sql = 'SELECT id FROM users LIMIT 5';
    const ast = parseSql(sql);
    const result = maxLimitRule.validate({
      sql,
      dialect: 'postgres',
      options: { sql, dialect: 'postgres', maxLimit: 10 },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(0);
  });
});
