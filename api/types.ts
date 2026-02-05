// Type definitions for API
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
