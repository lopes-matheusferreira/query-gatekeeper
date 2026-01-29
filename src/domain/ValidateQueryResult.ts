import { ValidationIssue } from './ValidationIssue';

export interface ValidateQueryResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  normalizedSql?: string;
  riskScore?: number;
}
