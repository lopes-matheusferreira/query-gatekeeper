import { describe, it, expect } from 'vitest';
import { validateQuery } from '../../src/core/validateQuery';

describe('validateQuery (integration)', () => {
  it('should reject invalid SQL', () => {
    const result = validateQuery({
      sql: 'SELCT 1',
      dialect: 'postgres'
    });

    expect(result.isValid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_SQL');
  });

  it('should enforce allow list and max limit', () => {
    const result = validateQuery({
      sql: 'SELECT id FROM users LIMIT 10',
      dialect: 'postgres',
      allowedTables: ['users'],
      maxLimit: 5
    });

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some(
        (issue) => issue.code === 'LIMIT_EXCEEDS_MAX'
      )
    ).toBe(true);
  });

  it('should block write operations by default', () => {
    const result = validateQuery({
      sql: 'DELETE FROM users',
      dialect: 'postgres'
    });

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some(
        (issue) => issue.code === 'WRITE_OPERATION_NOT_ALLOWED'
      )
    ).toBe(true);
  });
});
