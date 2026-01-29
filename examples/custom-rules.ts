import { validateQuery } from '../src/core/validateQuery';
import {
  SqlValidationRule,
  ValidationIssue,
  ValidationContext
} from '../src/domain';

const noPiiColumnsRule: SqlValidationRule = {
  name: 'no-pii-columns',
  description: 'Prevent access to PII columns',

  validate(context: ValidationContext): ValidationIssue[] {
    const sensitiveColumns = ['ssn', 'credit_card', 'password', 'phone'];
    const sql = context.normalizedSql?.toLowerCase() || '';

    const issues: ValidationIssue[] = [];

    for (const column of sensitiveColumns) {
      if (sql.includes(column)) {
        issues.push({
          code: 'PII_COLUMN_ACCESS',
          message: `Query attempts to access sensitive column: ${column}`,
          severity: 'error',
          rule: this.name,
          suggestedFix: `Remove ${column} from your SELECT clause or use a hashed/masked version`
        });
      }
    }

    return issues;
  }
};

const requireAuditColumnsRule: SqlValidationRule = {
  name: 'require-audit-columns',
  description: 'Ensure audit columns are included',

  validate(context: ValidationContext): ValidationIssue[] {
    const sql = context.normalizedSql?.toLowerCase() || '';

    if (
      sql.includes('select') &&
      !sql.includes('created_at') &&
      !sql.includes('updated_at')
    ) {
      return [
        {
          code: 'MISSING_AUDIT_COLUMNS',
          message:
            'Query should include audit columns (created_at, updated_at)',
          severity: 'warning',
          rule: this.name,
          suggestedFix:
            'Add created_at and updated_at to your SELECT clause'
        }
      ];
    }

    return [];
  }
};

const result = validateQuery({
  sql: 'SELECT id, ssn, name FROM users LIMIT 10',
  dialect: 'postgres',
  customRules: [noPiiColumnsRule, requireAuditColumnsRule]
});

console.log('Validation Result:', JSON.stringify(result, null, 2));
