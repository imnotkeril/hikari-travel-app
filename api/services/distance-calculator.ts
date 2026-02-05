interface Coordinates {
  lat: number;
  lng: number;
}

interface DistanceResult {
  distance: number;
  duration: number;
  mode: 'walk' | 'metro' | 'taxi' | 'bus';
  cost: number;
}

function haversineDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371;
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function estimateTransportMode(distanceKm: number): 'walk' | 'metro' | 'taxi' | 'bus' {
  if (distanceKm < 0.8) return 'walk';
  if (distanceKm < 15) return 'metro';
  if (distanceKm < 30) return 'bus';
  return 'taxi';
}

function calculateTravelTime(distanceKm: number, mode: string): number {
  switch (mode) {
    case 'walk':
      return Math.ceil((distanceKm / 5) * 60);
    case 'metro':
      return Math.ceil(distanceKm * 3 + 10);
    case 'bus':
      return Math.ceil(distanceKm * 4 + 15);
    case 'taxi':
      return Math.ceil(distanceKm * 2.5);
    default:
      return Math.ceil(distanceKm * 3);
  }
}

function calculateTransportCost(distanceKm: number, mode: string): number {
  switch (mode) {
    case 'walk':
      return 0;
    case 'metro':
      if (distanceKm < 3) return 170;
      if (distanceKm < 7) return 200;
      if (distanceKm < 12) return 240;
      return 280;
    case 'bus':
      return Math.ceil(distanceKm * 50);
    case 'taxi':
      return Math.ceil(distanceKm * 400);
    default:
      return 200;
  }
}

export function calculateDistance(
  from: Coordinates,
  to: Coordinates
): DistanceResult {
  const distance = haversineDistance(from, to);
  const mode = estimateTransportMode(distance);
  const duration = calculateTravelTime(distance, mode);
  const cost = calculateTransportCost(distance, mode);

  return {
    distance: Math.round(distance * 100) / 100,
    duration,
    mode,
    cost,
  };
}

export function calculateDistanceFromUserLocation(
  userLocation: Coordinates,
  placeLocation: Coordinates
): DistanceResult {
  return calculateDistance(userLocation, placeLocation);
}
