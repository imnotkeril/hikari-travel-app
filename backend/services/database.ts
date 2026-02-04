export interface Place {
  id: string;
  name: string;
  category: string;
  type: 'attraction' | 'restaurant' | 'cafe' | 'bar' | 'club';
  rating: number;
  reviewCount: number;
  ward: string;
  address: string;
  coordinates: { lat: number; lng: number };
  images: string[];
  description: string;
  openingHours?: string;
  admissionFee?: number;
  avgVisitDuration?: number;
  priceLevel?: number;
  cuisineTypes?: string[];
  features?: string[];
  nearestStation?: string;
}

export interface Event {
  id: string;
  name: string;
  type: string;
  ward: string;
  address: string;
  coordinates: { lat: number; lng: number };
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  image: string;
  description: string;
  admissionFee: number;
  website?: string;
  tips?: string[];
}

export interface TourPlace {
  placeId: string;
  plannedTime: string;
  visitDuration: number;
  transportMode: 'walk' | 'metro' | 'taxi' | 'bus';
  transportDuration: number;
  transportCost: number;
}

export interface TourDay {
  dayNumber: number;
  date: string;
  places: TourPlace[];
  totalCost: number;
  totalDuration: number;
  notes?: string;
}

export interface TemplateTour {
  id: string;
  title: string;
  days: number;
  places: number;
  estimatedCost: number;
  totalHours: number;
  description: string;
  highlights: string[];
  image: string;
  placeIds: string[];
  isTemplate: true;
}

export interface UserTour {
  id: string;
  userId: string;
  title: string;
  days: number;
  places: number;
  estimatedCost: number;
  totalHours: number;
  description: string;
  highlights: string[];
  image: string;
  detailedDays: TourDay[];
  isTemplate: false;
  createdAt: string;
}

export type Tour = TemplateTour | UserTour;

const inMemoryDB = {
  attractions: [] as Place[],
  cafes: [] as Place[],
  events: [] as Event[],
  templateTours: [] as TemplateTour[],
  userTours: [] as UserTour[],
  favorites: new Map<string, Set<string>>(),
};

export const db = {
  attractions: {
    getAll: () => inMemoryDB.attractions,
    getById: (id: string) => inMemoryDB.attractions.find(p => p.id === id),
    getByWard: (ward: string) => inMemoryDB.attractions.filter(p => p.ward === ward),
    seed: (data: Place[]) => { 
      inMemoryDB.attractions = data;
    },
  },
  cafes: {
    getAll: () => inMemoryDB.cafes,
    getById: (id: string) => inMemoryDB.cafes.find(p => p.id === id),
    getByWard: (ward: string) => inMemoryDB.cafes.filter(p => p.ward === ward),
    seed: (data: Place[]) => { inMemoryDB.cafes = data; },
  },
  events: {
    getAll: () => inMemoryDB.events,
    getById: (id: string) => inMemoryDB.events.find(e => e.id === id),
    seed: (data: Event[]) => { inMemoryDB.events = data; },
  },
  templateTours: {
    getAll: () => inMemoryDB.templateTours,
    getById: (id: string) => inMemoryDB.templateTours.find(t => t.id === id),
    seed: (data: TemplateTour[]) => { inMemoryDB.templateTours = data; },
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
