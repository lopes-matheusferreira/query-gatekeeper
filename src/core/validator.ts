import { parseSql } from '../parser/parseSql';
import { SqlRule, ValidationResult, RuleResult } from '../types';

export function validateSql(
  query: string,
  rules: SqlRule[]
): ValidationResult {
  let ast;

  try {
    ast = parseSql(query);
  } catch (_error) {
    return {
      valid: false,
      results: [
        {
          code: 'INVALID_SQL',
          message: 'Invalid SQL syntax',
          severity: 'error'
        }
      ],
      feedback: 'The generated SQL is invalid. Please fix the syntax.'
    };
  }

  const results: RuleResult[] = [];

  for (const rule of rules) {
    const result = rule.validate(ast);
    if (result) {
      results.push(result);
    }
  }

  const hasErrors = results.some(
    (r) => r.severity === 'error'
  );

  return {
    valid: !hasErrors,
    results,
    feedback: hasErrors
      ? 'The SQL query violates one or more validation rules.'
      : 'The SQL query is valid.'
  };
}
