export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
  code: string;
  message: string;
  severity: ValidationSeverity;
  rule: string;
  metadata?: Record<string, unknown>;
}
