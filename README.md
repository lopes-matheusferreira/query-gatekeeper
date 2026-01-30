# query-gatekeeper

[![npm version](https://badge.fury.io/js/query-gatekeeper.svg)](https://www.npmjs.com/package/query-gatekeeper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/query-gatekeeper.svg)](https://www.npmjs.com/package/query-gatekeeper)

SQL validation utilities built on top of `pgsql-ast-parser` for safe LLM-generated queries.

## Features

✅ **Security First**: Block SQL injection, unauthorized table access, and dangerous operations  
✅ **LLM-Friendly**: Provides suggested fixes for invalid queries to help LLMs self-correct  
✅ **LangChain Integration**: Official LangChain tool for text-to-SQL workflows  
✅ **Configurable Rules**: Customize validation with allow/deny lists, limits, and custom rules  
✅ **Multiple Dialects**: Support for PostgreSQL, MySQL, SQLite, MSSQL, and generic SQL  

## Install

```bash
npm install query-gatekeeper
```

## Quick Start

```ts
import { validateQuery } from 'query-gatekeeper';

const result = validateQuery({
  sql: 'SELECT id, name FROM users WHERE id = 1 LIMIT 10',
  dialect: 'postgres',
  maxLimit: 50,
  allowedTables: ['users']
});

console.log(result);
// {
//   isValid: true,
//   errors: [],
//   warnings: [],
//   normalizedSql: 'SELECT id, name FROM users WHERE id = 1 LIMIT 10'
// }
```

## Como usar (CLI)

Você pode executar o validador via CLI apontando para um arquivo de configuração.

Exemplo de `config.json`:
```json
{
  "dialect": "postgres",
  "enabledRules": [
    "single-statement",
    "read-only",
    "table-access",
    "max-limit",
    "max-joins",
    "no-select-star",
    "cross-join-without-where",
    "where-tautology",
    "sql-injection-patterns",
    "expensive-operations"
  ],
  "allowedTables": ["users", "orders"],
  "blockedTables": ["secrets"],
  "allowWriteOperations": false,
  "maxLimit": 50,
  "maxJoins": 1,
  "selectStarSeverity": "error",
  "enableExpensiveOperationsRule": true
}
```

Executar:
```
node dist/cli/index.js validate --sql "SELECT id FROM users LIMIT 10" --config config.json --format pretty
```

Observações:
- `dialect` aceita apenas: `postgres`, `mysql`, `sqlite`, `mssql`, `generic`.
- `enabledRules` define exatamente quais regras serão aplicadas.
- `enableExpensiveOperationsRule` ativa a regra opcional `expensive-operations`.

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
// ✅ VALIDATION PASSED
// Query is safe to execute.
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

**Options:**
- `sql` (string): The SQL query to validate
- `dialect` (string): 'postgres' | 'mysql' | 'sqlite' | 'mssql' | 'generic'
- `enabledRules` (string[]): Lista de nomes de regras a executar
- `allowedTables` (string[]): Whitelist of allowed tables
- `blockedTables` (string[]): Blacklist of blocked tables
- `allowWriteOperations` (boolean): Allow INSERT/UPDATE/DELETE (default: false)
- `maxLimit` (number): Maximum LIMIT value and require LIMIT clause
- `maxJoins` (number): Maximum number of JOIN clauses
- `selectStarSeverity` ('error' | 'warning'): Severity for SELECT * (default: 'warning')
- `customRules` (SqlValidationRule[]): Additional validation rules

**Returns:**
- `isValid` (boolean): Whether the query passed all validations
- `errors` (ValidationIssue[]): Array of error-level issues
- `warnings` (ValidationIssue[]): Array of warning-level issues
- `normalizedSql` (string): Normalized query string

```ts
import { validateQuery } from 'query-gatekeeper';

const result = validateQuery({
  sql: 'SELECT id FROM users WHERE id = 1',
  dialect: 'postgres',
  allowedTables: ['users'],
  maxLimit: 100
});
```

### parseSql(query)

Parses SQL into an AST (throws on invalid SQL or empty input).

```ts
import { parseSql } from 'query-gatekeeper';

const ast = parseSql('SELECT id FROM users WHERE id = 1');
```

### Built-in Validation Rules

All rules include `suggestedFix` to help LLMs correct invalid queries:

- **noSelectStarRule**: Rejects or warns on `SELECT *` (configurable severity)
- **requireWhereRule**: Requires `WHERE` clause on `SELECT` statements (optional)
- **readOnlyRule**: Blocks DML/DDL operations by default
- **singleStatementRule**: Blocks multiple statements in one query
- **tableAccessRule**: Enforces allow/deny lists for table access
- **maxLimitRule**: Enforces LIMIT clause and maximum value
- **maxJoinsRule**: Enforces maximum JOIN count
- **riskyCrossJoinRule**: Warns on CROSS JOIN without WHERE clause
- **riskyWhereTautologyRule**: Warns on WHERE 1=1 and similar tautologies
- **sqlInjectionRule**: Basic SQL injection pattern detection
- **expensiveOperationsRule**: Warns about potentially slow operations (optional)

```ts
import { noSelectStarRule, requireWhereRule } from 'query-gatekeeper';
```

### Como cada regra funciona

- `single-statement`: rejeita múltiplos comandos na mesma string (`;`).
- `read-only`: bloqueia DML/DDL quando `allowWriteOperations` é `false`.
- `table-access`: permite apenas `allowedTables` e bloqueia `blockedTables`.
- `max-limit`: exige `LIMIT` e verifica se não ultrapassa `maxLimit`.
- `max-joins`: rejeita quando o número de JOINs excede `maxJoins`.
- `no-select-star`: gera warning/erro para `SELECT *` (configurável).
- `cross-join-without-where`: warning para `CROSS JOIN` sem `WHERE`.
- `where-tautology`: warning para `WHERE 1=1`.
- `sql-injection-patterns`: bloqueia padrões simples de SQLi (`OR 1=1`, comentários, query empilhada).
- `expensive-operations`: warning para LIKE com `%` inicial, muitos ORs, e funções no WHERE.

## Writing Custom Rules

```ts
import type { SqlValidationRule } from 'query-gatekeeper';

export const noDeleteRule: SqlValidationRule = {
  name: 'no-delete',
  description: 'Prevent DELETE statements',
  
  validate(context) {
    const statements = context.statements ?? [];

    for (const statement of statements) {
      if (statement.type === 'delete') {
        return [{
          code: 'DELETE_NOT_ALLOWED',
          message: 'DELETE statements are not allowed.',
          severity: 'error',
          rule: this.name,
          suggestedFix: 'Use SELECT queries only. DELETE operations are not permitted.'
        }];
      }
    }

    return [];
  }
};

// Use it
const result = validateQuery({
  sql: 'DELETE FROM users',
  dialect: 'postgres',
  customRules: [noDeleteRule]
});
```

## CLI

```bash
# Validate SQL from command line
query-gatekeeper validate --sql "SELECT id FROM users LIMIT 10" --dialect postgres --format pretty

# Or pipe from stdin
echo "SELECT * FROM users" | query-gatekeeper validate --format json

# Use a config file
query-gatekeeper validate --sql "SELECT * FROM users" --config ./gatekeeper.json
```

**Config file example** (`gatekeeper.json`):
```json
{
  "dialect": "postgres",
  "allowedTables": ["users", "orders"],
  "maxLimit": 100,
  "selectStarSeverity": "error"
}
```

## Examples

Check the `examples/` directory for more usage patterns:

- **langchain-text-to-sql.ts**: Complete LangChain integration example
- **custom-rules.ts**: How to create custom validation rules

## Use Cases

- 🤖 **LLM Text-to-SQL Applications**: Validate AI-generated queries before execution
- 🔒 **API Query Endpoints**: Protect your database from malicious queries
- 📊 **BI Tools**: Enforce security policies on user-generated reports
- 🧪 **Testing**: Validate SQL in your test suites
- 📚 **Learning**: Teach SQL best practices with actionable feedback

## Notes

- Parsing uses `pgsql-ast-parser` for PostgreSQL-compatible syntax
- This project is actively maintained; expect regular updates
- Contributions welcome! See [GitHub repository](https://github.com/lopes-matheusferreira/query-gatekeeper)

## License

MIT © Matheus Lopes Ferreira

## Links

- [GitHub Repository](https://github.com/lopes-matheusferreira/query-gatekeeper)
- [NPM Package](https://www.npmjs.com/package/query-gatekeeper)
- [Issue Tracker](https://github.com/lopes-matheusferreira/query-gatekeeper/issues)
