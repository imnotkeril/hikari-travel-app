import { createTRPCRouter } from "./create-context";
import { attractionsRouter } from "./routes/attractions";
import { cafesRouter } from "./routes/cafes";
import { eventsRouter } from "./routes/events";
import { toursRouter } from "./routes/tours";
import { favoritesRouter } from "./routes/favorites";

export const appRouter = createTRPCRouter({
  attractions: attractionsRouter,
  cafes: cafesRouter,
  events: eventsRouter,
  tours: toursRouter,
  favorites: favoritesRouter,
});

export type AppRouter = typeof appRouter;
