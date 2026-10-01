export type WasteCategory = 
  | 'plastic' 
  | 'paper' 
  | 'metal' 
  | 'organic' 
  | 'glass' 
  | 'e_waste' 
  | 'textile' 
  | 'battery' 
  | 'hazardous' 
  | 'other' 
  | null;

export interface WasteScanRecord {
  id: string;
  category: WasteCategory;
  item_name: string;
  material?: string | null;
  confidence: number;
  recommendation: string;
  reason: string;
  actionable_steps: string[];
  environmental_impact: string;
  image_url: string;
  is_waste: boolean;
  created_at: string;
  user_id?: string | null;
  user_name?: string | null;
  user_email?: string | null;
  
  // Advanced features
  image_quality?: 'good' | 'poor' | 'blurry' | 'dark' | 'distant';
  image_quality_reason?: string | null;
  contamination_detected?: boolean;
  contamination_note?: string | null;
  second_life_suggestion?: string | null;
  ai_prediction?: string | null;
  user_confirmed?: boolean | null;
  user_correction?: string | null;
}

export interface WasteAnalysisResult {
  is_waste: boolean;
  category: WasteCategory;
  item_name: string | null;
  material?: string | null;
  confidence: number;
  reason: string;
  disposal_recommendation: string | null;
  actionable_steps?: string[];
  environmental_impact?: string;
  alternative_bin?: string;
  
  // Extended fields
  image_quality?: 'good' | 'poor' | 'blurry' | 'dark' | 'distant';
  image_quality_reason?: string | null;
  contamination_detected?: boolean;
  contamination_note?: string | null;
  second_life_suggestion?: string | null;
}

export interface CategoryDistributionItem {
  name: string;
  key: string;
  value: number;
  color: string;
  icon: string;
}

export interface DailyTrendItem {
  date: string;
  total: number;
  plastic: number;
  paper: number;
  metal: number;
  organic: number;
  glass?: number;
  e_waste?: number;
  other?: number;
}

export interface MonthlyStatItem {
  month: string;
  total: number;
  plastic: number;
  paper: number;
  metal: number;
  organic: number;
  glass?: number;
  e_waste?: number;
}

export interface InsightItem {
  id: string;
  title: string;
  text: string;
  type: 'success' | 'info' | 'warning' | 'primary';
}

export interface AiClassificationQualityStats {
  totalFeedback: number;
  confirmed: number;
  corrected: number;
  correctionRate: number;
  mostCorrectedCategory: string;
}

export interface ContaminationStats {
  totalChecked: number;
  contaminatedCount: number;
  cleanCount: number;
  contaminationRate: number;
}

export interface DashboardStats {
  kpis: {
    totalScans: number;
    plastic: number;
    paper: number;
    metal: number;
    organic: number;
    glass: number;
    e_waste: number;
    textile: number;
    battery: number;
    hazardous: number;
    other: number;
    mostFrequentCategory: string;
    avgConfidence: number;
    co2SavedKg: number;
    aiQuality: AiClassificationQualityStats;
    contamination: ContaminationStats;
  };
  percentages: Record<string, number>;
  categoryDistribution: CategoryDistributionItem[];
  dailyTrend: DailyTrendItem[];
  monthlyStats: MonthlyStatItem[];
  insights: InsightItem[];
}

export interface AdminUser {
  name: string;
  email: string;
  role: string;
  accessLevel: string;
  token: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface UserRecyclingStats {
  totalScans: number;
  categoryCounts: Record<string, number>;
  avgConfidence: number;
  co2SavedKg: number;
  badge: string;
}

export interface DisposalFacility {
  id: string;
  name: string;
  type: 'recycling' | 'e_waste' | 'battery' | 'glass' | 'textile' | 'hazardous';
  categories: WasteCategory[];
  address: string;
  city: string;
  pin?: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  phone?: string;
  hours?: string;
  acceptedMaterials: string[];
  notes?: string;
  isDemo?: boolean;
}
