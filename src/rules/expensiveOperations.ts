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
  let found = false;
  walkExpr(select.where, (node) => {
    if (
      node?.type === 'binary' &&
      (node.op === 'LIKE' || node.op === 'ILIKE') &&
      node.right?.type === 'string' &&
      typeof node.right.value === 'string' &&
      node.right.value.startsWith('%')
    ) {
      found = true;
    }
  });
  return found;
}

function checkForMultipleOrs(select: any): boolean {
  let count = 0;
  walkExpr(select.where, (node) => {
    if (node?.type === 'binary' && node.op === 'OR') {
      count += 1;
    }
  });
  return count >= 3;
}

function checkForFunctionInWhere(select: any): boolean {
  const functions = new Set([
    'upper',
    'lower',
    'substring',
    'concat',
    'cast'
  ]);
  let found = false;
  walkExpr(select.where, (node) => {
    if (
      node?.type === 'call' &&
      node.function?.name &&
      functions.has(String(node.function.name).toLowerCase())
    ) {
      found = true;
    }
  });
  return found;
}

function walkExpr(
  expr: any,
  visit: (node: any) => void
) {
  if (!expr || typeof expr !== 'object') return;
  visit(expr);
  for (const value of Object.values(expr)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        walkExpr(item, visit);
      }
    } else if (value && typeof value === 'object') {
      walkExpr(value, visit);
    }
  }
}
