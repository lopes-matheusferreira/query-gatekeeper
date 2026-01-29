# Query Gatekeeper Examples

This directory contains examples showing how to use Query Gatekeeper in different scenarios.

## Examples

### `langchain-text-to-sql.ts`
Complete example of using Query Gatekeeper with LangChain for safe text-to-SQL generation.

Run:
```bash
npm install @langchain/openai @langchain/core
npx ts-node examples/langchain-text-to-sql.ts
```

### `custom-rules.ts`
Shows how to create and use custom validation rules for your specific use cases.

Run:
```bash
npx ts-node examples/custom-rules.ts
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. For LangChain examples, set your OpenAI API key:
```bash
export OPENAI_API_KEY=your-key-here
```

3. Run any example:
```bash
npx ts-node examples/example-name.ts
```
