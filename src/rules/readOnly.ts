import {
  SqlValidationRule,
  ValidationIssue
} from '../domain';

const READ_ONLY_TYPES = new Set([
  'select',
  'union',
  'union all',
  'with',
  'with recursive',
  'values'
]);

export const readOnlyRule: SqlValidationRule = {
  name: 'read-only',
  description: 'Disallow write operations unless explicitly enabled.',

  validate(context): ValidationIssue[] {
    if (context.options.allowWriteOperations === true) {
      return [];
    }

    const statements = context.statements ?? [];
    const issues: ValidationIssue[] = [];

    for (const statement of statements) {
      const type = (statement as { type?: string })?.type;
      if (type && !READ_ONLY_TYPES.has(type)) {
        issues.push({
          code: 'WRITE_OPERATION_NOT_ALLOWED',
          message:
            'Write operations are not allowed for this query.',
          severity: 'error',
          rule: this.name,
          suggestedFix:
            'Use SELECT queries only. Write operations (INSERT, UPDATE, DELETE) are not allowed.',
          metadata: {
            statementType: type
          }
        });
      }
    }

    return issues;
  }
};
