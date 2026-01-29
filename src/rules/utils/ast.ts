type AnyStatement = any;

export function collectSelectStatements(
  statement: AnyStatement
): AnyStatement[] {
  const results: AnyStatement[] = [];
  collectSelectStatementsInto(statement, results);
  return results;
}

function collectSelectStatementsInto(
  statement: AnyStatement,
  results: AnyStatement[]
) {
  if (!statement || typeof statement !== 'object') return;

  switch (statement.type) {
    case 'select':
      results.push(statement);
      return;
    case 'union':
    case 'union all':
      collectSelectStatementsInto(statement.left, results);
      collectSelectStatementsInto(statement.right, results);
      return;
    case 'with':
      if (Array.isArray(statement.bind)) {
        for (const bind of statement.bind) {
          collectSelectStatementsInto(bind.statement, results);
        }
      }
      collectSelectStatementsInto(statement.in, results);
      return;
    case 'with recursive':
      collectSelectStatementsInto(statement.bind, results);
      collectSelectStatementsInto(statement.in, results);
      return;
    default:
      return;
  }
}

export function collectCteNames(statement: AnyStatement): Set<string> {
  const names = new Set<string>();
  collectCteNamesInto(statement, names);
  return names;
}

function collectCteNamesInto(
  statement: AnyStatement,
  names: Set<string>
) {
  if (!statement || typeof statement !== 'object') return;

  if (statement.type === 'with' && Array.isArray(statement.bind)) {
    for (const bind of statement.bind) {
      if (bind?.alias?.name) {
        names.add(normalizeIdentifier(bind.alias.name));
      }
      collectCteNamesInto(bind.statement, names);
    }
    collectCteNamesInto(statement.in, names);
  }

  if (statement.type === 'with recursive') {
    if (statement.alias?.name) {
      names.add(normalizeIdentifier(statement.alias.name));
    }
    collectCteNamesInto(statement.bind, names);
    collectCteNamesInto(statement.in, names);
  }
}

export function collectTableNames(
  statement: AnyStatement
): Set<string> {
  const names = new Set<string>();
  const cteNames = collectCteNames(statement);
  collectTableNamesInto(statement, names, cteNames);
  return names;
}

function collectTableNamesInto(
  statement: AnyStatement,
  names: Set<string>,
  cteNames: Set<string>
) {
  if (!statement || typeof statement !== 'object') return;

  switch (statement.type) {
    case 'select': {
      const from = Array.isArray(statement.from)
        ? statement.from
        : [];
      for (const item of from) {
        collectTableFromItem(item, names, cteNames);
      }
      return;
    }
    case 'insert':
      addQName(statement.into, names, cteNames);
      collectTableNamesInto(statement.insert, names, cteNames);
      return;
    case 'update':
      addQName(statement.table, names, cteNames);
      if (statement.from) {
        collectTableFromItem(statement.from, names, cteNames);
      }
      return;
    case 'delete':
      addQName(statement.from, names, cteNames);
      return;
    case 'with':
    case 'with recursive':
    case 'union':
    case 'union all':
      for (const select of collectSelectStatements(statement)) {
        collectTableNamesInto(select, names, cteNames);
      }
      return;
    default:
      return;
  }
}

function collectTableFromItem(
  item: AnyStatement,
  names: Set<string>,
  cteNames: Set<string>
) {
  if (!item || typeof item !== 'object') return;
  if (item.type === 'table') {
    addQName(item.name, names, cteNames);
  }
  if (item.type === 'statement') {
    collectTableNamesInto(item.statement, names, cteNames);
  }
}

function addQName(
  qname: AnyStatement,
  names: Set<string>,
  cteNames: Set<string>
) {
  const name = qname?.name;
  if (!name || typeof name !== 'string') return;

  const normalized = normalizeIdentifier(name);
  if (cteNames.has(normalized)) return;

  if (qname?.schema && typeof qname.schema === 'string') {
    names.add(
      `${normalizeIdentifier(qname.schema)}.${normalized}`
    );
  } else {
    names.add(normalized);
  }
}

export function countJoins(statement: AnyStatement): number {
  let count = 0;

  for (const select of collectSelectStatements(statement)) {
    const from = Array.isArray(select.from)
      ? select.from
      : [];
    for (const item of from) {
      if (item?.join) {
        count += 1;
      }
    }
  }

  return count;
}

export function hasSelectStar(statement: AnyStatement): boolean {
  for (const select of collectSelectStatements(statement)) {
    const columns = Array.isArray(select.columns)
      ? select.columns
      : [];
    for (const column of columns) {
      if (
        column?.expr?.type === 'ref' &&
        column.expr.name === '*'
      ) {
        return true;
      }
    }
  }

  return false;
}

export function getLimitInfo(statement: AnyStatement): {
  hasLimit: boolean;
  limitValue?: number;
} {
  for (const select of collectSelectStatements(statement)) {
    if (!select?.limit) {
      continue;
    }
    const limitExpr = select.limit.limit;
    if (!limitExpr) {
      return { hasLimit: true };
    }
    if (
      limitExpr.type === 'integer' ||
      limitExpr.type === 'numeric'
    ) {
      return {
        hasLimit: true,
        limitValue: Number(limitExpr.value)
      };
    }
    return { hasLimit: true };
  }

  return { hasLimit: false };
}

export function hasCrossJoinWithoutWhere(
  statement: AnyStatement
): boolean {
  for (const select of collectSelectStatements(statement)) {
    const from = Array.isArray(select.from)
      ? select.from
      : [];
    for (const item of from) {
      if (item?.join?.type === 'CROSS JOIN') {
        if (!select.where) {
          return true;
        }
      }
    }
  }
  return false;
}

export function isWhereTautology(statement: AnyStatement): boolean {
  for (const select of collectSelectStatements(statement)) {
    if (select.where && isAlwaysTrue(select.where)) {
      return true;
    }
  }
  return false;
}

function isAlwaysTrue(expr: AnyStatement): boolean {
  if (!expr || typeof expr !== 'object') return false;
  if (expr.type === 'boolean' && expr.value === true) {
    return true;
  }
  if (expr.type === 'binary' && expr.op === '=') {
    return (
      isConstantOne(expr.left) && isConstantOne(expr.right)
    );
  }
  if (expr.type === 'binary' && expr.op === 'AND') {
    return (
      isAlwaysTrue(expr.left) && isAlwaysTrue(expr.right)
    );
  }
  return false;
}

function isConstantOne(expr: AnyStatement): boolean {
  if (!expr || typeof expr !== 'object') return false;
  if (
    (expr.type === 'integer' || expr.type === 'numeric') &&
    Number(expr.value) === 1
  ) {
    return true;
  }
  return false;
}

function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeTableList(
  tables?: string[]
): string[] {
  if (!tables) return [];
  return tables
    .map((value) => normalizeIdentifier(value))
    .filter((value) => value.length > 0);
}

export function isTableAllowed(
  table: string,
  allowed: string[]
): boolean {
  const normalized = normalizeIdentifier(table);
  const base =
    normalized.includes('.')
      ? normalized.split('.').pop() ?? normalized
      : normalized;

  return (
    allowed.includes(normalized) || allowed.includes(base)
  );
}
