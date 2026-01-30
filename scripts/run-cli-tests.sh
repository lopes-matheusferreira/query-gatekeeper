#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLI="node ${ROOT_DIR}/dist/cli/index.js"
CONFIG="${ROOT_DIR}/config.json"

echo "Using config: ${CONFIG}"
echo

run() {
  local label="$1"
  local sql="$2"
  echo "==> ${label}"
  ${CLI} validate --sql "${sql}" --config "${CONFIG}" --format pretty
  echo
}

run "Valid query" "SELECT id FROM users WHERE id = 1 LIMIT 10"
run "SELECT * (noSelectStarRule)" "SELECT * FROM users LIMIT 10"
run "Missing LIMIT (maxLimitRule)" "SELECT id FROM users"
run "LIMIT exceeds max (maxLimitRule)" "SELECT id FROM users LIMIT 500"
run "Table not allowed (tableAccessRule)" "SELECT id FROM products LIMIT 10"
run "Blocked table (tableAccessRule)" "SELECT id FROM secrets LIMIT 10"
run "Write operation blocked (readOnlyRule)" "DELETE FROM users"
run "Multiple statements (singleStatementRule)" "SELECT id FROM users; SELECT id FROM orders"
run "Too many joins (maxJoinsRule)" "SELECT * FROM users u JOIN orders o ON o.user_id = u.id JOIN items i ON i.order_id = o.id"
run "CROSS JOIN without WHERE (riskyCrossJoinRule)" "SELECT * FROM users CROSS JOIN orders"
run "WHERE 1=1 (riskyWhereTautologyRule)" "SELECT id FROM users WHERE 1=1 LIMIT 10"
run "SQL injection pattern (sqlInjectionRule)" "SELECT * FROM users WHERE name = 'a' OR 1=1"

echo "Done."
