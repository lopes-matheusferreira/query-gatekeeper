export type RuleSeverity = 'error' | 'warning';

export interface RuleResult {
  code: string;
  message: string;
  severity: RuleSeverity;
}
