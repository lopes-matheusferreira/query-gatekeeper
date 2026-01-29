import {
  SqlValidationRule,
  ValidationIssue
} from '../domain';
import { hasCrossJoinWithoutWhere } from './utils/ast';

export const riskyCrossJoinRule: SqlValidationRule = {
  name: 'cross-join-without-where',
  description:
    'Warn when a CROSS JOIN is used without any WHERE clause.',

  validate(context): ValidationIssue[] {
    const statements = context.statements ?? [];
    for (const statement of statements) {
      if (hasCrossJoinWithoutWhere(statement)) {
        return [
          {
            code: 'CROSS_JOIN_WITHOUT_WHERE',
            message:
              'CROSS JOIN without a WHERE clause can be expensive.',
            severity: 'warning',
            rule: this.name
          }
        ];
      }
    }
    return [];
  }
};
