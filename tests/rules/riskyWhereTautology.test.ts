import { describe, it, expect } from 'vitest';
import { parseSql } from '../../src/parser/parseSql';
import { riskyWhereTautologyRule } from '../../src/rules';

describe('riskyWhereTautologyRule', () => {
  it('should warn on WHERE 1=1', () => {
    const sql = 'SELECT id FROM users WHERE 1 = 1';
    const ast = parseSql(sql);
    const result = riskyWhereTautologyRule.validate({
      sql,
      dialect: 'postgres',
      options: { sql, dialect: 'postgres' },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(1);
    expect(result[0].code).toBe('WHERE_TAUTOLOGY');
  });

  it('should allow WHERE with real filter', () => {
    const sql = 'SELECT id FROM users WHERE id = 1';
    const ast = parseSql(sql);
    const result = riskyWhereTautologyRule.validate({
      sql,
      dialect: 'postgres',
      options: { sql, dialect: 'postgres' },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(0);
  });
});
