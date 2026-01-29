import {
  SqlValidationRule,
  ValidationIssue
} from '../domain';
import { countJoins } from './utils/ast';

export const maxJoinsRule: SqlValidationRule = {
  name: 'max-joins',
  description:
    'Enforce a maximum number of JOIN clauses when configured.',

  validate(context): ValidationIssue[] {
    const maxJoins = context.options.maxJoins;
    if (typeof maxJoins !== 'number') {
      return [];
    }

    const issues: ValidationIssue[] = [];
    const statements = context.statements ?? [];

    for (const statement of statements) {
      const joinCount = countJoins(statement);
      if (joinCount > maxJoins) {
        issues.push({
          code: 'TOO_MANY_JOINS',
          message: `Query uses ${joinCount} joins, exceeding the maximum allowed (${maxJoins}).`,
          severity: 'error',
          rule: this.name,
          metadata: {
            joinCount,
            maxJoins
          }
        });
      }
    }

    return issues;
  }
};
