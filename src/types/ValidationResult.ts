import { RuleResult } from './RuleResult';

export interface ValidationResult {
  valid: boolean;
  results: RuleResult[];
  feedback: string;
}
