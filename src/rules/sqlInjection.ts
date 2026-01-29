import {
  SqlValidationRule,
  ValidationIssue
} from '../domain';

const INJECTION_PATTERNS: Array<{
  code: string;
  message: string;
  regex: RegExp;
}> = [
  {
    code: 'SQLI_TAUTOLOGY',
    message: 'Potential tautology-based SQL injection.',
    regex: /(\bor\b|\band\b)\s+1\s*=\s*1/i
  },
  {
    code: 'SQLI_COMMENT',
    message: 'Potential SQL injection via comment sequence.',
    regex: /(--|\/\*)/i
  },
  {
    code: 'SQLI_STACKED_QUERY',
    message: 'Potential SQL injection via stacked query.',
    regex: /;\s*(drop|alter|create|truncate|insert|update|delete)\b/i
  }
];

export const sqlInjectionRule: SqlValidationRule = {
  name: 'sql-injection-patterns',
  description:
    'Detect basic SQL injection patterns in the raw SQL.',

  validate(context): ValidationIssue[] {
    const sql = context.sql ?? '';
    const issues: ValidationIssue[] = [];

    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.regex.test(sql)) {
        issues.push({
          code: pattern.code,
          message: pattern.message,
          severity: 'error',
          rule: this.name,
          metadata: {
            pattern: pattern.regex.toString()
          }
        });
      }
    }

    return issues;
  }
};
