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

export const events: Event[] = [
  {
    id: 'e1',
    name: 'Cherry Blossom Festival',
    type: 'Festival',
    ward: 'Ueno',
    address: 'Ueno Park, Taito',
    coordinates: { lat: 35.7148, lng: 139.7744 },
    startDate: '2026-03-25',
    endDate: '2026-04-10',
    image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&q=80',
    description: 'Annual cherry blossom festival featuring over 1,000 cherry trees in full bloom. Enjoy traditional performances, food stalls, and evening illuminations.',
    admissionFee: 0,
    tips: [
      'Best time: early morning to avoid crowds',
      'Bring picnic blanket for hanami',
      'Evening illuminations from 6-8 PM',
    ],
  },
  {
    id: 'e2',
    name: 'Sumida River Fireworks Festival',
    type: 'Fireworks',
    ward: 'Sumida',
    address: 'Sumida River, Sumida',
    coordinates: { lat: 35.7101, lng: 139.8107 },
    startDate: '2026-07-25',
    endDate: '2026-07-25',
    image: 'https://images.unsplash.com/photo-1528114039593-4366cc08227d?w=800&q=80',
    description: "One of Tokyo's largest fireworks displays with over 20,000 fireworks lighting up the summer night sky.",
    admissionFee: 0,
    tips: [
      'Arrive 2-3 hours early for good viewing spots',
      'Wear yukata for authentic experience',
      'Expect large crowds',
    ],
  },
  {
    id: 'e3',
    name: 'Tokyo Game Show',
    type: 'Exhibition',
    ward: 'Chiba',
    address: 'Makuhari Messe, Chiba',
    coordinates: { lat: 35.6479, lng: 140.0344 },
    startDate: '2026-09-24',
    endDate: '2026-09-27',
    image: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&q=80',
    description: "Asia's largest gaming convention featuring upcoming game releases, esports tournaments, and industry panels.",
    admissionFee: 1500,
    website: 'https://tgs.nikkeibp.co.jp/',
    tips: [
      'Book tickets in advance',
      'First two days are industry-only',
      'Wear comfortable shoes',
    ],
  },
  {
    id: 'e4',
    name: 'Shibuya Halloween',
    type: 'Cultural Event',
    ward: 'Shibuya',
    address: 'Shibuya Crossing, Shibuya',
    coordinates: { lat: 35.6595, lng: 139.7004 },
    startDate: '2026-10-31',
    endDate: '2026-10-31',
    image: 'https://images.unsplash.com/photo-1476842384041-a57a4f124e2e?w=800&q=80',
    description: 'Massive street party where thousands gather in costumes. The biggest Halloween celebration in Japan.',
    admissionFee: 0,
    tips: [
      'Arrive early - very crowded',
      'Be respectful of local businesses',
      'Use public transportation',
    ],
  },
];
