import { SqlDialect } from './SqlDialect';
import { ValidateQueryOptions } from './ValidateQueryOptions';

export interface ValidationContext {
  sql: string;
  dialect: SqlDialect;
  options: ValidateQueryOptions;
  statements?: unknown[];
  normalizedSql?: string;
}
