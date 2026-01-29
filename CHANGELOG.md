# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-29

### Added
- Initial release of query-gatekeeper
- Core SQL validation engine using pgsql-ast-parser
- Built-in validation rules:
  - noSelectStarRule: Reject or warn on SELECT *
  - requireWhereRule: Require WHERE clause (optional)
  - readOnlyRule: Block write operations by default
  - singleStatementRule: Block multiple statements
  - tableAccessRule: Enforce table allow/deny lists
  - maxLimitRule: Enforce LIMIT and max value
  - maxJoinsRule: Limit JOIN count
  - riskyCrossJoinRule: Warn on CROSS JOIN without WHERE
  - riskyWhereTautologyRule: Warn on WHERE 1=1
  - sqlInjectionRule: Basic SQL injection detection
  - expensiveOperationsRule: Warn about slow operations
- LangChain integration via QueryGatekeeperTool
- CLI tool for command-line validation
- Custom rule API
- TypeScript support with full type definitions
- Support for multiple SQL dialects (postgres, mysql, sqlite, mssql, generic)
- Suggested fixes for all validation errors (LLM-friendly)

### Features
-  Security-first SQL validation
-  LLM-friendly error messages with suggested fixes
-  Configurable validation rules
-  Multiple SQL dialect support
-  CLI and programmatic API
-  LangChain integration
-  Custom rule system
-  Comprehensive test suite

[1.0.0]: https://github.com/lopes-matheusferreira/query-gatekeeper/releases/tag/v1.0.0