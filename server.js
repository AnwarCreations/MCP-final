import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { exec } from "child_process";
import { promisify } from "util";
import Groq from "groq-sdk";
import { z } from "zod";

const execAsync = promisify(exec);

// ── GROQ CLIENT ─────────────────────────────────────────
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const MODEL = "llama3-70b-8192";

// ── MCP SERVER ───────────────────────────────────────────
const server = new McpServer({
  name: "Anwar-MCP-Server",
  version: "2.0.0",
});

// ── TOOL: run_command ─────────────────────────────────────
server.tool(
  "run_command",
  "Run any shell command",
  { command: z.string() },
  async ({ command }) => {
    try {
      const { stdout, stderr } = await execAsync(command);
      return { content: [{ type: "text", text: stdout || stderr }] };
    } catch (e) {
      return { content: [{ type: "text", text: e.message }], isError: true };
    }
  }
);

// ── TOOL: ask_ai ──────────────────────────────────────────
server.tool(
  "ask_ai",
  "Ask Groq AI",
  { prompt: z.string() },
  async ({ prompt }) => {
    try {
      const res = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: "You are a Kali Linux expert." },
          { role: "user", content: prompt }
        ],
      });
      return { content: [{ type: "text", text: res.choices[0].message.content }] };
    } catch (e) {
      return { content: [{ type: "text", text: e.message }], isError: true };
    }
  }
);

// ── START SERVER ──────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("✅ Anwar MCP Server v2.0 running with Groq Llama 3...");