import {
  SqlValidationRule,
  ValidationIssue
} from '../domain';
import { getLimitInfo } from './utils/ast';

export const maxLimitRule: SqlValidationRule = {
  name: 'max-limit',
  description:
    'Require a LIMIT and enforce a maximum limit when configured.',

  validate(context): ValidationIssue[] {
    const maxLimit = context.options.maxLimit;
    if (typeof maxLimit !== 'number') {
      return [];
    }

    const issues: ValidationIssue[] = [];
    const statements = context.statements ?? [];

    for (const statement of statements) {
      const { hasLimit, limitValue } =
        getLimitInfo(statement);

      if (!hasLimit) {
        issues.push({
          code: 'LIMIT_REQUIRED',
          message:
            'A LIMIT clause is required for this query.',
          severity: 'error',
          rule: this.name,
          suggestedFix: `Add a LIMIT clause to your query. Example: ... LIMIT ${maxLimit}`,
          metadata: {
            maxLimit
          }
        });
        continue;
      }

      if (
        typeof limitValue !== 'number' ||
        Number.isNaN(limitValue)
      ) {
        issues.push({
          code: 'LIMIT_NOT_CONSTANT',
          message:
            'The LIMIT value must be a constant number.',
          severity: 'error',
          rule: this.name,
          suggestedFix:
            'Use a constant number for LIMIT instead of a variable or expression',
          metadata: {
            maxLimit
          }
        });
        continue;
      }

      if (limitValue > maxLimit) {
        issues.push({
          code: 'LIMIT_EXCEEDS_MAX',
          message: `LIMIT ${limitValue} exceeds the maximum allowed (${maxLimit}).`,
          severity: 'error',
          rule: this.name,
          suggestedFix: `Reduce LIMIT to ${maxLimit} or less. Change LIMIT ${limitValue} to LIMIT ${maxLimit}`,
          metadata: {
            limitValue,
            maxLimit
          }
        });
      }
    }

    return issues;
  }
};
