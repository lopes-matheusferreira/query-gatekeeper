import { describe, it, expect } from 'vitest';
import { parseSql } from '../../src/parser/parseSql';
import { readOnlyRule } from '../../src/rules';

describe('readOnlyRule', () => {
  it('should allow SELECT when write operations are disabled', () => {
    const sql = 'SELECT id FROM users';
    const ast = parseSql(sql);
    const result = readOnlyRule.validate({
      sql,
      dialect: 'postgres',
      options: { sql, dialect: 'postgres' },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(0);
  });

  it('should reject UPDATE when write operations are disabled', () => {
    const sql = "UPDATE users SET name = 'x'";
    const ast = parseSql(sql);
    const result = readOnlyRule.validate({
      sql,
      dialect: 'postgres',
      options: { sql, dialect: 'postgres' },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(1);
    expect(result[0].code).toBe('WRITE_OPERATION_NOT_ALLOWED');
  });

  it('should allow UPDATE when write operations are enabled', () => {
    const sql = "UPDATE users SET name = 'x'";
    const ast = parseSql(sql);
    const result = readOnlyRule.validate({
      sql,
      dialect: 'postgres',
      options: {
        sql,
        dialect: 'postgres',
        allowWriteOperations: true
      },
      statements: Array.isArray(ast) ? ast : [ast]
    });

    expect(result.length).toBe(0);
  });
});
