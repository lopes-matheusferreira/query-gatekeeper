import { SqlRule, RuleResult } from '../types';

export const noSelectStarRule: SqlRule = {
  name: 'no-select-star',

  validate(ast: any): RuleResult | null {
    const statements = Array.isArray(ast) ? ast : [ast];

    for (const statement of statements) {
      if (statement.type !== 'select') continue;

      const columns = statement.columns ?? [];
      
      for (const column of columns) {
        if (
          column.expr?.type === 'ref' &&
          column.expr.name === '*'
        ) {
          return {
            code: 'SELECT_STAR_NOT_ALLOWED',
            message: 'Usage of SELECT * is not allowed.',
            severity: 'error'
          };
        }
      }
    }

    return null;
  }
};
