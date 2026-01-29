import { describe, it, expect } from 'vitest';
import { sqlInjectionRule } from '../../src/rules';

describe('sqlInjectionRule', () => {
  it('should flag tautology injection', () => {
    const sql = "SELECT * FROM users WHERE name = 'a' OR 1=1";
    const result = sqlInjectionRule.validate({
      sql,
      dialect: 'postgres',
      options: { sql, dialect: 'postgres' }
    });

    expect(result.length).toBeGreaterThan(0);
    expect(
      result.some((issue) => issue.code === 'SQLI_TAUTOLOGY')
    ).toBe(true);
  });

  it('should flag comment injection', () => {
    const sql = 'SELECT * FROM users --';
    const result = sqlInjectionRule.validate({
      sql,
      dialect: 'postgres',
      options: { sql, dialect: 'postgres' }
    });

    expect(
      result.some((issue) => issue.code === 'SQLI_COMMENT')
    ).toBe(true);
  });
});
