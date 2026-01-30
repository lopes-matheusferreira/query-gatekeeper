import { parseSql } from '../parser/parseSql';
import {
  ValidateQueryOptions,
  ValidateQueryResult,
  ValidationContext,
  ValidationIssue
} from '../domain';
import { defaultRules } from '../rules';

const PARSER_RULE_NAME = 'parser';

export function validateQuery(
  options: ValidateQueryOptions
): ValidateQueryResult {
  const normalizedSql = options.sql?.trim() ?? '';

  const context: ValidationContext = {
    sql: options.sql,
    dialect: options.dialect,
    options,
    normalizedSql
  };

  const issues: ValidationIssue[] = [];

  try {
    const ast = parseSql(normalizedSql);
    context.statements = Array.isArray(ast) ? ast : [ast];
  } catch (error) {
    issues.push({
      code: 'INVALID_SQL',
      message: 'Invalid SQL syntax.',
      severity: 'error',
      rule: PARSER_RULE_NAME,
      metadata: {
        error:
          error instanceof Error ? error.message : String(error)
      }
    });
  }

  const allRules = [
    ...defaultRules(),
    ...(options.customRules ?? [])
  ];
  const enabledRules = options.enabledRules;
  const rules = enabledRules
    ? allRules.filter((rule) =>
        enabledRules.includes(rule.name)
      )
    : allRules;

  if (issues.length === 0) {
    for (const rule of rules) {
      try {
        const results = rule.validate(context);
        for (const result of results) {
          issues.push(result);
        }
      } catch (error) {
        issues.push({
          code: 'RULE_EXECUTION_ERROR',
          message: `Rule "${rule.name}" failed to execute.`,
          severity: 'error',
          rule: rule.name,
          metadata: {
            error:
              error instanceof Error ? error.message : String(error)
          }
        });
      }
    }
  }

  const errors = issues.filter(
    (issue) => issue.severity === 'error'
  );
  const warnings = issues.filter(
    (issue) => issue.severity === 'warning'
  );

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    normalizedSql
  };
}
