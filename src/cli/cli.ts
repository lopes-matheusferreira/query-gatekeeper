import { readFileSync } from 'node:fs';
import { ValidateQueryOptions } from '../domain';
import { validateQuery } from '../core/validateQuery';

type CliFormat = 'json' | 'pretty';

interface CliArgs {
  command: 'validate';
  sql?: string;
  dialect?: ValidateQueryOptions['dialect'];
  configPath?: string;
  format?: CliFormat;
}

interface CliConfigFile {
  dialect?: ValidateQueryOptions['dialect'];
  enabledRules?: string[];
  allowedTables?: string[];
  blockedTables?: string[];
  allowWriteOperations?: boolean;
  maxLimit?: number;
  maxJoins?: number;
  selectStarSeverity?: ValidateQueryOptions['selectStarSeverity'];
  enableExpensiveOperationsRule?: boolean;
}

const HELP_TEXT = `
query-gatekeeper validate [options]

Options:
  --sql "<query>"         SQL query to validate (or pass via stdin)
  --dialect <dialect>     postgres|mysql|sqlite|mssql|generic
  --config <path>         JSON config file with defaults
  --format <format>       json|pretty (default: pretty)
  --help                  Show this message
`;

export async function runCli(
  argv: string[]
): Promise<void> {
  const args = parseArgs(argv);
  if (!args || argv.includes('--help')) {
    print(HELP_TEXT.trim());
    return;
  }

  const sql = await resolveSql(args.sql);
  if (!sql) {
    printError('SQL not provided. Use --sql or stdin.');
    process.exit(1);
  }

  const config = args.configPath
    ? loadConfig(args.configPath)
    : {};

  const dialect =
    args.dialect ?? config.dialect ?? 'generic';
  if (!isValidDialect(dialect)) {
    printError(
      `Invalid dialect "${dialect}". Use postgres|mysql|sqlite|mssql|generic.`
    );
    process.exit(1);
  }

  const customRules = config.enableExpensiveOperationsRule
    ? [require('../rules/expensiveOperations').expensiveOperationsRule]
    : undefined;

  const options: ValidateQueryOptions = {
    sql,
    dialect,
    enabledRules: config.enabledRules ?? undefined,
    allowedTables:
      config.allowedTables ?? undefined,
    blockedTables:
      config.blockedTables ?? undefined,
    allowWriteOperations:
      config.allowWriteOperations ?? undefined,
    maxLimit: config.maxLimit ?? undefined,
    maxJoins: config.maxJoins ?? undefined,
    selectStarSeverity:
      config.selectStarSeverity ?? undefined,
    customRules
  };

  const result = validateQuery(options);
  const format: CliFormat = args.format ?? 'pretty';

  if (format === 'json') {
    print(JSON.stringify(result, null, 2));
    return;
  }

  print(renderPretty(result));
  process.exit(result.isValid ? 0 : 2);
}

function parseArgs(argv: string[]): CliArgs | null {
  const command = argv[2];
  if (command !== 'validate') {
    return null;
  }

  const args: CliArgs = { command: 'validate' };

  for (let i = 3; i < argv.length; i += 1) {
    const value = argv[i];
    switch (value) {
      case '--sql':
        args.sql = argv[i + 1];
        i += 1;
        break;
      case '--dialect':
        args.dialect = argv[
          i + 1
        ] as ValidateQueryOptions['dialect'];
        i += 1;
        break;
      case '--config':
        args.configPath = argv[i + 1];
        i += 1;
        break;
      case '--format':
        args.format = argv[i + 1] as CliFormat;
        i += 1;
        break;
      default:
        break;
    }
  }

  return args;
}

function loadConfig(path: string): CliConfigFile {
  try {
    const raw = readFileSync(path, 'utf-8');
    return JSON.parse(raw) as CliConfigFile;
  } catch {
    printError(`Unable to read config at ${path}.`);
    process.exit(1);
  }
}

async function resolveSql(
  inlineSql?: string
): Promise<string | null> {
  if (inlineSql && inlineSql.trim().length > 0) {
    return inlineSql;
  }

  if (process.stdin.isTTY) {
    return null;
  }

  const data = await readStdin();
  const trimmed = data.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function renderPretty(result: ReturnType<typeof validateQuery>) {
  const lines: string[] = [];
  lines.push(result.isValid ? 'VALID' : 'INVALID');
  lines.push(
    `Errors: ${result.errors.length} | Warnings: ${result.warnings.length}`
  );

  if (result.errors.length > 0) {
    lines.push('');
    lines.push('Errors:');
    for (const issue of result.errors) {
      lines.push(
        `- [${issue.rule}] ${issue.code}: ${issue.message}`
      );
      if (issue.suggestedFix) {
        lines.push(`  Fix: ${issue.suggestedFix}`);
      }
    }
  }

  if (result.warnings.length > 0) {
    lines.push('');
    lines.push('Warnings:');
    for (const issue of result.warnings) {
      lines.push(
        `- [${issue.rule}] ${issue.code}: ${issue.message}`
      );
      if (issue.suggestedFix) {
        lines.push(`  Suggestion: ${issue.suggestedFix}`);
      }
    }
  }

  return lines.join('\n');
}

function print(message: string) {
  process.stdout.write(`${message}\n`);
}

function printError(message: string) {
  process.stderr.write(`${message}\n`);
}

function isValidDialect(
  dialect: string
): dialect is ValidateQueryOptions['dialect'] {
  return [
    'postgres',
    'mysql',
    'sqlite',
    'mssql',
    'generic'
  ].includes(dialect);
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
    process.stdin.on('error', (error) => {
      reject(error);
    });
  });
}
