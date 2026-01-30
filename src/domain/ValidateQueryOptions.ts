import { SqlDialect } from './SqlDialect';
import { SqlValidationRule } from './SqlValidationRule';
import { ValidationSeverity } from './ValidationIssue';

export interface ValidateQueryOptions {
  sql: string;
  dialect: SqlDialect;
  enabledRules?: string[];
  allowedTables?: string[];
  blockedTables?: string[];
  allowWriteOperations?: boolean;
  maxLimit?: number;
  maxJoins?: number;
  selectStarSeverity?: ValidationSeverity;
  customRules?: SqlValidationRule[];
}
