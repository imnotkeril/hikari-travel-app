import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { seedDatabase } from "./services/seed-data";

seedDatabase();

const app = new Hono();

app.use("*", cors());

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  }),
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "Tokyo Guide API is running" });
});

app.post("/api/chat", async (c) => {
  const { messages, tools } = await c.req.json();
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return c.json({ error: "OpenAI API key not configured" }, 500);
  }

  const toolsConfig: any = {};
  if (tools) {
    Object.entries(tools).forEach(([name, tool]: [string, any]) => {
      toolsConfig[name] = {
        description: tool.description,
        parameters: tool.parameters,
      };
    });
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages,
    tools: toolsConfig,
  });

  return result.toDataStreamResponse();
});

export default app;
