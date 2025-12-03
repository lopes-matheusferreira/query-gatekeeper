import { RuleResult } from './RuleResult';

export interface SqlRule {
  name: string;
  validate(ast: unknown): RuleResult | null;
}
