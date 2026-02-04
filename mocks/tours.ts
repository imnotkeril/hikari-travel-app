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

export interface Tour {
  id: string;
  title: string;
  days: number;
  places: number;
  estimatedCost: number;
  totalHours: number;
  description: string;
  highlights: string[];
  image: string;
  detailedDays?: TourDay[];
  isActive?: boolean;
}

export const readyTours: Tour[] = [
  {
    id: 'tokyo-classics-3d',
    title: 'Tokyo Classics 3 Days',
    days: 3,
    places: 12,
    estimatedCost: 15000,
    totalHours: 18,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    description: 'Experience the iconic landmarks of Tokyo in 3 days including Senso-ji Temple, Tokyo Skytree, Meiji Shrine, and Shibuya Crossing.',
    highlights: [
      'Visit Senso-ji Temple in Asakusa',
      'Tokyo Skytree observation deck',
      'Meiji Shrine peaceful gardens',
      'Shibuya Crossing experience',
    ],
    detailedDays: [
      {
        dayNumber: 1,
        date: '2026-03-15',
        places: [
          { placeId: '1', plannedTime: '09:00', visitDuration: 90, transportMode: 'metro', transportDuration: 0, transportCost: 0 },
          { placeId: '2', plannedTime: '11:30', visitDuration: 120, transportMode: 'metro', transportDuration: 15, transportCost: 200 },
          { placeId: 'r2', plannedTime: '14:00', visitDuration: 45, transportMode: 'walk', transportDuration: 10, transportCost: 0 },
          { placeId: '5', plannedTime: '16:00', visitDuration: 90, transportMode: 'metro', transportDuration: 30, transportCost: 250 },
        ],
        totalCost: 4550,
        totalDuration: 375,
        notes: 'Start your Tokyo adventure with historic temples and modern views',
      },
      {
        dayNumber: 2,
        date: '2026-03-16',
        places: [
          { placeId: '3', plannedTime: '09:00', visitDuration: 75, transportMode: 'metro', transportDuration: 0, transportCost: 0 },
          { placeId: '4', plannedTime: '11:00', visitDuration: 30, transportMode: 'walk', transportDuration: 15, transportCost: 0 },
          { placeId: 'c2', plannedTime: '12:00', visitDuration: 60, transportMode: 'walk', transportDuration: 5, transportCost: 0 },
          { placeId: '6', plannedTime: '14:30', visitDuration: 120, transportMode: 'metro', transportDuration: 25, transportCost: 220 },
        ],
        totalCost: 2720,
        totalDuration: 330,
        notes: 'Explore shrines, iconic crossing, and Imperial Palace',
      },
      {
        dayNumber: 3,
        date: '2026-03-17',
        places: [
          { placeId: '7', plannedTime: '09:00', visitDuration: 180, transportMode: 'metro', transportDuration: 0, transportCost: 0 },
          { placeId: '8', plannedTime: '13:00', visitDuration: 120, transportMode: 'metro', transportDuration: 20, transportCost: 180 },
          { placeId: 'r5', plannedTime: '17:00', visitDuration: 120, transportMode: 'metro', transportDuration: 30, transportCost: 240 },
        ],
        totalCost: 3920,
        totalDuration: 450,
        notes: 'Parks, shopping districts, and traditional izakaya experience',
      },
    ],
  },
  {
    id: 'tokyo-classics-5d',
    title: 'Tokyo Classics 5 Days',
    days: 5,
    places: 20,
    estimatedCost: 28000,
    totalHours: 32,
    image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80',
    description: 'Comprehensive 5-day journey through Tokyo\'s best landmarks, neighborhoods, and experiences.',
    highlights: [
      'All major temples and shrines',
      'Tokyo Skytree & Tower views',
      'Multiple neighborhoods exploration',
      'Traditional and modern Tokyo',
      'Best food experiences',
    ],
    detailedDays: [
      {
        dayNumber: 1,
        date: '2026-03-15',
        places: [
          { placeId: '1', plannedTime: '09:00', visitDuration: 90, transportMode: 'metro', transportDuration: 0, transportCost: 0 },
          { placeId: '2', plannedTime: '11:30', visitDuration: 120, transportMode: 'metro', transportDuration: 15, transportCost: 200 },
          { placeId: 'r2', plannedTime: '14:30', visitDuration: 45, transportMode: 'walk', transportDuration: 10, transportCost: 0 },
          { placeId: '5', plannedTime: '17:00', visitDuration: 90, transportMode: 'metro', transportDuration: 40, transportCost: 250 },
        ],
        totalCost: 4550,
        totalDuration: 405,
        notes: 'Historic Asakusa and iconic towers',
      },
      {
        dayNumber: 2,
        date: '2026-03-16',
        places: [
          { placeId: '3', plannedTime: '09:00', visitDuration: 75, transportMode: 'metro', transportDuration: 0, transportCost: 0 },
          { placeId: '4', plannedTime: '11:00', visitDuration: 30, transportMode: 'walk', transportDuration: 15, transportCost: 0 },
          { placeId: 'r1', plannedTime: '12:30', visitDuration: 90, transportMode: 'metro', transportDuration: 25, transportCost: 220 },
          { placeId: '6', plannedTime: '15:30', visitDuration: 120, transportMode: 'metro', transportDuration: 20, transportCost: 180 },
        ],
        totalCost: 16900,
        totalDuration: 355,
        notes: 'Shibuya energy and Imperial elegance',
      },
      {
        dayNumber: 3,
        date: '2026-03-17',
        places: [
          { placeId: '7', plannedTime: '09:00', visitDuration: 180, transportMode: 'metro', transportDuration: 0, transportCost: 0 },
          { placeId: '9', plannedTime: '13:00', visitDuration: 150, transportMode: 'walk', transportDuration: 10, transportCost: 0 },
          { placeId: 'r4', plannedTime: '17:00', visitDuration: 60, transportMode: 'metro', transportDuration: 35, transportCost: 260 },
        ],
        totalCost: 2760,
        totalDuration: 435,
        notes: 'Museum day and Michelin ramen',
      },
      {
        dayNumber: 4,
        date: '2026-03-18',
        places: [
          { placeId: '8', plannedTime: '10:00', visitDuration: 120, transportMode: 'metro', transportDuration: 0, transportCost: 0 },
          { placeId: 'c3', plannedTime: '13:00', visitDuration: 90, transportMode: 'walk', transportDuration: 5, transportCost: 0 },
          { placeId: '15', plannedTime: '15:30', visitDuration: 90, transportMode: 'walk', transportDuration: 5, transportCost: 0 },
          { placeId: 'r5', plannedTime: '18:30', visitDuration: 120, transportMode: 'metro', transportDuration: 30, transportCost: 240 },
        ],
        totalCost: 3740,
        totalDuration: 450,
        notes: 'Otaku culture immersion in Akihabara',
      },
      {
        dayNumber: 5,
        date: '2026-03-19',
        places: [
          { placeId: '17', plannedTime: '10:00', visitDuration: 150, transportMode: 'metro', transportDuration: 0, transportCost: 0 },
          { placeId: '12', plannedTime: '14:00', visitDuration: 90, transportMode: 'metro', transportDuration: 35, transportCost: 260 },
          { placeId: 'b2', plannedTime: '18:00', visitDuration: 120, transportMode: 'metro', transportDuration: 25, transportCost: 220 },
        ],
        totalCost: 5280,
        totalDuration: 420,
        notes: 'Digital art, gardens, and cocktails to end your journey',
      },
    ],
  },
  {
    id: 'tokyo-classics-7d',
    title: 'Tokyo Classics 7 Days',
    days: 7,
    places: 30,
    estimatedCost: 42000,
    totalHours: 48,
    image: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800&q=80',
    description: 'The ultimate week-long Tokyo experience covering everything from ancient temples to cutting-edge technology.',
    highlights: [
      'Complete Tokyo exploration',
      'Day trip to Mt. Fuji area',
      'All major neighborhoods',
      'Mix of traditional & modern',
      'Food paradise tour',
      'Nightlife experiences',
    ],
    detailedDays: [
      {
        dayNumber: 1,
        date: '2026-03-15',
        places: [
          { placeId: '1', plannedTime: '09:00', visitDuration: 90, transportMode: 'metro', transportDuration: 0, transportCost: 0 },
          { placeId: '2', plannedTime: '11:30', visitDuration: 120, transportMode: 'metro', transportDuration: 15, transportCost: 200 },
          { placeId: 'r2', plannedTime: '14:30', visitDuration: 45, transportMode: 'walk', transportDuration: 10, transportCost: 0 },
          { placeId: '13', plannedTime: '16:30', visitDuration: 60, transportMode: 'metro', transportDuration: 35, transportCost: 260 },
        ],
        totalCost: 3760,
        totalDuration: 380,
      },
      {
        dayNumber: 2,
        date: '2026-03-16',
        places: [
          { placeId: '3', plannedTime: '09:00', visitDuration: 75, transportMode: 'metro', transportDuration: 0, transportCost: 0 },
          { placeId: '4', plannedTime: '11:00', visitDuration: 30, transportMode: 'walk', transportDuration: 15, transportCost: 0 },
          { placeId: 'c2', plannedTime: '12:30', visitDuration: 60, transportMode: 'walk', transportDuration: 5, transportCost: 0 },
          { placeId: 'cl1', plannedTime: '23:00', visitDuration: 240, transportMode: 'walk', transportDuration: 10, transportCost: 0 },
        ],
        totalCost: 4500,
        totalDuration: 420,
      },
      {
        dayNumber: 3,
        date: '2026-03-17',
        places: [
          { placeId: '6', plannedTime: '09:00', visitDuration: 120, transportMode: 'metro', transportDuration: 0, transportCost: 0 },
          { placeId: '12', plannedTime: '12:00', visitDuration: 90, transportMode: 'metro', transportDuration: 25, transportCost: 220 },
          { placeId: 'r1', plannedTime: '18:00', visitDuration: 90, transportMode: 'metro', transportDuration: 35, transportCost: 260 },
        ],
        totalCost: 16480,
        totalDuration: 360,
      },
      {
        dayNumber: 4,
        date: '2026-03-18',
        places: [
          { placeId: '7', plannedTime: '09:00', visitDuration: 180, transportMode: 'metro', transportDuration: 0, transportCost: 0 },
          { placeId: '9', plannedTime: '13:00', visitDuration: 150, transportMode: 'walk', transportDuration: 10, transportCost: 0 },
          { placeId: 'r3', plannedTime: '18:00', visitDuration: 120, transportMode: 'metro', transportDuration: 30, transportCost: 240 },
        ],
        totalCost: 9240,
        totalDuration: 510,
      },
      {
        dayNumber: 5,
        date: '2026-03-19',
        places: [
          { placeId: '8', plannedTime: '10:00', visitDuration: 120, transportMode: 'metro', transportDuration: 0, transportCost: 0 },
          { placeId: '15', plannedTime: '13:00', visitDuration: 90, transportMode: 'walk', transportDuration: 5, transportCost: 0 },
          { placeId: 'c3', plannedTime: '15:30', visitDuration: 90, transportMode: 'walk', transportDuration: 5, transportCost: 0 },
          { placeId: 'b3', plannedTime: '22:00', visitDuration: 180, transportMode: 'metro', transportDuration: 25, transportCost: 220 },
        ],
        totalCost: 3220,
        totalDuration: 515,
      },
      {
        dayNumber: 6,
        date: '2026-03-20',
        places: [
          { placeId: '17', plannedTime: '10:00', visitDuration: 150, transportMode: 'metro', transportDuration: 0, transportCost: 0 },
          { placeId: '5', plannedTime: '14:00', visitDuration: 90, transportMode: 'metro', transportDuration: 30, transportCost: 240 },
          { placeId: 'r5', plannedTime: '17:30', visitDuration: 120, transportMode: 'metro', transportDuration: 25, transportCost: 220 },
        ],
        totalCost: 6260,
        totalDuration: 435,
      },
      {
        dayNumber: 7,
        date: '2026-03-21',
        places: [
          { placeId: '14', plannedTime: '10:00', visitDuration: 120, transportMode: 'metro', transportDuration: 0, transportCost: 0 },
          { placeId: 'c1', plannedTime: '13:00', visitDuration: 60, transportMode: 'metro', transportDuration: 20, transportCost: 200 },
          { placeId: 'b4', plannedTime: '18:00', visitDuration: 180, transportMode: 'metro', transportDuration: 30, transportCost: 240 },
        ],
        totalCost: 5440,
        totalDuration: 420,
      },
    ],
  },
  {
    id: 'fuji-1d',
    title: 'Mt. Fuji Day Trip',
    days: 1,
    places: 3,
    estimatedCost: 8000,
    totalHours: 10,
    image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80',
    description: 'Full day trip to Mt. Fuji area including 5th Station, Lake Kawaguchiko, and Oishi Park with stunning views of Japan\'s iconic mountain.',
    highlights: [
      'Mt. Fuji 5th Station visit',
      'Lake Kawaguchiko boat tour',
      'Oishi Park flower fields',
      'Postcard-perfect photo opportunities',
      'Traditional lunch with Mt. Fuji view',
    ],
    detailedDays: [
      {
        dayNumber: 1,
        date: '2026-03-15',
        places: [
          { placeId: '18', plannedTime: '09:00', visitDuration: 120, transportMode: 'bus', transportDuration: 0, transportCost: 0 },
          { placeId: '19', plannedTime: '12:00', visitDuration: 180, transportMode: 'bus', transportDuration: 50, transportCost: 2000 },
          { placeId: '20', plannedTime: '16:00', visitDuration: 90, transportMode: 'bus', transportDuration: 20, transportCost: 500 },
        ],
        totalCost: 8000,
        totalDuration: 460,
        notes: 'Early start recommended. Return bus at 6 PM',
      },
    ],
  },
  {
    id: 'cultural-3d',
    title: 'Cultural Tokyo 3 Days',
    days: 3,
    places: 12,
    estimatedCost: 25000,
    totalHours: 20,
    image: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&q=80',
    description: 'Immerse yourself in Japanese culture with temples, museums, tea ceremony, sumo, and kabuki theater over 3 enriching days.',
    highlights: [
      'Traditional tea ceremony experience',
      'Sumo wrestling tournament',
      'Kabuki theater performance',
      'Tokyo National Museum',
      'Multiple temple and shrine visits',
      'Traditional kaiseki dinner',
    ],
    detailedDays: [
      {
        dayNumber: 1,
        date: '2026-03-15',
        places: [
          { placeId: '9', plannedTime: '09:00', visitDuration: 150, transportMode: 'metro', transportDuration: 0, transportCost: 0 },
          { placeId: '1', plannedTime: '13:00', visitDuration: 90, transportMode: 'metro', transportDuration: 25, transportCost: 220 },
          { placeId: '12', plannedTime: '16:00', visitDuration: 90, transportMode: 'metro', transportDuration: 30, transportCost: 240 },
        ],
        totalCost: 1760,
        totalDuration: 385,
        notes: 'Museum and temples day with tea ceremony at Hamarikyu',
      },
      {
        dayNumber: 2,
        date: '2026-03-16',
        places: [
          { placeId: '10', plannedTime: '09:00', visitDuration: 180, transportMode: 'metro', transportDuration: 0, transportCost: 0 },
          { placeId: '3', plannedTime: '13:30', visitDuration: 75, transportMode: 'metro', transportDuration: 35, transportCost: 260 },
          { placeId: '13', plannedTime: '16:00', visitDuration: 60, transportMode: 'metro', transportDuration: 30, transportCost: 240 },
          { placeId: 'r3', plannedTime: '18:30', visitDuration: 120, transportMode: 'metro', transportDuration: 25, transportCost: 220 },
        ],
        totalCost: 10720,
        totalDuration: 455,
        notes: 'Sumo morning, shrines, and kaiseki dinner',
      },
      {
        dayNumber: 3,
        date: '2026-03-17',
        places: [
          { placeId: '11', plannedTime: '11:00', visitDuration: 180, transportMode: 'metro', transportDuration: 0, transportCost: 0 },
          { placeId: '6', plannedTime: '16:00', visitDuration: 120, transportMode: 'metro', transportDuration: 20, transportCost: 180 },
          { placeId: 'b1', plannedTime: '19:00', visitDuration: 120, transportMode: 'metro', transportDuration: 30, transportCost: 240 },
        ],
        totalCost: 12420,
        totalDuration: 470,
        notes: 'Kabuki theater, Imperial Palace, and craft cocktails',
      },
    ],
  },
  {
    id: 'otaku-3d',
    title: 'Otaku Tokyo 3 Days',
    days: 3,
    places: 15,
    estimatedCost: 18000,
    totalHours: 36,
    image: 'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?w=800&q=80',
    description: 'The ultimate otaku experience: anime, manga, gaming culture in Akihabara, Nakano, and Shibuya with nightlife until the first train.',
    highlights: [
      'Akihabara electric town exploration',
      'Maid cafe experience',
      'Nakano Broadway treasure hunt',
      'Anime and manga shopping paradise',
      'Shibuya nightlife until first train',
      'Club hopping in Tokyo\'s best venues',
    ],
    detailedDays: [
      {
        dayNumber: 1,
        date: '2026-03-15',
        places: [
          { placeId: '8', plannedTime: '14:00', visitDuration: 120, transportMode: 'metro', transportDuration: 0, transportCost: 0 },
          { placeId: '15', plannedTime: '17:00', visitDuration: 90, transportMode: 'walk', transportDuration: 5, transportCost: 0 },
          { placeId: 'c3', plannedTime: '19:00', visitDuration: 90, transportMode: 'walk', transportDuration: 5, transportCost: 0 },
          { placeId: 'cl1', plannedTime: '23:00', visitDuration: 360, transportMode: 'metro', transportDuration: 15, transportCost: 200 },
        ],
        totalCost: 4700,
        totalDuration: 685,
        notes: 'Akihabara afternoon, maid cafe, then club until 5 AM',
      },
      {
        dayNumber: 2,
        date: '2026-03-16',
        places: [
          { placeId: '14', plannedTime: '14:00', visitDuration: 120, transportMode: 'metro', transportDuration: 0, transportCost: 0 },
          { placeId: 'c1', plannedTime: '17:00', visitDuration: 60, transportMode: 'metro', transportDuration: 20, transportCost: 200 },
          { placeId: 'b3', plannedTime: '22:00', visitDuration: 180, transportMode: 'metro', transportDuration: 10, transportCost: 180 },
          { placeId: 'cl3', plannedTime: '02:00', visitDuration: 240, transportMode: 'walk', transportDuration: 15, transportCost: 0 },
        ],
        totalCost: 4380,
        totalDuration: 625,
        notes: 'Nakano Broadway hunting, Golden Gai bars, underground clubbing',
      },
      {
        dayNumber: 3,
        date: '2026-03-17',
        places: [
          { placeId: '17', plannedTime: '13:00', visitDuration: 150, transportMode: 'metro', transportDuration: 0, transportCost: 0 },
          { placeId: '4', plannedTime: '16:30', visitDuration: 30, transportMode: 'metro', transportDuration: 25, transportCost: 220 },
          { placeId: 'r2', plannedTime: '18:00', visitDuration: 45, transportMode: 'walk', transportDuration: 10, transportCost: 0 },
          { placeId: 'b4', plannedTime: '21:00', visitDuration: 120, transportMode: 'metro', transportDuration: 30, transportCost: 240 },
          { placeId: 'cl2', plannedTime: '00:30', visitDuration: 330, transportMode: 'taxi', transportDuration: 40, transportCost: 3000 },
        ],
        totalCost: 8960,
        totalDuration: 750,
        notes: 'teamLab Borderless, Shibuya, rooftop bar, finish at ageHa mega club',
      },
    ],
  },
];

export const userTourExample: Tour = {
  id: 'user-1',
  title: 'My Custom Tokyo Trip',
  days: 2,
  places: 6,
  estimatedCost: 8000,
  totalHours: 12,
  image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  description: 'My personally curated Tokyo experience',
  highlights: ['Custom selection', 'Flexible schedule'],
};
