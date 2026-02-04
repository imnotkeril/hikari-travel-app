import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { db, UserTour } from "../../services/database";
import { optimizeTour, calculateTourEstimates } from "../../services/tour-optimizer";

export const toursRouter = createTRPCRouter({
  getTemplateTours: publicProcedure.query(() => {
    return db.templateTours.getAll();
  }),

  getTemplateById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return db.templateTours.getById(input.id);
    }),

  getUserTours: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      return db.userTours.getByUserId(input.userId);
    }),

  getTourById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const userTour = db.userTours.getById(input.id);
      if (userTour) return userTour;
      
      const templateTour = db.templateTours.getById(input.id);
      return templateTour;
    }),

  generateTour: publicProcedure
    .input(z.object({
      userId: z.string(),
      title: z.string(),
      placeIds: z.array(z.string()),
      userLocation: z.object({
        lat: z.number(),
        lng: z.number(),
      }),
      startDate: z.string(),
    }))
    .mutation(({ input }) => {
      const allAttractions = db.attractions.getAll();
      const allCafes = db.cafes.getAll();
      const allPlaces = [...allAttractions, ...allCafes];
      
      const selectedPlaces = input.placeIds
        .map(id => allPlaces.find(p => p.id === id))
        .filter((place): place is NonNullable<typeof place> => place !== undefined);
      
      if (selectedPlaces.length === 0) {
        throw new Error('No valid places selected');
      }
      
      const tourDays = optimizeTour(
        selectedPlaces,
        input.userLocation,
        new Date(input.startDate)
      );
      
      const estimates = calculateTourEstimates(tourDays);
      
      const userTour: UserTour = {
        id: `user-${Date.now()}`,
        userId: input.userId,
        title: input.title,
        days: estimates.totalDays,
        places: estimates.totalPlaces,
        estimatedCost: estimates.totalCost,
        totalHours: estimates.totalHours,
        description: `Custom tour with ${estimates.totalPlaces} places over ${estimates.totalDays} days`,
        highlights: selectedPlaces.slice(0, 5).map(p => p.name),
        image: selectedPlaces[0]?.images[0] || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
        detailedDays: tourDays,
        isTemplate: false,
        createdAt: new Date().toISOString(),
      };
      
      return db.userTours.create(userTour);
    }),

  deleteTour: publicProcedure
    .input(z.object({ 
      id: z.string(),
      userId: z.string(),
    }))
    .mutation(({ input }) => {
      const tour = db.userTours.getById(input.id);
      if (!tour || tour.userId !== input.userId) {
        throw new Error('Tour not found or unauthorized');
      }
      
      return db.userTours.delete(input.id);
    }),

  expandTemplateTour: publicProcedure
    .input(z.object({
      templateId: z.string(),
      userLocation: z.object({
        lat: z.number(),
        lng: z.number(),
      }),
      startDate: z.string(),
    }))
    .query(({ input }) => {
      const template = db.templateTours.getById(input.templateId);
      if (!template) {
        throw new Error('Template tour not found');
      }
      
      const allAttractions = db.attractions.getAll();
      const allCafes = db.cafes.getAll();
      const allPlaces = [...allAttractions, ...allCafes];
      
      const selectedPlaces = template.placeIds
        .map(id => allPlaces.find(p => p.id === id))
        .filter((place): place is NonNullable<typeof place> => place !== undefined);
      
      const tourDays = optimizeTour(
        selectedPlaces,
        input.userLocation,
        new Date(input.startDate)
      );
      
      return {
        ...template,
        detailedDays: tourDays,
      };
    }),
});
