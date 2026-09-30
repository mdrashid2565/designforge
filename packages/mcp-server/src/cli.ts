#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMCPServerInstance } from './server.js';

async function runStdio() {
  const mcpServer = createMCPServerInstance();
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  console.error('[DesignForge MCP] Stdio server connected.');
}

runStdio().catch((err) => {
  console.error('[DesignForge MCP] Fatal error in stdio server:', err);
  process.exit(1);
});
