// Simplified in-memory database
import { attractions, cafes, events, templateTours } from './data';
import type { Place, Event, TemplateTour, TourDay, UserTour } from './types';

// Re-export types
export type { Place, Event, TemplateTour, TourDay, UserTour };

const inMemoryDB = {
  attractions: [] as Place[],
  cafes: [] as Place[],
  events: [] as Event[],
  templateTours: [] as TemplateTour[],
  userTours: [] as UserTour[],
  favorites: new Map<string, Set<string>>(),
};

// Initialize with seed data
inMemoryDB.attractions = [...attractions];
inMemoryDB.cafes = [...cafes];
inMemoryDB.events = [...events];
inMemoryDB.templateTours = [...templateTours];

export const db = {
  attractions: {
    getAll: () => inMemoryDB.attractions,
    getById: (id: string) => inMemoryDB.attractions.find(p => p.id === id),
    getByWard: (ward: string) => inMemoryDB.attractions.filter(p => p.ward === ward),
  },
  cafes: {
    getAll: () => inMemoryDB.cafes,
    getById: (id: string) => inMemoryDB.cafes.find(p => p.id === id),
    getByWard: (ward: string) => inMemoryDB.cafes.filter(p => p.ward === ward),
  },
  events: {
    getAll: () => inMemoryDB.events,
    getById: (id: string) => inMemoryDB.events.find(e => e.id === id),
  },
  templateTours: {
    getAll: () => inMemoryDB.templateTours,
    getById: (id: string) => inMemoryDB.templateTours.find(t => t.id === id),
  },
  userTours: {
    getByUserId: (userId: string) => inMemoryDB.userTours.filter(t => t.userId === userId),
    getById: (id: string) => inMemoryDB.userTours.find(t => t.id === id),
    create: (tour: UserTour) => {
      inMemoryDB.userTours.push(tour);
      return tour;
    },
    delete: (id: string) => {
      const index = inMemoryDB.userTours.findIndex(t => t.id === id);
      if (index !== -1) {
        inMemoryDB.userTours.splice(index, 1);
        return true;
      }
      return false;
    },
  },
  favorites: {
    getByUserId: (userId: string) => Array.from(inMemoryDB.favorites.get(userId) || new Set()),
    toggle: (userId: string, placeId: string) => {
      if (!inMemoryDB.favorites.has(userId)) {
        inMemoryDB.favorites.set(userId, new Set());
      }
      const userFavs = inMemoryDB.favorites.get(userId)!;
      if (userFavs.has(placeId)) {
        userFavs.delete(placeId);
        return { isFavorite: false };
      } else {
        userFavs.add(placeId);
        return { isFavorite: true };
      }
    },
    isFavorite: (userId: string, placeId: string) => {
      return inMemoryDB.favorites.get(userId)?.has(placeId) || false;
    },
  },
};

// Export types
export type { Place, Event, TemplateTour, TourDay, UserTour };
