import type { EnvironmentalReceipt } from '../api/types';

export interface EnvironmentalMetrics {
  co2: number;
  water: number;
  humanCost: number;
  degradationTime: number;
  grade: string;
  gradeScore: number;
  breakdown: {
    manufacturing: number;
    shipping: number;
    materials: number;
  };
}

export interface SupplyChainStop {
  name: string;
  lat: number;
  lng: number;
  type: 'origin' | 'manufacturing' | 'distribution' | 'destination';
}

export interface SupplyChainArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcColor: string;
  from: string;
  to: string;
  transportMode: string;
  distanceKm: number;
  co2Kg: number;
  durationDays: number;
}

const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  'new york': { lat: 40.7128, lng: -74.006 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'houston': { lat: 29.7604, lng: -95.3698 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'seattle': { lat: 47.6062, lng: -122.3321 },
  'miami': { lat: 25.7617, lng: -80.1918 },
  'boston': { lat: 42.3601, lng: -71.0589 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'beijing': { lat: 39.9042, lng: 116.4074 },
  'shanghai': { lat: 31.2304, lng: 121.4737 },
  'sydney': { lat: -33.8688, lng: 151.2093 },
  'toronto': { lat: 43.6532, lng: -79.3832 },
  'berlin': { lat: 52.52, lng: 13.405 },
  'dubai': { lat: 25.2048, lng: 55.2708 },
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'mumbai': { lat: 19.076, lng: 72.8777 },
  'fullerton': { lat: 33.8704, lng: -117.9242 },
  'anaheim': { lat: 33.8366, lng: -117.9143 },
  'irvine': { lat: 33.6846, lng: -117.8265 },
  'san diego': { lat: 32.7157, lng: -117.1611 },
  'phoenix': { lat: 33.4484, lng: -112.074 },
  'dallas': { lat: 32.7767, lng: -96.797 },
  'austin': { lat: 30.2672, lng: -97.7431 },
  'denver': { lat: 39.7392, lng: -104.9903 },
  'atlanta': { lat: 33.749, lng: -84.388 },
  'portland': { lat: 45.5152, lng: -122.6784 },
  'las vegas': { lat: 36.1699, lng: -115.1398 },
  'san antonio': { lat: 29.4241, lng: -98.4936 },
  'philadelphia': { lat: 39.9526, lng: -75.1652 },
};

async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    const data = await res.json();
    const r = data.results?.[0];
    if (r) return { lat: r.latitude, lng: r.longitude };
  } catch {
    // ignore
  }
  return null;
}

function lookupLocal(raw: string): { lat: number; lng: number } | null {
  const normalized = raw.toLowerCase().trim();
  // exact match
  if (cityCoordinates[normalized]) return cityCoordinates[normalized];
  // prefix match (handles "Los Angeles, CA" → "los angeles")
  const entry = Object.entries(cityCoordinates).find(
    ([k]) => normalized.startsWith(k) || k.startsWith(normalized.split(/[\s,]/)[0])
  );
  return entry?.[1] ?? null;
}

export function mapReceiptToMetrics(receipt: EnvironmentalReceipt): EnvironmentalMetrics {
  const co2 = receipt.emissions;
  const water = receipt.water;
  const degradationTime = receipt.decomposition_time_years;
  const humanCost = receipt.ethics_score != null ? receipt.ethics_score : 50;
  const grade = receipt.environmental_grade;
  const gradeScore = receipt.overall_score;

  const breakdown = {
    manufacturing: Math.round(co2 * 0.45 * 10) / 10,
    shipping: Math.round(co2 * 0.35 * 10) / 10,
    materials: Math.round(co2 * 0.2 * 10) / 10,
  };

  return {
    co2: Math.round(co2 * 10) / 10,
    water: Math.round(water),
    humanCost: Math.max(0, Math.min(100, humanCost)),
    degradationTime: Math.round(degradationTime * 10) / 10,
    grade,
    gradeScore: Math.round(gradeScore),
    breakdown,
  };
}

export async function generateSupplyChain(
  receipt: EnvironmentalReceipt,
  deliveryLocation?: string
): Promise<SupplyChainStop[]> {
  const stops: SupplyChainStop[] = [];
  const name = (receipt.product_name + ' ' + receipt.brand).toLowerCase();

  const isElectronics =
    name.includes('phone') || name.includes('laptop') ||
    name.includes('electronic') || name.includes('computer');
  const isTextile =
    name.includes('shirt') || name.includes('cotton') ||
    name.includes('fabric') || name.includes('clothing');

  if (isTextile) {
    stops.push({ name: 'Cotton Farm - India', lat: 23.0225, lng: 72.5714, type: 'origin' });
  } else if (isElectronics) {
    stops.push({ name: 'Raw Materials - DRC', lat: -4.0383, lng: 21.7587, type: 'origin' });
  } else {
    stops.push({ name: 'Raw Materials - China', lat: 35.8617, lng: 104.1954, type: 'origin' });
  }

  if (isElectronics || (receipt.price && receipt.price < 50)) {
    stops.push({ name: 'Manufacturing - Shenzhen, China', lat: 22.5431, lng: 114.0579, type: 'manufacturing' });
  } else {
    stops.push({ name: 'Manufacturing - Vietnam', lat: 21.0285, lng: 105.8542, type: 'manufacturing' });
  }

  stops.push({ name: 'Distribution Center - Los Angeles, USA', lat: 34.0522, lng: -118.2437, type: 'distribution' });

  const raw = (deliveryLocation ?? '').trim();
  const displayName = raw
    ? raw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'New York';

  // 1. Try local lookup first (instant)
  let coords = raw ? lookupLocal(raw) : null;

  // 2. Fall back to geocoding API for any city not in our local map
  if (!coords && raw) {
    coords = await geocodeCity(raw);
  }

  // 3. Last resort: New York
  if (!coords) {
    coords = cityCoordinates['new york'];
  }

  stops.push({ name: `Your Location - ${displayName}`, lat: coords.lat, lng: coords.lng, type: 'destination' });

  return stops;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// kg CO2 per tonne-km by mode
const CO2_FACTOR: Record<string, number> = {
  Ship: 0.010,
  Truck: 0.096,
  Air: 0.602,
  Rail: 0.028,
};

function inferTransportMode(from: SupplyChainStop, to: SupplyChainStop): string {
  const dist = haversineKm(from.lat, from.lng, to.lat, to.lng);
  if (dist > 3000) return 'Ship';
  if (dist > 500) return 'Truck';
  return 'Truck';
}

export function buildArcs(stops: SupplyChainStop[]): SupplyChainArc[] {
  const arcColors = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'];
  // Assume average product weight of 1 kg for CO2 estimation
  const weightTonnes = 0.001;

  return stops.slice(0, -1).map((stop, i) => {
    const next = stops[i + 1];
    const distanceKm = Math.round(haversineKm(stop.lat, stop.lng, next.lat, next.lng));
    const mode = inferTransportMode(stop, next);
    const co2Kg = Math.round(distanceKm * weightTonnes * CO2_FACTOR[mode] * 100) / 100;
    const durationDays = mode === 'Ship' ? Math.round(distanceKm / 500) : Math.round(distanceKm / 800);

    return {
      startLat: stop.lat,
      startLng: stop.lng,
      endLat: next.lat,
      endLng: next.lng,
      arcColor: arcColors[i % arcColors.length],
      from: stop.name,
      to: next.name,
      transportMode: mode,
      distanceKm,
      co2Kg,
      durationDays: Math.max(1, durationDays),
    };
  });
}
