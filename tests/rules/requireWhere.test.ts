import { describe, it, expect } from 'vitest';
import { parseSql } from '../../src/parser/parseSql';
import { requireWhereRule } from '../../src/rules';

describe('requireWhereRule', () => {
  it('should return error when SELECT has no WHERE clause', () => {
    const ast = parseSql('SELECT id FROM users');
    const result = requireWhereRule.validate({
      sql: 'SELECT id FROM users',
      dialect: 'postgres',
      options: { sql: 'SELECT id FROM users', dialect: 'postgres' },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(1);
    expect(result[0].code).toBe('WHERE_CLAUSE_REQUIRED');
  });

  it('should return null when SELECT has WHERE clause', () => {
    const ast = parseSql('SELECT id FROM users WHERE id = 1');
    const result = requireWhereRule.validate({
      sql: 'SELECT id FROM users WHERE id = 1',
      dialect: 'postgres',
      options: {
        sql: 'SELECT id FROM users WHERE id = 1',
        dialect: 'postgres'
      },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(0);
  });
});
