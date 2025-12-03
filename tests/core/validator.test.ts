import { describe, it, expect } from 'vitest';
import { validateSql } from '../../src/core/validator';
import { SqlRule } from '../../src/types';

describe('validateSql', () => {
  it('should return error for invalid SQL', () => {
    const result = validateSql('SELCT', []);

    expect(result.valid).toBe(false);
    expect(result.results.length).toBe(1);
    expect(result.results[0].code).toBe('INVALID_SQL');
  });

  it('should execute rules and return valid when no errors', () => {
    const mockRule: SqlRule = {
      name: 'mock-rule',
      validate: () => null
    };

    const result = validateSql(
      'SELECT id FROM users WHERE id = 1',
      [mockRule]
    );

    expect(result.valid).toBe(true);
    expect(result.results.length).toBe(0);
  });

  it('should return invalid when a rule returns error', () => {
    const mockRule: SqlRule = {
      name: 'error-rule',
      validate: () => ({
        code: 'ERROR_RULE',
        message: 'Rule failed',
        severity: 'error'
      })
    };

    const result = validateSql(
      'SELECT id FROM users WHERE id = 1',
      [mockRule]
    );

    expect(result.valid).toBe(false);
    expect(result.results.length).toBe(1);
  });
});
