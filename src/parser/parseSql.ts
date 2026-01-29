import { parse } from 'pgsql-ast-parser';

export function parseSql(query: string) {
  if (!query || query.trim().length === 0) {
    throw new Error('SQL query is empty');
  }

  try {
    const ast = parse(query);
    return ast;
  } catch (_error) {
    throw new Error('Invalid SQL syntax');
  }
}
