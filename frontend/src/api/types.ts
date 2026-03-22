export interface SupplyChainStop {
  name: string;
  lat: number;
  lng: number;
  type: 'origin' | 'manufacturing' | 'distribution' | 'destination';
}

export interface EnvironmentalReceipt {
  product_name: string;
  brand: string;
  price: number;
  image_url?: string;
  asin?: string;
  climate_pledge_friendly: boolean;

  // Climatiq
  emissions: number;
  emission_factor_name?: string;
  emission_factor_region?: string;
  emission_lca_stage?: string;
  decomposition_time_years: number;

  // Geocoded origin coordinates
  origin_lat?: number;
  origin_lng?: number;

  // Geocoded supply chain stops from Cohere + geopy
  supply_chain?: SupplyChainStop[];

  // WikiRate labor ethics
  ethics_score?: number;
  warnings?: string[];

  water: number;
  water_breakdown?: {
    raw_materials_water: number;
    manufacturing_process_water: number;
  };
  environmental_grade: string;
  overall_score: number;
}
