import {
  SqlValidationRule,
  ValidationIssue
} from '../domain';
import { collectSelectStatements } from './utils/ast';

export const expensiveOperationsRule: SqlValidationRule = {
  name: 'expensive-operations',
  description: 'Warn about potentially expensive database operations',

  validate(context): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const statements = context.statements ?? [];

    for (const statement of statements) {
      for (const select of collectSelectStatements(statement)) {
        const hasLeadingWildcard =
          checkForLeadingWildcard(select);
        if (hasLeadingWildcard) {
          issues.push({
            code: 'LEADING_WILDCARD_LIKE',
            message:
              "LIKE pattern with leading wildcard (LIKE '%pattern%') prevents index usage and can be slow.",
            severity: 'warning',
            rule: this.name,
            suggestedFix:
              'If possible, remove the leading % from LIKE pattern or use full-text search instead'
          });
        }

        const hasMultipleOrs = checkForMultipleOrs(select);
        if (hasMultipleOrs) {
          issues.push({
            code: 'MULTIPLE_OR_CONDITIONS',
            message:
              'Multiple OR conditions may prevent index usage.',
            severity: 'warning',
            rule: this.name,
            suggestedFix:
              'Consider using UNION or IN clause instead of multiple OR conditions'
          });
        }

        const hasFunctionInWhere =
          checkForFunctionInWhere(select);
        if (hasFunctionInWhere) {
          issues.push({
            code: 'FUNCTION_IN_WHERE',
            message:
              'Using functions on columns in WHERE clause prevents index usage.',
            severity: 'warning',
            rule: this.name,
            suggestedFix:
              'Apply functions to literal values instead of columns, or create a computed index'
          });
        }
      }
    }

    return issues;
  }
};

function checkForLeadingWildcard(select: any): boolean {
  const whereStr = JSON.stringify(select.where || {});
  return /LIKE.*['"]%/.test(whereStr);
}

function checkForMultipleOrs(select: any): boolean {
  const whereStr = JSON.stringify(select.where || {});
  const orCount = (whereStr.match(/\bOR\b/gi) || []).length;
  return orCount >= 3;
}

function checkForFunctionInWhere(select: any): boolean {
  const whereStr = JSON.stringify(select.where || {});
  return /\b(UPPER|LOWER|SUBSTRING|CONCAT|CAST)\s*\(/.test(
    whereStr
  );
}
