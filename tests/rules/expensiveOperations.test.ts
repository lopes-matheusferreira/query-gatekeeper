import { describe, it, expect } from 'vitest';
import { parseSql } from '../../src/parser/parseSql';
import { expensiveOperationsRule } from '../../src/rules';

describe('expensiveOperationsRule', () => {
  it('should warn on leading wildcard LIKE', () => {
    const sql =
      "SELECT id FROM users WHERE name LIKE '%john%'";
    const ast = parseSql(sql);
    const result = expensiveOperationsRule.validate({
      sql,
      dialect: 'postgres',
      options: { sql, dialect: 'postgres' },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(
      result.some(
        (issue) => issue.code === 'LEADING_WILDCARD_LIKE'
      )
    ).toBe(true);
  });

  it('should warn on multiple OR conditions', () => {
    const sql =
      'SELECT id FROM users WHERE a = 1 OR b = 2 OR c = 3 OR d = 4';
    const ast = parseSql(sql);
    const result = expensiveOperationsRule.validate({
      sql,
      dialect: 'postgres',
      options: { sql, dialect: 'postgres' },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(
      result.some(
        (issue) => issue.code === 'MULTIPLE_OR_CONDITIONS'
      )
    ).toBe(true);
  });

  it('should warn on function in WHERE', () => {
    const sql =
      "SELECT id FROM users WHERE UPPER(name) = 'JOHN'";
    const ast = parseSql(sql);
    const result = expensiveOperationsRule.validate({
      sql,
      dialect: 'postgres',
      options: { sql, dialect: 'postgres' },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(
      result.some(
        (issue) => issue.code === 'FUNCTION_IN_WHERE'
      )
    ).toBe(true);
  });
});
