import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RegionSummary {
    region: Region;
    latestPrice?: PropertyPrice;
}
export interface PropertyPrice {
    month: YearMonth;
    changeFromPrevMonth: bigint;
    propertyType: PropertyType;
    averagePrice: bigint;
    pricePerSqm: bigint;
    regionId: RegionId;
    changePercent: bigint;
}
export type RegionId = bigint;
export type YearMonth = string;
export interface Region {
    id: RegionId;
    name: string;
    level: RegionLevel;
    parentId?: RegionId;
}
export enum PropertyType {
    villa = "villa",
    land = "land",
    apartment = "apartment"
}
export enum RegionLevel {
    province = "province",
    city = "city",
    district = "district"
}
export interface backendInterface {
    addPropertyPrice(price: PropertyPrice): Promise<void>;
    addRegion(region: Region): Promise<RegionId>;
    compareRegions(regionIds: Array<RegionId>, propertyType: PropertyType): Promise<Array<PropertyPrice>>;
    getLastUpdated(): Promise<bigint>;
    getRegionPrices(regionId: RegionId, propertyType: PropertyType, months: bigint): Promise<Array<PropertyPrice>>;
    getRegionSummaries(propertyType: PropertyType): Promise<Array<RegionSummary>>;
    getRegions(parentId: RegionId | null): Promise<Array<Region>>;
    initSampleData(): Promise<void>;
    refreshPrices(): Promise<void>;
    searchRegions(queryText: string): Promise<Array<Region>>;
}
