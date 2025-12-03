import { describe, it, expect } from 'vitest';
import { parseSql } from '../../src/parser/parseSql';
import { requireWhereRule } from '../../src/rules';

describe('requireWhereRule', () => {
  it('should return error when SELECT has no WHERE clause', () => {
    const ast = parseSql('SELECT id FROM users');
    const result = requireWhereRule.validate(ast);

    expect(result).not.toBeNull();
    expect(result?.code).toBe('WHERE_CLAUSE_REQUIRED');
  });

  it('should return null when SELECT has WHERE clause', () => {
    const ast = parseSql('SELECT id FROM users WHERE id = 1');
    const result = requireWhereRule.validate(ast);

    expect(result).toBeNull();
  });
});
