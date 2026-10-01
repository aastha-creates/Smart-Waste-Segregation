import { DisposalFacility, WasteCategory } from '../src/types';

// Haversine formula for calculating spherical distance between two points in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Structured verified demo disposal facilities
export const DEMO_FACILITIES: DisposalFacility[] = [
  {
    id: 'fac-1',
    name: 'Metro Eco-Recycling & Material Recovery Facility',
    type: 'recycling',
    categories: ['plastic', 'paper', 'metal'],
    address: '420 Industrial Parkway, Sector 4',
    city: 'San Francisco',
    pin: '94107',
    lat: 37.7694,
    lng: -122.3867,
    phone: '+1 (415) 555-0192',
    hours: 'Mon-Sat: 8:00 AM - 5:30 PM',
    acceptedMaterials: ['PET Bottles (#1)', 'HDPE Jugs (#2)', 'Corrugated Cardboard', 'Aluminum Beverage Cans', 'Clean Tinplate'],
    notes: 'Drive-through drop-off bay available. Contact facility to confirm large bulk drop-offs.',
    isDemo: true
  },
  {
    id: 'fac-2',
    name: 'GreenTech Certified E-Waste & Electronics Depot',
    type: 'e_waste',
    categories: ['e_waste'],
    address: '880 Tech Innovation Blvd, Suite 100',
    city: 'San Francisco',
    pin: '94103',
    lat: 37.7785,
    lng: -122.4056,
    phone: '+1 (415) 555-0348',
    hours: 'Mon-Fri: 9:00 AM - 6:00 PM',
    acceptedMaterials: ['Smartphones & Tablets', 'Laptops & Computers', 'Cables & Chargers', 'Circuit Boards', 'Peripherals'],
    notes: 'Complimentary certified data sanitization on hard drives.',
    isDemo: true
  },
  {
    id: 'fac-3',
    name: 'VoltSafe Battery Drop-off & Kiosk Center',
    type: 'battery',
    categories: ['battery'],
    address: '150 Mission Gateway Center',
    city: 'San Francisco',
    pin: '94105',
    lat: 37.7915,
    lng: -122.3985,
    phone: '+1 (415) 555-0811',
    hours: 'Daily: 7:00 AM - 9:00 PM',
    acceptedMaterials: ['Alkaline AA/AAA', 'Lithium-Ion Rechargeable Packs', 'Button Cell Batteries', 'Lead-Acid Small Batteries'],
    notes: 'Tape terminals with clear tape prior to placing in collection chutes.',
    isDemo: true
  },
  {
    id: 'fac-4',
    name: 'ClearCycle Glass Collection & Bottle Bank',
    type: 'glass',
    categories: ['glass'],
    address: '730 Harbor View Road, Berth 12',
    city: 'San Francisco',
    pin: '94111',
    lat: 37.8012,
    lng: -122.4019,
    phone: '+1 (415) 555-0922',
    hours: '24/7 Public Drop-off Bins',
    acceptedMaterials: ['Flint (Clear) Glass Bottles', 'Amber/Brown Beer Bottles', 'Green Wine Bottles', 'Condiment Glass Jars'],
    notes: 'No ceramics, window glass, or lightbulbs accepted.',
    isDemo: true
  },
  {
    id: 'fac-5',
    name: 'Community Threads Textile Reclaim & Donation Hub',
    type: 'textile',
    categories: ['textile'],
    address: '215 Valencia Street, District 8',
    city: 'San Francisco',
    pin: '94103',
    lat: 37.7682,
    lng: -122.4218,
    phone: '+1 (415) 555-0555',
    hours: 'Tue-Sun: 10:00 AM - 6:00 PM',
    acceptedMaterials: ['Wearable Garments', 'Clean Fabric Scraps', 'Shoes & Footwear', 'Linens & Towels'],
    notes: 'Wearable items are donated to local shelters; damaged fabrics are sent for fiber downcycling.',
    isDemo: true
  },
  {
    id: 'fac-6',
    name: 'Municipal Household Hazardous Waste (HHW) Station',
    type: 'hazardous',
    categories: ['hazardous'],
    address: '501 Tunnel Ave, Gate 3',
    city: 'San Francisco',
    pin: '94134',
    lat: 37.7118,
    lng: -122.4042,
    phone: '+1 (415) 555-0777',
    hours: 'Thu-Sat: 8:00 AM - 4:00 PM',
    acceptedMaterials: ['Oil-based & Latex Paints', 'Pesticides & Herbicides', 'Motor Oil & Antifreeze', 'Cleaning Solvents', 'Fluorescent Tubes'],
    notes: 'Strict proof of residency required. Maximum 10 gallons per vehicle per trip.',
    isDemo: true
  },
  {
    id: 'fac-7',
    name: 'Civic Compost & Organic Transfer Terminal',
    type: 'recycling',
    categories: ['organic'],
    address: '1200 Jerrold Avenue, Yard B',
    city: 'San Francisco',
    pin: '94124',
    lat: 37.7391,
    lng: -122.3854,
    phone: '+1 (415) 555-0420',
    hours: 'Mon-Sat: 6:00 AM - 4:00 PM',
    acceptedMaterials: ['Food Scraps & Fruit Peels', 'Coffee Grounds & Filters', 'Clean Yard Clippings', 'BPI-Certified Compostable Packaging'],
    notes: 'No plastic grocery bags or synthetic packaging permitted.',
    isDemo: true
  }
];

export function getDisposalFacilities(options: {
  category?: string;
  type?: string;
  search?: string;
  userLat?: number;
  userLng?: number;
}): DisposalFacility[] {
  let list = [...DEMO_FACILITIES];

  // Filter by category or type
  if (options.category && options.category !== 'all') {
    const targetCat = options.category.toLowerCase().trim() as WasteCategory;
    list = list.filter(f => f.categories.includes(targetCat));
  } else if (options.type && options.type !== 'all') {
    const targetType = options.type.toLowerCase().trim();
    list = list.filter(f => f.type === targetType);
  }

  // Filter by city / pin / search keyword
  if (options.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(f => 
      f.name.toLowerCase().includes(q) ||
      f.city.toLowerCase().includes(q) ||
      (f.pin && f.pin.includes(q)) ||
      f.address.toLowerCase().includes(q) ||
      f.acceptedMaterials.some(m => m.toLowerCase().includes(q))
    );
  }

  // Calculate actual distance if coordinates provided
  if (typeof options.userLat === 'number' && typeof options.userLng === 'number') {
    list = list.map(f => {
      const distanceKm = calculateDistanceKm(options.userLat!, options.userLng!, f.lat, f.lng);
      return { ...f, distanceKm };
    });

    // Sort by nearest
    list.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }

  return list;
}
