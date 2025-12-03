import { SqlRule, RuleResult } from '../types';

export const requireWhereRule: SqlRule = {
  name: 'require-where',

  validate(ast: any): RuleResult | null {
    const statements = Array.isArray(ast) ? ast : [ast];

    for (const statement of statements) {
      if (statement.type !== 'select') continue;

      if (!statement.where) {
        return {
          code: 'WHERE_CLAUSE_REQUIRED',
          message: 'SELECT statements must include a WHERE clause.',
          severity: 'error'
        };
      }
    }

    return null;
  }
};
