// API client for REST endpoints
import Constants from 'expo-constants';
import type { Place, Event, Tour } from '../api/types';

// Get base URL for API requests
export const getBaseUrl = () => {
  const isWeb = typeof window !== 'undefined';
  const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';
  const isWebDev = isWeb && isDev;
  
  if (isWebDev) {
    const backendPort = 3001;
    const url = `http://localhost:${backendPort}`;
    console.log('[API] Using local backend server (port 3001) for web dev');
    return url;
  }

  const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (apiUrl) {
    console.log('[API] Using API URL from env:', apiUrl);
    return apiUrl;
  }

  if (typeof window !== 'undefined' && window.location) {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    const url = port 
      ? `${protocol}//${hostname}:${port}`
      : `${protocol}//${hostname}`;
    console.log('[API] Using window.location:', url);
    return url;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const url = `http://${hostUri}`;
    console.log('[API] Using hostUri from Expo:', url);
    return url;
  }

  const debuggerHost = (Constants.expoConfig as any)?.debuggerHost;
  if (debuggerHost) {
    const url = `http://${debuggerHost}`;
    console.log('[API] Using debuggerHost from Expo:', url);
    return url;
  }

  if (__DEV__) {
    const url = "http://localhost:8081";
    console.log('[API] Using default localhost for native app:', url);
    return url;
  }

  const error = "Could not determine API base URL. Set EXPO_PUBLIC_API_BASE_URL in .env for production.";
  console.error('[API]', error);
  throw new Error(error);
};

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  if (__DEV__) {
    console.log('[API] Fetching:', url, options?.method || 'GET');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[API] Error:', response.status, errorText);
    throw new Error(`API error: ${response.status} ${errorText}`);
  }

  return response.json();
}

export interface AttractionWithDistance extends Place {
  distanceKm?: number;
}

export interface CafeWithDistance extends Place {
  distanceKm?: number;
}

export interface EventWithDistance extends Event {
  distanceKm?: number;
}

// Get all attractions
export async function getAttractions(userLocation?: { lat: number; lng: number }): Promise<AttractionWithDistance[]> {
  const params = userLocation 
    ? `?userLocation=${encodeURIComponent(JSON.stringify(userLocation))}`
    : '';
  return fetchAPI<AttractionWithDistance[]>(`/api/attractions${params}`);
}

// Get all cafes
export async function getCafes(userLocation?: { lat: number; lng: number }): Promise<CafeWithDistance[]> {
  const params = userLocation 
    ? `?userLocation=${encodeURIComponent(JSON.stringify(userLocation))}`
    : '';
  return fetchAPI<CafeWithDistance[]>(`/api/cafes${params}`);
}

// Get all events
export async function getEvents(): Promise<Event[]> {
  return fetchAPI<Event[]>(`/api/events`);
}

// Get all tours (template + user tours)
export async function getTours(userId?: string): Promise<Tour[]> {
  const params = userId ? `?userId=${userId}` : '';
  return fetchAPI<Tour[]>(`/api/tours${params}`);
}

// Get tour by ID
export async function getTourById(id: string): Promise<Tour> {
  return fetchAPI<Tour>(`/api/tours/${id}`);
}

// Get place by ID (searches in both attractions and cafes)
export async function getPlaceById(id: string): Promise<Place | null> {
  const attractions = await getAttractions();
  const cafes = await getCafes();
  return attractions.find(p => p.id === id) || cafes.find(p => p.id === id) || null;
}

// Get event by ID
export async function getEventById(id: string): Promise<Event | null> {
  const events = await getEvents();
  return events.find(e => e.id === id) || null;
}

// Create a new tour
export async function createTour(data: {
  userId: string;
  title: string;
  placeIds: string[];
  userLocation: { lat: number; lng: number };
  startDate: string;
}): Promise<Tour> {
  return fetchAPI<Tour>(`/api/tours`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Delete a tour
export async function deleteTour(id: string, userId: string): Promise<void> {
  // Note: Tour deletion is handled client-side via AsyncStorage
  // Server-side deletion can be added if needed
  console.log('[API] Tour deletion handled client-side');
}
