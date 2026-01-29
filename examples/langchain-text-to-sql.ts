/**
 * Example: Using Query Gatekeeper with LangChain for Text-to-SQL
 *
 * This example shows how to safely execute LLM-generated SQL queries
 * by validating them first with Query Gatekeeper.
 */

import { ChatOpenAI } from '@langchain/openai';
import { QueryGatekeeperTool } from '../src/integrations/langchain-tool';

async function textToSqlExample() {
  const llm = new ChatOpenAI({
    temperature: 0,
    modelName: 'gpt-4'
  });

  const gatekeeper = new QueryGatekeeperTool({
    dialect: 'postgres',
    allowedTables: ['users', 'orders', 'products'],
    maxLimit: 100,
    selectStarSeverity: 'error',
    allowWriteOperations: false
  });

  const userQuestion = 'Show me all users';
  const llmGeneratedSQL = 'SELECT * FROM users';

  console.log('User question:', userQuestion);
  console.log('LLM generated SQL:', llmGeneratedSQL);
  console.log('\nValidating with Query Gatekeeper...\n');

  const validationResult = await gatekeeper.invoke({
    sql: llmGeneratedSQL
  });

  console.log(validationResult);
}

async function agentWorkflowExample() {
  const llm = new ChatOpenAI({ temperature: 0 });

  const gatekeeper = new QueryGatekeeperTool({
    dialect: 'postgres',
    allowedTables: ['users', 'orders'],
    maxLimit: 50
  });

  let sql = 'SELECT * FROM users';

  console.log('Attempt 1:', sql);
  let result = await gatekeeper.invoke({ sql });
  console.log(result);
  console.log('\n---\n');

  sql = 'SELECT id, name, email FROM users LIMIT 20';

  console.log('Attempt 2:', sql);
  result = await gatekeeper.invoke({ sql });
  console.log(result);
}

console.log('=== Example 1: Basic Text-to-SQL ===\n');
textToSqlExample()
  .then(() => {
    console.log('\n\n=== Example 2: Agent Workflow ===\n');
    return agentWorkflowExample();
  })
  .catch(console.error);
