import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { db } from "../../services/database";

export const favoritesRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      const favoriteIds = db.favorites.getByUserId(input.userId);
      
      const allAttractions = db.attractions.getAll();
      const allCafes = db.cafes.getAll();
      const allPlaces = [...allAttractions, ...allCafes];
      
      return favoriteIds
        .map(id => allPlaces.find(p => p.id === id))
        .filter((place): place is NonNullable<typeof place> => place !== undefined);
    }),

  toggle: publicProcedure
    .input(z.object({
      userId: z.string(),
      placeId: z.string(),
    }))
    .mutation(({ input }) => {
      return db.favorites.toggle(input.userId, input.placeId);
    }),

  isFavorite: publicProcedure
    .input(z.object({
      userId: z.string(),
      placeId: z.string(),
    }))
    .query(({ input }) => {
      return db.favorites.isFavorite(input.userId, input.placeId);
    }),
});
