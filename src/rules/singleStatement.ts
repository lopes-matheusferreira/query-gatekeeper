import {
  SqlValidationRule,
  ValidationIssue
} from '../domain';

export const singleStatementRule: SqlValidationRule = {
  name: 'single-statement',
  description: 'Disallow multiple SQL statements in one query.',

  validate(context): ValidationIssue[] {
    const statements = context.statements ?? [];
    if (statements.length <= 1) {
      return [];
    }

    return [
      {
        code: 'MULTIPLE_STATEMENTS_NOT_ALLOWED',
        message:
          'Multiple SQL statements are not allowed in a single query.',
        severity: 'error',
        rule: this.name,
        metadata: {
          statementCount: statements.length
        }
      }
    ];
  }
};
