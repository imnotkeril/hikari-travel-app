import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { seedDatabase } from "./services/seed-data";

const app = new Hono();

// Initialize database on first request (lazy initialization)
let dbInitialized = false;
const ensureDatabaseInitialized = () => {
  if (!dbInitialized) {
    seedDatabase();
    dbInitialized = true;
  }
};

// Middleware to ensure database is initialized
app.use("*", async (c, next) => {
  ensureDatabaseInitialized();
  return next();
});

app.use("*", cors());

// In Expo Router, +api.ts handles /api/*, so Hono receives paths without /api prefix
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

// Test endpoint to check database (accessible at /api/test-db)
app.get("/test-db", (c) => {
  const { db } = require("./services/database");
  const attractions = db.attractions.getAll();
  const cafes = db.cafes.getAll();
  const events = db.events.getAll();
  const tours = db.templateTours.getAll();
  
  return c.json({
    status: "ok",
    database: {
      attractions: attractions.length,
      cafes: cafes.length,
      events: events.length,
      tours: tours.length,
      sampleAttraction: attractions[0] || null,
    },
  });
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

  return result.toTextStreamResponse();
});

export default app;
