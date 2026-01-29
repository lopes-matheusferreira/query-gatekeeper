# query-gatekeeper

SQL validation utilities built on top of `pgsql-ast-parser`.

## Install

```bash
npm install query-gatekeeper
```

## Quick start

```ts
import { validateQuery } from 'query-gatekeeper';

const result = validateQuery({
  sql: 'SELECT id, name FROM users WHERE id = 1 LIMIT 10',
  dialect: 'postgres',
  maxLimit: 50,
  allowedTables: ['users']
});

console.log(result);
```

## LangChain Integration

Query Gatekeeper integrates seamlessly with LangChain for safe text-to-SQL applications.

### Installation for LangChain
```bash
npm install query-gatekeeper @langchain/core
```

### Basic Usage with LangChain
```ts
import { QueryGatekeeperTool } from 'query-gatekeeper';
import { ChatOpenAI } from '@langchain/openai';

const gatekeeper = new QueryGatekeeperTool({
  dialect: 'postgres',
  allowedTables: ['users', 'orders'],
  maxLimit: 100,
  selectStarSeverity: 'error'
});

const result = await gatekeeper.invoke({
  sql: 'SELECT id, name FROM users LIMIT 50'
});

console.log(result);
```

### Agent Workflow
```ts
// 1. LLM generates SQL
const sql = await llm.generate("SELECT * FROM users");

// 2. Validate with Gatekeeper
const validation = await gatekeeper.invoke({ sql });

// 3. If failed, send errors back to LLM to fix
// 4. If passed, execute the query safely
```

See `examples/langchain-text-to-sql.ts` for a complete working example.

## API

### validateQuery(options)

Validates a SQL string against the default rules and any custom rules.

Returns:

- `isValid`: boolean
- `errors`: array of validation issues
- `warnings`: array of validation issues
- `normalizedSql`: normalized query string

```ts
import { validateQuery } from 'query-gatekeeper';

const result = validateQuery({
  sql: 'SELECT id FROM users WHERE id = 1',
  dialect: 'postgres'
});
```

### parseSql(query)

Parses SQL into an AST (throws on invalid SQL or empty input).

```ts
import { parseSql } from 'query-gatekeeper';

const ast = parseSql('SELECT id FROM users WHERE id = 1');
```

### Built-in rules

- `noSelectStarRule`: rejects `SELECT *` (configurable severity)
- `requireWhereRule`: requires `WHERE` on `SELECT` (optional)
- `readOnlyRule`: blocks DML/DDL by default
- `singleStatementRule`: blocks multiple statements
- `tableAccessRule`: enforces allow/deny list
- `maxLimitRule`: enforces LIMIT and max value
- `maxJoinsRule`: enforces maximum JOIN count
- `riskyCrossJoinRule`: warns on CROSS JOIN without WHERE
- `riskyWhereTautologyRule`: warns on `WHERE 1=1`
- `sqlInjectionRule`: basic SQLi pattern detection
- `expensiveOperationsRule`: warns about slow operations (optional)

All rules now include `suggestedFix` to help LLMs correct invalid queries.

```ts
import { noSelectStarRule, requireWhereRule } from 'query-gatekeeper';
```

## Writing a custom rule

```ts
import type { SqlValidationRule } from 'query-gatekeeper';

export const noDeleteRule: SqlValidationRule = {
  name: 'no-delete',
  validate(context) {
    const statements = context.statements ?? [];

    for (const statement of statements) {
      if (statement.type === 'delete') {
        return {
          code: 'DELETE_NOT_ALLOWED',
          message: 'DELETE statements are not allowed.',
          severity: 'error'
        };
      }
    }

    return [];
  }
};
```

## LangChain integration

```ts
import { createQueryGatekeeperTool } from 'query-gatekeeper';

const gatekeeper = createQueryGatekeeperTool({
  dialect: 'postgres',
  maxLimit: 100,
  allowedTables: ['users', 'orders']
});

const result = await gatekeeper({
  sql: 'SELECT id FROM users LIMIT 50'
});
```

## CLI

```bash
query-gatekeeper validate --sql "SELECT id FROM users LIMIT 10" --dialect postgres --format pretty
```

```bash
echo "SELECT * FROM users" | query-gatekeeper validate --format json
```

## Notes

- Parsing uses `pgsql-ast-parser`.
- This project is still in progress; expect changes.
