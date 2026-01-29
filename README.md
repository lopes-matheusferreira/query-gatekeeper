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

- `noSelectStarRule`: rejects `SELECT *`
- `requireWhereRule`: requires `WHERE` on `SELECT`
- `readOnlyRule`: blocks DML/DDL by default
- `singleStatementRule`: blocks multiple statements
- `tableAccessRule`: enforces allow/deny list
- `maxLimitRule`: enforces LIMIT and max
- `maxJoinsRule`: enforces JOIN count
- `riskyCrossJoinRule`: warns on CROSS JOIN without WHERE
- `riskyWhereTautologyRule`: warns on `WHERE 1=1`
- `sqlInjectionRule`: basic SQLi pattern detection

```ts
import { noSelectStarRule, requireWhereRule } from 'query-gatekeeper';
```

## Writing a custom rule

```ts
import type { SqlRule } from 'query-gatekeeper';

export const noDeleteRule: SqlRule = {
  name: 'no-delete',
  validate(ast: any) {
    const statements = Array.isArray(ast) ? ast : [ast];

    for (const statement of statements) {
      if (statement.type === 'delete') {
        return {
          code: 'DELETE_NOT_ALLOWED',
          message: 'DELETE statements are not allowed.',
          severity: 'error'
        };
      }
    }

    return null;
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
