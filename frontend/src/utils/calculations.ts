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
};

export function mapReceiptToMetrics(receipt: EnvironmentalReceipt): EnvironmentalMetrics {
  const co2 = receipt.emissions;
  const water = receipt.water;
  const degradationTime = receipt.decomposition_time_years;

  // Map ethics score (0-100) to humanCost
  const humanCost = receipt.ethics_score != null ? receipt.ethics_score : 50;

  // Use backend grade and score directly
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

export function generateSupplyChain(receipt: EnvironmentalReceipt): SupplyChainStop[] {
  const stops: SupplyChainStop[] = [];
  const name = (receipt.product_name + ' ' + receipt.brand).toLowerCase();

  const isElectronics = name.includes('phone') || name.includes('laptop') || name.includes('electronic') || name.includes('computer');
  const isTextile = name.includes('shirt') || name.includes('cotton') || name.includes('fabric') || name.includes('clothing');

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

  const destCoords = cityCoordinates['new york'];
  stops.push({ name: 'Your Location - New York, USA', lat: destCoords.lat, lng: destCoords.lng, type: 'destination' });

  return stops;
}
