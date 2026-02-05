// Simple Bun REST API server
import { serve } from 'bun';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from './db';
import { optimizeTour, calculateTourEstimates } from './services/tour-optimizer';
import { calculateDistance } from './services/distance-calculator';
import type { UserTour } from './types';

const port = 3001;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function handleCORS(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  return null;
}

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle CORS
  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;

  try {
    // Health check
    if (path === '/health' || path === '/api/health') {
      return jsonResponse({
        status: 'ok',
        timestamp: new Date().toISOString(),
        data: {
          attractions: db.attractions.getAll().length,
          cafes: db.cafes.getAll().length,
          events: db.events.getAll().length,
          tours: db.templateTours.getAll().length,
        },
      });
    }

    // GET /api/attractions
    if (path === '/api/attractions' && request.method === 'GET') {
      const attractions = db.attractions.getAll();
      const userLocation = url.searchParams.get('userLocation');
      
      if (userLocation) {
        try {
          const location = JSON.parse(userLocation);
          const attractionsWithDistance = attractions.map(place => {
            const distanceInfo = calculateDistance(location, place.coordinates);
            return {
              ...place,
              distanceKm: distanceInfo.distance,
            };
          });
          return jsonResponse(attractionsWithDistance);
        } catch (e) {
          // Invalid location, return without distance
        }
      }
      
      return jsonResponse(attractions);
    }

    // GET /api/cafes
    if (path === '/api/cafes' && request.method === 'GET') {
      const cafes = db.cafes.getAll();
      const userLocation = url.searchParams.get('userLocation');
      
      if (userLocation) {
        try {
          const location = JSON.parse(userLocation);
          const cafesWithDistance = cafes.map(place => {
            const distanceInfo = calculateDistance(location, place.coordinates);
            return {
              ...place,
              distanceKm: distanceInfo.distance,
            };
          });
          return jsonResponse(cafesWithDistance);
        } catch (e) {
          // Invalid location, return without distance
        }
      }
      
      return jsonResponse(cafes);
    }

    // GET /api/events
    if (path === '/api/events' && request.method === 'GET') {
      return jsonResponse(db.events.getAll());
    }

    // GET /api/tours
    if (path === '/api/tours' && request.method === 'GET') {
      const userId = url.searchParams.get('userId');
      
      if (userId) {
        // Get user tours
        const userTours = db.userTours.getByUserId(userId);
        const templateTours = db.templateTours.getAll();
        return jsonResponse([...templateTours, ...userTours]);
      }
      
      // Get template tours only
      return jsonResponse(db.templateTours.getAll());
    }

    // GET /api/tours/:id
    if (path.startsWith('/api/tours/') && request.method === 'GET') {
      const id = path.split('/api/tours/')[1];
      const userTour = db.userTours.getById(id);
      if (userTour) {
        return jsonResponse(userTour);
      }
      
      const templateTour = db.templateTours.getById(id);
      if (templateTour) {
        return jsonResponse(templateTour);
      }
      
      return errorResponse('Tour not found', 404);
    }

    // POST /api/tours
    if (path === '/api/tours' && request.method === 'POST') {
      const body = await request.json() as {
        userId: string;
        title: string;
        placeIds: string[];
        userLocation: { lat: number; lng: number };
        startDate: string;
      };

      const allAttractions = db.attractions.getAll();
      const allCafes = db.cafes.getAll();
      const allPlaces = [...allAttractions, ...allCafes];

      const selectedPlaces = body.placeIds
        .map(id => allPlaces.find(p => p.id === id))
        .filter((place): place is NonNullable<typeof place> => place !== undefined);

      if (selectedPlaces.length === 0) {
        return errorResponse('No valid places selected', 400);
      }

      const tourDays = optimizeTour(
        selectedPlaces,
        body.userLocation,
        new Date(body.startDate)
      );

      const estimates = calculateTourEstimates(tourDays);

      const userTour: UserTour = {
        id: `user-${Date.now()}`,
        userId: body.userId,
        title: body.title,
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

      const created = db.userTours.create(userTour);
      return jsonResponse(created, 201);
    }

    // POST /api/chat
    if (path === '/api/chat' && request.method === 'POST') {
      const { messages, tools } = await request.json();

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return errorResponse('OpenAI API key not configured', 500);
      }

      const toolsConfig: any = {};
      if (tools) {
        Object.entries(tools).forEach(([name, tool]: [string, any]) => {
          toolsConfig[name] = {
            description: tool.description,
            parameters: tool.parameters,
          };
        });
      }

      const result = streamText({
        model: openai('gpt-4o-mini'),
        messages,
        tools: toolsConfig,
      });

      return result.toTextStreamResponse();
    }

    // 404
    return errorResponse('Not found', 404);
  } catch (error) {
    console.error('[API] Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}

console.log(`[API Server] Starting on port ${port}...`);
console.log(`[API Server] API will be available at http://localhost:${port}`);

serve({
  fetch: handleRequest,
  port,
}, (info) => {
  console.log(`[API Server] Server is running on http://localhost:${info.port}`);
  console.log(`[API Server] Health check: http://localhost:${info.port}/health`);
  console.log(`[API Server] Endpoints:`);
  console.log(`  - GET  /api/attractions`);
  console.log(`  - GET  /api/cafes`);
  console.log(`  - GET  /api/events`);
  console.log(`  - GET  /api/tours`);
  console.log(`  - GET  /api/tours/:id`);
  console.log(`  - POST /api/tours`);
  console.log(`  - POST /api/chat`);
});
