import { describe, it, expect } from 'vitest';
import { parseSql } from '../../src/parser/parseSql';
import { riskyCrossJoinRule } from '../../src/rules';

describe('riskyCrossJoinRule', () => {
  it('should warn on CROSS JOIN without WHERE', () => {
    const sql =
      'SELECT * FROM users CROSS JOIN orders';
    const ast = parseSql(sql);
    const result = riskyCrossJoinRule.validate({
      sql,
      dialect: 'postgres',
      options: { sql, dialect: 'postgres' },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(1);
    expect(result[0].code).toBe('CROSS_JOIN_WITHOUT_WHERE');
  });

  it('should allow CROSS JOIN with WHERE', () => {
    const sql =
      'SELECT * FROM users CROSS JOIN orders WHERE users.id = orders.user_id';
    const ast = parseSql(sql);
    const result = riskyCrossJoinRule.validate({
      sql,
      dialect: 'postgres',
      options: { sql, dialect: 'postgres' },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(0);
  });
});
