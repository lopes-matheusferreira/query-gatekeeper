import { describe, it, expect } from 'vitest';
import { parseSql } from '../../src/parser/parseSql';
import { noSelectStarRule } from '../../src/rules';

describe('noSelectStarRule', () => {
  it('should return warning when SELECT * is used by default', () => {
    const ast = parseSql('SELECT * FROM users');
    const result = noSelectStarRule.validate({
      sql: 'SELECT * FROM users',
      dialect: 'postgres',
      options: { sql: 'SELECT * FROM users', dialect: 'postgres' },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(1);
    expect(result[0].code).toBe('SELECT_STAR_NOT_ALLOWED');
    expect(result[0].severity).toBe('warning');
  });

  it('should return error when severity is set to error', () => {
    const ast = parseSql('SELECT * FROM users');
    const result = noSelectStarRule.validate({
      sql: 'SELECT * FROM users',
      dialect: 'postgres',
      options: {
        sql: 'SELECT * FROM users',
        dialect: 'postgres',
        selectStarSeverity: 'error'
      },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(1);
    expect(result[0].severity).toBe('error');
  });

  it('should return empty when SELECT specific columns', () => {
    const ast = parseSql('SELECT id, name FROM users');
    const result = noSelectStarRule.validate({
      sql: 'SELECT id, name FROM users',
      dialect: 'postgres',
      options: {
        sql: 'SELECT id, name FROM users',
        dialect: 'postgres'
      },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(0);
  });
});
