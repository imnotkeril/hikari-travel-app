import { initTRPC } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { seedDatabase } from "../services/seed-data";

// Ensure database is initialized when context is created
let dbInitialized = false;
const ensureDatabaseInitialized = () => {
  if (!dbInitialized) {
    console.log('[tRPC Context] Initializing database...');
    seedDatabase();
    dbInitialized = true;
  }
};

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  console.log('[tRPC Context] Creating context for:', opts.req.url);
  ensureDatabaseInitialized();
  return {
    req: opts.req,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
