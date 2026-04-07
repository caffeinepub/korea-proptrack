export type {
  PropertyType,
  RegionLevel,
  Region,
  PropertyPrice,
  RegionSummary,
} from "./backend.d";
import type { PropertyType as PT, RegionLevel as RL } from "./backend.d";

export type RegionId = bigint;

export interface FilterState {
  propertyType: PT;
  months: number;
}

export const PROPERTY_TYPE_LABELS: Record<PT, string> = {
  apartment: "아파트",
  villa: "빌라",
  land: "대지",
};

export const REGION_LEVEL_LABELS: Record<RL, string> = {
  province: "시/도",
  city: "시/군/구",
  district: "동/읍/면",
};
