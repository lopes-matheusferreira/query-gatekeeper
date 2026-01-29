import {
  SqlValidationRule,
  ValidationIssue
} from '../domain';
import { hasSelectStar } from './utils/ast';

export const noSelectStarRule: SqlValidationRule = {
  name: 'no-select-star',
  description: 'Warn or reject usage of SELECT *.',

  validate(context): ValidationIssue[] {
    const severity =
      context.options.selectStarSeverity ?? 'warning';

    const statements = context.statements ?? [];
    for (const statement of statements) {
      if (hasSelectStar(statement)) {
        return [
          {
            code: 'SELECT_STAR_NOT_ALLOWED',
            message: 'Usage of SELECT * is not allowed.',
            severity,
            rule: this.name,
            suggestedFix:
              'Replace SELECT * with explicit column names. Example: SELECT id, name, email FROM table_name'
          }
        ];
      }
    }

    return [];
  }
};
