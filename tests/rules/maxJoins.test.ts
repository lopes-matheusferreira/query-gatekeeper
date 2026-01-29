import { describe, it, expect } from 'vitest';
import { parseSql } from '../../src/parser/parseSql';
import { maxJoinsRule } from '../../src/rules';

describe('maxJoinsRule', () => {
  it('should reject when joins exceed max', () => {
    const sql =
      'SELECT * FROM users u JOIN roles r ON r.user_id = u.id';
    const ast = parseSql(sql);
    const result = maxJoinsRule.validate({
      sql,
      dialect: 'postgres',
      options: { sql, dialect: 'postgres', maxJoins: 0 },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(1);
    expect(result[0].code).toBe('TOO_MANY_JOINS');
  });

  it('should allow when joins within max', () => {
    const sql =
      'SELECT * FROM users u JOIN roles r ON r.user_id = u.id';
    const ast = parseSql(sql);
    const result = maxJoinsRule.validate({
      sql,
      dialect: 'postgres',
      options: { sql, dialect: 'postgres', maxJoins: 1 },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(0);
  });
});
