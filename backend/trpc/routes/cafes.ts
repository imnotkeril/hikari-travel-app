import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { db } from "../../services/database";
import { calculateDistanceFromUserLocation } from "../../services/distance-calculator";

export const cafesRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({
      userLocation: z.object({
        lat: z.number(),
        lng: z.number(),
      }).optional(),
      ward: z.string().optional(),
    }).optional())
    .query(({ input }) => {
      let cafes = db.cafes.getAll();
      
      if (input?.ward) {
        cafes = db.cafes.getByWard(input.ward);
      }
      
      if (input?.userLocation) {
        return cafes.map(cafe => {
          const distance = calculateDistanceFromUserLocation(
            input.userLocation!,
            cafe.coordinates
          );
          return {
            ...cafe,
            distanceFromUser: distance,
          };
        });
      }
      
      return cafes;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return db.cafes.getById(input.id);
    }),

  getByIds: publicProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .query(({ input }) => {
      return input.ids
        .map(id => db.cafes.getById(id))
        .filter((place): place is NonNullable<typeof place> => place !== undefined);
    }),
});
