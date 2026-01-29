import {
  SqlValidationRule,
  ValidationIssue
} from '../domain';
import {
  collectTableNames,
  isTableAllowed,
  normalizeTableList
} from './utils/ast';

export const tableAccessRule: SqlValidationRule = {
  name: 'table-access',
  description:
    'Enforce allow/deny lists for table access.',

  validate(context): ValidationIssue[] {
    const allowed = normalizeTableList(
      context.options.allowedTables
    );
    const blocked = normalizeTableList(
      context.options.blockedTables
    );

    if (allowed.length === 0 && blocked.length === 0) {
      return [];
    }

    const issues: ValidationIssue[] = [];
    const statements = context.statements ?? [];

    for (const statement of statements) {
      const tables = collectTableNames(statement);
      for (const table of tables) {
        if (blocked.includes(table)) {
          issues.push({
            code: 'TABLE_BLOCKED',
            message: `Access to table "${table}" is blocked.`,
            severity: 'error',
            rule: this.name,
            suggestedFix: `Table "${table}" is blocked. Choose a different table.`,
            metadata: {
              table
            }
          });
          continue;
        }

        if (
          allowed.length > 0 &&
          !isTableAllowed(table, allowed)
        ) {
          issues.push({
            code: 'TABLE_NOT_ALLOWED',
            message: `Access to table "${table}" is not allowed.`,
            severity: 'error',
            rule: this.name,
            suggestedFix: `Use only allowed tables: ${allowed.join(', ')}`,
            metadata: {
              table
            }
          });
        }
      }
    }

    return issues;
  }
};
