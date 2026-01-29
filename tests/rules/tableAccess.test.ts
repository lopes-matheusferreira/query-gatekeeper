import { describe, it, expect } from 'vitest';
import { parseSql } from '../../src/parser/parseSql';
import { tableAccessRule } from '../../src/rules';

describe('tableAccessRule', () => {
  it('should allow tables in allow list', () => {
    const sql = 'SELECT id FROM users';
    const ast = parseSql(sql);
    const result = tableAccessRule.validate({
      sql,
      dialect: 'postgres',
      options: {
        sql,
        dialect: 'postgres',
        allowedTables: ['users']
      },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(0);
  });

  it('should reject tables not in allow list', () => {
    const sql = 'SELECT id FROM users';
    const ast = parseSql(sql);
    const result = tableAccessRule.validate({
      sql,
      dialect: 'postgres',
      options: {
        sql,
        dialect: 'postgres',
        allowedTables: ['orders']
      },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(1);
    expect(result[0].code).toBe('TABLE_NOT_ALLOWED');
  });

  it('should reject blocked tables', () => {
    const sql = 'SELECT id FROM users';
    const ast = parseSql(sql);
    const result = tableAccessRule.validate({
      sql,
      dialect: 'postgres',
      options: {
        sql,
        dialect: 'postgres',
        blockedTables: ['users']
      },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(1);
    expect(result[0].code).toBe('TABLE_BLOCKED');
  });
});
