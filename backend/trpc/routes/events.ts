import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { db } from "../../services/database";

export const eventsRouter = createTRPCRouter({
  getAll: publicProcedure.query(() => {
    return db.events.getAll();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return db.events.getById(input.id);
    }),

  getUpcoming: publicProcedure.query(() => {
    const now = new Date();
    return db.events.getAll().filter(event => {
      const endDate = new Date(event.endDate);
      return endDate >= now;
    });
  }),
});
