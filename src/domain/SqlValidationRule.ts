import { ValidationContext } from './ValidationContext';
import { ValidationIssue } from './ValidationIssue';

export interface SqlValidationRule {
  name: string;
  description?: string;
  validate(context: ValidationContext): ValidationIssue[];
}
