#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { FeishuBaseClient } from "./feishu.js";


const server = new Server(
  {
    name: "mcp-server-feishu",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

function parseArgs() {
  const args: Record<string, string> = {};
  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");
      args[key] = value;
    }
  });
  return args;
}
const args = parseArgs();
const apiUrl = args.api_url || process.env.API_URL || "";

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_note",
        description: "Create a new note",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Title of the note"
            },
            content: {
              type: "string",
              description: "Text content of the note"
            }
          },
          required: ["title", "content"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case"create_note": {
      if (!apiUrl) {
        throw new Error("API_URL not set");
      }

      const { title, content } = request.params.arguments as { title: string; content: string };

      if (!title && !content) {
        throw new Error("Content is required");
      }

      // const apiUrl = "https://ca9hovz8jf8.feishu.cn/base/automation/webhook/event/QtEtaLiVlwvjQHhNyAzcQ8lSnke";

      const feishuBase = new FeishuBaseClient({ apiUrl });
      const result = await feishuBase.createNote({ title, content });

      return {
        content: [
          {
            type: "text",
            text: `Write note to feishuBase success: ${JSON.stringify(result)}`,
          },
        ],
      };
    }

    default:
      throw new Error("Unknown tool");
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
