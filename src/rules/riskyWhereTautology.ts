import {
  SqlValidationRule,
  ValidationIssue
} from '../domain';
import { isWhereTautology } from './utils/ast';

export const riskyWhereTautologyRule: SqlValidationRule = {
  name: 'where-tautology',
  description:
    'Warn when WHERE is a tautology such as 1=1.',

  validate(context): ValidationIssue[] {
    const statements = context.statements ?? [];
    for (const statement of statements) {
      if (isWhereTautology(statement)) {
        return [
          {
            code: 'WHERE_TAUTOLOGY',
            message:
              'WHERE clause is always true (e.g., 1=1).',
            severity: 'warning',
            rule: this.name
          }
        ];
      }
    }
    return [];
  }
};
