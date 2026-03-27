import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import { MCPServer } from "@modelcontextprotocol/sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// GROQ client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// MCP Server Init
const mcpServer = new MCPServer({
  name: "Anwar MCP Server v2.0",
  version: "1.0.0",
});

// Example tool
mcpServer.tool("chat", {
  description: "Chat with Groq Llama 3",
  properties: {
    message: {
      type: "string",
      description: "User message",
    },
  },
  required: ["message"],
}, async ({ message }) => {
  const completion = await groq.chat.completions.create({
    model: "llama3-70b-8192",
    messages: [{ role: "user", content: message }],
  });

  return {
    reply: completion.choices[0].message.content,
  };
});

// MCP HTTP endpoint
app.post("/mcp", async (req, res) => {
  const { tool, args } = req.body;
  try {
    const result = await mcpServer.call(tool, args);
    res.json(result);
  } catch (err) {
    console.error("MCP Error:", err);
    res.status(500).json({ error: "Tool execution failed" });
  }
});

app.get("/", (req, res) => {
  res.send("Anwar MCP Server is running 🚀🔥");
});

// Render requires this PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});