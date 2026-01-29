import { describe, it, expect } from 'vitest';
import { parseSql } from '../../src/parser/parseSql';
import { singleStatementRule } from '../../src/rules';

describe('singleStatementRule', () => {
  it('should allow single statement', () => {
    const sql = 'SELECT id FROM users';
    const ast = parseSql(sql);
    const result = singleStatementRule.validate({
      sql,
      dialect: 'postgres',
      options: { sql, dialect: 'postgres' },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(0);
  });

  it('should reject multiple statements', () => {
    const sql = 'SELECT id FROM users; SELECT id FROM orders';
    const ast = parseSql(sql);
    const result = singleStatementRule.validate({
      sql,
      dialect: 'postgres',
      options: { sql, dialect: 'postgres' },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(1);
    expect(result[0].code).toBe('MULTIPLE_STATEMENTS_NOT_ALLOWED');
  });
});
