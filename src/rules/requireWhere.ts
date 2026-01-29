import {
  SqlValidationRule,
  ValidationIssue
} from '../domain';
import { collectSelectStatements } from './utils/ast';

export const requireWhereRule: SqlValidationRule = {
  name: 'require-where',
  description:
    'Require WHERE clause on SELECT statements.',

  validate(context): ValidationIssue[] {
    const statements = context.statements ?? [];

    for (const statement of statements) {
      for (const select of collectSelectStatements(statement)) {
        if (!select.where) {
          return [
            {
              code: 'WHERE_CLAUSE_REQUIRED',
              message:
                'SELECT statements must include a WHERE clause.',
              severity: 'error',
              rule: this.name
            }
          ];
        }
      }
    }

    return [];
  }
};
