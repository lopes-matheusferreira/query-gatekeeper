import {
  ValidateQueryOptions,
  ValidateQueryResult,
  SqlDialect
} from '../domain';
import { validateQuery } from '../core/validateQuery';

export type LangChainValidateInput = Omit<
  ValidateQueryOptions,
  'dialect'
> & {
  dialect?: SqlDialect;
};

export function createQueryGatekeeperTool(
  defaults?: Partial<ValidateQueryOptions>
) {
  return async (
    input: LangChainValidateInput
  ): Promise<ValidateQueryResult> => {
    const options: ValidateQueryOptions = {
      sql: input.sql,
      dialect:
        input.dialect ?? defaults?.dialect ?? 'generic',
      allowedTables:
        input.allowedTables ?? defaults?.allowedTables,
      blockedTables:
        input.blockedTables ?? defaults?.blockedTables,
      allowWriteOperations:
        input.allowWriteOperations ??
        defaults?.allowWriteOperations,
      maxLimit: input.maxLimit ?? defaults?.maxLimit,
      maxJoins: input.maxJoins ?? defaults?.maxJoins,
      selectStarSeverity:
        input.selectStarSeverity ??
        defaults?.selectStarSeverity,
      customRules:
        input.customRules ?? defaults?.customRules
    };

    return validateQuery(options);
  };
}
