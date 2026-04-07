import Types "../types/property";
import PropertyLib "../lib/property";
import List "mo:core/List";
import Time "mo:core/Time";

mixin (
  regions : List.List<Types.Region>,
  prices : List.List<Types.PropertyPrice>,
  nextRegionId : { var val : Nat },
  lastUpdated : { var val : Int }
) {

  // 마지막 데이터 갱신 시각 조회 (나노초 타임스탬프)
  public query func getLastUpdated() : async Int {
    lastUpdated.val
  };

  // 모든 지역 조회 (선택적으로 상위 지역 필터링)
  public query func getRegions(parentId : ?Types.RegionId) : async [Types.Region] {
    PropertyLib.getRegions(regions, parentId)
  };

  // 지역별 부동산 가격 히스토리 조회
  public query func getRegionPrices(
    regionId : Types.RegionId,
    propertyType : Types.PropertyType,
    months : Nat
  ) : async [Types.PropertyPrice] {
    PropertyLib.getRegionPrices(prices, regionId, propertyType, months)
  };

  // 최상위 지역 요약 정보 조회 (최신 가격 포함)
  public query func getRegionSummaries(propertyType : Types.PropertyType) : async [Types.RegionSummary] {
    PropertyLib.getRegionSummaries(regions, prices, propertyType)
  };

  // 여러 지역 가격 비교
  public query func compareRegions(
    regionIds : [Types.RegionId],
    propertyType : Types.PropertyType
  ) : async [Types.PropertyPrice] {
    PropertyLib.compareRegions(prices, regionIds, propertyType)
  };

  // 지역명 검색
  public query func searchRegions(queryText : Text) : async [Types.Region] {
    PropertyLib.searchRegions(regions, queryText)
  };

  // 관리자: 지역 추가
  public shared ({ caller = _ }) func addRegion(region : Types.Region) : async Types.RegionId {
    let newId = nextRegionId.val;
    nextRegionId.val += 1;
    PropertyLib.addRegion(regions, newId, { region with id = newId });
    newId
  };

  // 관리자: 부동산 가격 데이터 추가
  public shared ({ caller = _ }) func addPropertyPrice(price : Types.PropertyPrice) : async () {
    PropertyLib.addPropertyPrice(prices, price)
  };

  // 가격 데이터 새로고침 (최신 샘플 가격으로 재생성)
  public shared ({ caller = _ }) func refreshPrices() : async () {
    prices.clear();
    let currentRegions = regions.toArray();
    let samplePrices = PropertyLib.buildSamplePrices(currentRegions);
    for (p in samplePrices.values()) {
      prices.add(p);
    };
    lastUpdated.val := Time.now();
  };

  // 샘플 데이터 초기화 (항상 최신 데이터로 갱신)
  public shared ({ caller = _ }) func initSampleData() : async () {
    // 지역 데이터가 없으면 먼저 초기화
    if (regions.isEmpty()) {
      let sampleRegions = PropertyLib.buildSampleRegions();
      for (r in sampleRegions.values()) {
        regions.add(r);
      };
      nextRegionId.val := 2000;
    };
    // 가격 데이터는 항상 새로 생성 (최신 시세 반영)
    prices.clear();
    let currentRegions = regions.toArray();
    let samplePrices = PropertyLib.buildSamplePrices(currentRegions);
    for (p in samplePrices.values()) {
      prices.add(p);
    };
    lastUpdated.val := Time.now();
  };
};
