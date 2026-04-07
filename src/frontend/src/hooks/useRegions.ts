import { createActor } from "@/backend";
import type { PropertyType } from "@/types";
import type { PropertyPrice, Region, RegionSummary } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

export function useRegionSummaries(propertyType: PropertyType) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<RegionSummary[]>({
    queryKey: ["regionSummaries", propertyType],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRegionSummaries(propertyType);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60_000,
  });
}

export function useRegionPrices(
  regionId: bigint | null,
  propertyType: PropertyType,
  months: number,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<PropertyPrice[]>({
    queryKey: ["regionPrices", regionId?.toString(), propertyType, months],
    queryFn: async () => {
      if (!actor || regionId === null) return [];
      return actor.getRegionPrices(regionId, propertyType, BigInt(months));
    },
    enabled: !!actor && !isFetching && regionId !== null,
    refetchInterval: 60_000,
  });
}

export function useSearchRegions(query: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Region[]>({
    queryKey: ["searchRegions", query],
    queryFn: async () => {
      if (!actor || !query.trim()) return [];
      return actor.searchRegions(query.trim());
    },
    enabled: !!actor && !isFetching && query.trim().length > 0,
  });
}

export function useCompareRegions(
  regionIds: bigint[],
  propertyType: PropertyType,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<PropertyPrice[]>({
    queryKey: [
      "compareRegions",
      regionIds.map((id) => id.toString()),
      propertyType,
    ],
    queryFn: async () => {
      if (!actor || regionIds.length === 0) return [];
      return actor.compareRegions(regionIds, propertyType);
    },
    enabled: !!actor && !isFetching && regionIds.length > 0,
    refetchInterval: 60_000,
  });
}

export function useRegions(parentId?: bigint) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Region[]>({
    queryKey: ["regions", parentId?.toString() ?? "root"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRegions(parentId ?? null);
    },
    enabled: !!actor && !isFetching,
  });
}
