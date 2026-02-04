import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { db } from "../../services/database";
import { calculateDistanceFromUserLocation } from "../../services/distance-calculator";

export const attractionsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({
      userLocation: z.object({
        lat: z.number(),
        lng: z.number(),
      }).optional(),
      ward: z.string().optional(),
    }).optional())
    .query(({ input }) => {
      let attractions = db.attractions.getAll();
      
      // If no attractions, try to seed again (shouldn't happen, but just in case)
      if (attractions.length === 0) {
        const { seedDatabase } = require("../../services/seed-data");
        seedDatabase();
        attractions = db.attractions.getAll();
      }
      
      if (input?.ward) {
        attractions = db.attractions.getByWard(input.ward);
      }
      
      if (input?.userLocation) {
        return attractions.map(attraction => {
          const distance = calculateDistanceFromUserLocation(
            input.userLocation!,
            attraction.coordinates
          );
          return {
            ...attraction,
            distanceFromUser: distance,
          };
        });
      }
      
      return attractions;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return db.attractions.getById(input.id);
    }),

  getByIds: publicProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .query(({ input }) => {
      return input.ids
        .map(id => db.attractions.getById(id))
        .filter((place): place is NonNullable<typeof place> => place !== undefined);
    }),
});
