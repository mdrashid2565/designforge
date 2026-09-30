import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ToolSchemas } from './tools/definitions.js';
import { MCPToolHandlers } from './tools/handlers.js';
import { listMCPResources, readMCPResource } from './resources.js';
import { getMCPPrompt, listMCPPrompts } from './prompts.js';
import { globalStore } from './store.js';

export function createMCPServerInstance(): Server {
  const server = new Server(
    {
      name: 'designforge-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    }
  );

  // 1. List Tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools = Object.entries(ToolSchemas).map(([name, schema]) => {
      return {
        name,
        description: `DesignForge tool: ${name.replace(/_/g, ' ')}`,
        inputSchema: {
          type: 'object',
          properties: (schema as any)._def?.shape ? (schema as any)._def.shape() : {},
        },
      };
    });

    return { tools };
  });

  // 2. Call Tool
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const handler = (MCPToolHandlers as any)[name];

    if (!handler) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Tool '${name}' not recognized.` }],
      };
    }

    try {
      const result = await handler(args || {});
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Execution error in ${name}: ${err.message}` }],
      };
    }
  });

  // 3. Resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return { resources: listMCPResources() };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    return readMCPResource(request.params.uri);
  });

  // 4. Prompts
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return { prompts: listMCPPrompts() };
  });

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    return getMCPPrompt(request.params.name, (request.params.arguments as any) || {});
  });

  return server;
}

export function startMCPServer(port = 4000) {
  const app = express();
  app.use(cors({ origin: '*' }));
  app.use(express.json({ limit: '50mb' }));

  let sseTransport: SSEServerTransport | null = null;
  const mcpServer = createMCPServerInstance();

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'DesignForge MCP Server',
      timestamp: new Date().toISOString(),
      designsCount: globalStore.listDesigns().length,
    });
  });

  // SSE Transport endpoint
  app.get('/sse', async (req, res) => {
    sseTransport = new SSEServerTransport('/message', res);
    await mcpServer.connect(sseTransport);
  });

  app.post('/message', async (req, res) => {
    if (sseTransport) {
      await sseTransport.handlePostMessage(req, res);
    } else {
      res.status(400).json({ error: 'SSE session not established yet' });
    }
  });

  // REST API layer for direct HTTP tool invocation & design querying
  app.get('/api/designs', (req, res) => {
    res.json(globalStore.listDesigns());
  });

  app.get('/api/designs/:id', (req, res) => {
    const d = globalStore.getDesign(req.params.id);
    if (!d) return res.status(404).json({ error: 'Design not found' });
    res.json(d);
  });

  app.post('/api/tools/:toolName', async (req, res) => {
    const { toolName } = req.params;
    const handler = (MCPToolHandlers as any)[toolName];
    if (!handler) {
      return res.status(404).json({ error: `Tool ${toolName} not found` });
    }
    try {
      const result = await handler(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`[DesignForge MCP Server] Listening on http://0.0.0.0:${port}`);
    console.log(`[DesignForge MCP Server] SSE Endpoint: http://0.0.0.0:${port}/sse`);
  });

  return server;
}

// Auto-run if main module
if (process.argv[1]?.endsWith('server.js') || process.argv[1]?.endsWith('server.ts')) {
  const port = parseInt(process.env.MCP_PORT || '4000', 10);
  startMCPServer(port);
}
