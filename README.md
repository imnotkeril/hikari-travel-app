# Hikari Travel App

A modern travel guide application for Tokyo, built with React Native and Expo. Discover attractions, cafes, events, and create personalized tours with AI assistance.

## Features

### 🗾 Attractions
- Browse 29+ popular Tokyo attractions
- Filter by category, rating, distance, and ward
- View detailed information, images, and reviews
- Calculate distance and travel time from your location

### ☕ Cafes & Restaurants
- Explore cafes and restaurants across Tokyo
- Filter by cuisine type, price level, and features
- Find nearby dining options with distance calculations

### 🎉 Events
- Discover upcoming events and festivals
- View event details, dates, and tips
- Get information about admission fees and locations

### 🗺️ Interactive Map
- Visualize all places on an interactive map
- Filter by type (attractions, cafes, restaurants)
- View tour routes and navigate to locations

### 🎯 Custom Tours
- Create personalized tours by selecting places
- AI-powered tour generation with natural language
- Automatic route optimization
- Multi-day tour planning with time estimates
- Cost calculations including transport and admission fees

### ⭐ Favorites
- Save favorite places for quick access
- Manage your saved locations

## Tech Stack

- **Frontend**: React Native, Expo Router, TypeScript
- **Backend**: Bun REST API
- **State Management**: React Query, Zustand
- **AI**: OpenAI API (for tour generation)
- **Maps**: React Native Maps
- **UI**: Expo components, Lucide icons

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Bun](https://bun.sh/) (latest version)
- OpenAI API key (for AI features)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd travel-app
```

2. Install dependencies:
```bash
bun install
```

3. Create `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

## Running the Application

### Web Development

**Terminal 1 - Start Backend Server:**
```bash
bun run server
```

The API server will start on `http://localhost:3001`

**Terminal 2 - Start Frontend:**
```bash
bun run start:web
```

Open `http://localhost:8081` (or the port shown in terminal) in your browser.

### Native Development (iOS/Android)

**Terminal 1 - Start Backend Server:**
```bash
bun run server
```

**Terminal 2 - Start Expo:**
```bash
bun run start
```

Then:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan QR code with Expo Go app on your device

## Project Structure

```
├── api/                    # Backend REST API
│   ├── server.ts          # Bun server with REST endpoints
│   ├── db.ts              # In-memory database
│   ├── data.ts            # Seed data (attractions, cafes, events, tours)
│   ├── types.ts           # TypeScript type definitions
│   └── services/          # Business logic
│       ├── distance-calculator.ts
│       └── tour-optimizer.ts
├── app/                   # App screens (Expo Router)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home screen
│   │   ├── attractions.tsx
│   │   ├── cafe.tsx
│   │   ├── events.tsx
│   │   ├── tours.tsx
│   │   └── map.tsx
│   ├── place/[id].tsx     # Place detail screen
│   ├── event/[id].tsx     # Event detail screen
│   ├── tour/[id].tsx      # Tour detail screen
│   └── _layout.tsx        # Root layout
├── components/             # Reusable React components
│   ├── CreateTourModal.tsx
│   ├── FilterModal.tsx
│   └── TourEditModal.tsx
├── contexts/              # React contexts
│   ├── UserContext.tsx
│   └── TourCreationContext.tsx
├── lib/                   # Utilities
│   └── api.ts            # API client for REST endpoints
├── constants/             # App constants
└── server.ts             # Server entry point
```

## API Endpoints

The backend provides the following REST endpoints:

- `GET /health` - Health check
- `GET /api/attractions?userLocation={lat,lng}` - Get all attractions
- `GET /api/cafes?userLocation={lat,lng}` - Get all cafes/restaurants
- `GET /api/events` - Get all events
- `GET /api/tours?userId={id}` - Get all tours (templates + user tours)
- `GET /api/tours/:id` - Get tour by ID
- `POST /api/tours` - Create a new tour
- `POST /api/chat` - AI chat endpoint (for tour generation)

## Data

The app uses an in-memory database seeded with:

- **29 attractions** - Temples, museums, parks, observation decks
- **5 cafes/restaurants** - Various dining options
- **4 events** - Festivals and cultural events
- **4 template tours** - Pre-made tour suggestions

Data is loaded from `api/data.ts` on server startup.

## Development

### Adding New Data

Edit `api/data.ts` to add new attractions, cafes, or events.

### Adding New Features

1. **New API endpoint**: Add route handler in `api/server.ts`
2. **New screen**: Add file in `app/` directory
3. **New component**: Add file in `components/` directory

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Follow React Native best practices

## Building for Production

### iOS

```bash
bun i -g @expo/eas-cli
eas build:configure
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

### Web

```bash
expo export:web
```

## Troubleshooting

### Backend not connecting?

1. Make sure backend server is running: `bun run server`
2. Check that port 3001 is not in use
3. Verify `.env` file exists with `OPENAI_API_KEY`

### Data not loading?

1. Check browser console for API errors
2. Verify backend server is running and accessible
3. Check network tab for failed requests

### AI features not working?

1. Verify `OPENAI_API_KEY` is set in `.env`
2. Check your OpenAI account has credits
3. Restart backend server after changing `.env`

## License

Private project
