#!/usr/bin/env node
import { runCli } from './cli';

runCli(process.argv).catch((error) => {
  process.stderr.write(
    `Unexpected error: ${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exit(1);
});
