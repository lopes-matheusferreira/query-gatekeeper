import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import {
  ValidateQueryResult,
  SqlDialect
} from '../domain';
import { validateQuery } from '../core/validateQuery';

export interface QueryGatekeeperToolOptions {
  dialect?: SqlDialect;
  allowedTables?: string[];
  blockedTables?: string[];
  allowWriteOperations?: boolean;
  maxLimit?: number;
  maxJoins?: number;
  selectStarSeverity?: 'error' | 'warning';
}

const queryGatekeeperSchema = z.object({
  sql: z.string().describe('The SQL query to validate')
});

export class QueryGatekeeperTool extends StructuredTool {
  name = 'query_gatekeeper';

  description = `Validates SQL queries for security and correctness before execution.
Returns validation results with errors, warnings, and suggestions for fixes.
ALWAYS use this tool to validate SQL before executing it.

Input: { sql: "SELECT statement" }
Output: Validation report with pass/fail status and detailed feedback`;

  schema = queryGatekeeperSchema;

  constructor(private options: QueryGatekeeperToolOptions = {}) {
    super();
  }

  protected async _call(
    input: z.infer<typeof queryGatekeeperSchema>
  ): Promise<string> {
    const result = validateQuery({
      sql: input.sql,
      dialect: this.options.dialect ?? 'postgres',
      allowedTables: this.options.allowedTables,
      blockedTables: this.options.blockedTables,
      allowWriteOperations: this.options.allowWriteOperations,
      maxLimit: this.options.maxLimit,
      maxJoins: this.options.maxJoins,
      selectStarSeverity: this.options.selectStarSeverity
    });

    return this.formatResult(result);
  }

  private formatResult(result: ValidateQueryResult): string {
    const lines: string[] = [];

    if (!result.isValid) {
      lines.push('❌ VALIDATION FAILED - Query cannot be executed');
      lines.push('');
      lines.push('Errors:');
      for (const error of result.errors) {
        lines.push(`  • [${error.code}] ${error.message}`);
        if (error.suggestedFix) {
          lines.push(`    Fix: ${error.suggestedFix}`);
        }
      }
      lines.push('');
      lines.push('You must fix these errors before executing the query.');
    } else if (result.warnings.length > 0) {
      lines.push('⚠️  VALIDATION PASSED (with warnings)');
      lines.push('');
      lines.push('Warnings:');
      for (const warning of result.warnings) {
        lines.push(`  • [${warning.code}] ${warning.message}`);
        if (warning.suggestedFix) {
          lines.push(`    Suggestion: ${warning.suggestedFix}`);
        }
      }
      lines.push('');
      lines.push(
        'Query is safe to execute, but consider addressing the warnings.'
      );
    } else {
      lines.push('✅ VALIDATION PASSED');
      lines.push('Query is safe to execute.');
    }

    return lines.join('\n');
  }
}

export function createQueryGatekeeperTool(
  options?: QueryGatekeeperToolOptions
): QueryGatekeeperTool {
  return new QueryGatekeeperTool(options);
}
