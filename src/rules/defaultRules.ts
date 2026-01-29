import { SqlValidationRule } from '../domain';
import { maxJoinsRule } from './maxJoins';
import { maxLimitRule } from './maxLimit';
import { noSelectStarRule } from './noSelectStar';
import { readOnlyRule } from './readOnly';
import { riskyCrossJoinRule } from './riskyCrossJoin';
import { riskyWhereTautologyRule } from './riskyWhereTautology';
import { singleStatementRule } from './singleStatement';
import { sqlInjectionRule } from './sqlInjection';
import { tableAccessRule } from './tableAccess';

export function defaultRules(): SqlValidationRule[] {
  return [
    singleStatementRule,
    readOnlyRule,
    tableAccessRule,
    maxLimitRule,
    maxJoinsRule,
    noSelectStarRule,
    riskyCrossJoinRule,
    riskyWhereTautologyRule,
    sqlInjectionRule
  ];
}
