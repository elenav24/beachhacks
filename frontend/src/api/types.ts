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

  // WikiRate labor ethics
  ethics_score?: number;
  ethics_breakdown?: unknown[];

  // WikiRate climate transparency
  climate_decarbonization_score?: number;
  climate_energy_score?: number;
  climate_traceability_score?: number;
  climate_accountability_score?: number;

  water: number;
  environmental_grade: string;
  overall_score: number;
}
