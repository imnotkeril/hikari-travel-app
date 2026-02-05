import type { Place, TourDay, TourPlace } from '../types';
import { calculateDistance } from './distance-calculator';

interface PlaceWithCoords extends Place {
  coordinates: { lat: number; lng: number };
}

function groupByWards(places: PlaceWithCoords[]): Map<string, PlaceWithCoords[]> {
  const wardMap = new Map<string, PlaceWithCoords[]>();
  
  places.forEach(place => {
    const ward = place.ward;
    if (!wardMap.has(ward)) {
      wardMap.set(ward, []);
    }
    wardMap.get(ward)!.push(place);
  });
  
  return wardMap;
}

function optimizeWithinWard(places: PlaceWithCoords[], startLocation?: { lat: number; lng: number }): PlaceWithCoords[] {
  if (places.length <= 1) return places;
  
  const visited = new Set<string>();
  const result: PlaceWithCoords[] = [];
  
  let current = startLocation 
    ? places.reduce((closest, place) => {
        const distToCurrent = calculateDistance(startLocation, place.coordinates).distance;
        const distToClosest = calculateDistance(startLocation, closest.coordinates).distance;
        return distToCurrent < distToClosest ? place : closest;
      })
    : places[0];
  
  visited.add(current.id);
  result.push(current);
  
  while (visited.size < places.length) {
    let nearest: PlaceWithCoords | null = null;
    let minDistance = Infinity;
    
    for (const place of places) {
      if (!visited.has(place.id)) {
        const dist = calculateDistance(current.coordinates, place.coordinates).distance;
        if (dist < minDistance) {
          minDistance = dist;
          nearest = place;
        }
      }
    }
    
    if (nearest) {
      visited.add(nearest.id);
      result.push(nearest);
      current = nearest;
    } else {
      break;
    }
  }
  
  return result;
}

function distributeIntoDays(
  wardGroups: Map<string, PlaceWithCoords[]>,
  maxHoursPerDay: number = 8
): PlaceWithCoords[][] {
  const days: PlaceWithCoords[][] = [];
  const wards = Array.from(wardGroups.entries());
  
  wards.sort((a, b) => {
    const totalTimeA = a[1].reduce((sum, p) => sum + (p.avgVisitDuration || 60), 0);
    const totalTimeB = b[1].reduce((sum, p) => sum + (p.avgVisitDuration || 60), 0);
    return totalTimeB - totalTimeA;
  });
  
  for (const [, places] of wards) {
    const wardTime = places.reduce((sum, p) => sum + (p.avgVisitDuration || 60), 0);
    
    if (days.length === 0 || days[days.length - 1].reduce((sum, p) => sum + (p.avgVisitDuration || 60), 0) + wardTime > maxHoursPerDay * 60) {
      days.push([...places]);
    } else {
      days[days.length - 1].push(...places);
    }
  }
  
  return days;
}

export function optimizeTour(
  places: PlaceWithCoords[],
  userLocation: { lat: number; lng: number },
  startDate: Date
): TourDay[] {
  if (places.length === 0) return [];
  
  const wardGroups = groupByWards(places);
  
  const dayGroups = distributeIntoDays(wardGroups);
  
  const tourDays: TourDay[] = dayGroups.map((dayPlaces, dayIndex) => {
    const optimizedPlaces = optimizeWithinWard(dayPlaces, dayIndex === 0 ? userLocation : undefined);
    
    let currentTime = 9 * 60;
    const tourPlaces: TourPlace[] = [];
    let totalCost = 0;
    
    optimizedPlaces.forEach((place, index) => {
      const prevLocation = index === 0 
        ? (dayIndex === 0 ? userLocation : optimizedPlaces[0].coordinates)
        : optimizedPlaces[index - 1].coordinates;
      
      const transport = calculateDistance(prevLocation, place.coordinates);
      
      currentTime += transport.duration;
      
      const hours = Math.floor(currentTime / 60);
      const minutes = currentTime % 60;
      const plannedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      totalCost += transport.cost + (place.admissionFee || 0);
      
      tourPlaces.push({
        placeId: place.id,
        plannedTime,
        visitDuration: place.avgVisitDuration || 60,
        transportMode: transport.mode,
        transportDuration: transport.duration,
        transportCost: transport.cost,
      });
      
      currentTime += place.avgVisitDuration || 60;
      
      if (index < optimizedPlaces.length - 1 && currentTime > 13 * 60 && currentTime < 14 * 60) {
        currentTime = 14 * 60;
      }
    });
    
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + dayIndex);
    
    return {
      dayNumber: dayIndex + 1,
      date: dayDate.toISOString().split('T')[0],
      places: tourPlaces,
      totalCost,
      totalDuration: currentTime - (9 * 60),
      notes: `Day ${dayIndex + 1}: ${Array.from(new Set(optimizedPlaces.map(p => p.ward))).join(', ')}`,
    };
  });
  
  return tourDays;
}

export function calculateTourEstimates(tourDays: TourDay[]): {
  totalCost: number;
  totalHours: number;
  totalPlaces: number;
  totalDays: number;
} {
  const totalCost = tourDays.reduce((sum, day) => sum + day.totalCost, 0);
  const totalHours = Math.round(tourDays.reduce((sum, day) => sum + day.totalDuration, 0) / 60);
  const totalPlaces = tourDays.reduce((sum, day) => sum + day.places.length, 0);
  
  return {
    totalCost,
    totalHours,
    totalPlaces,
    totalDays: tourDays.length,
  };
}
