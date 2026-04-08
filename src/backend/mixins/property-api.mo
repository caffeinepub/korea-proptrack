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

  // 가격 데이터 새로고침: 국토교통부 API 호출 시도 후 실패 시 샘플 데이터 사용
  public shared ({ caller = _ }) func refreshPrices() : async () {
    let currentRegions = regions.toArray();

    // 지역이 없으면 먼저 초기화
    if (currentRegions.size() == 0) {
      let sampleRegions = PropertyLib.buildSampleRegions();
      for (r in sampleRegions.values()) {
        regions.add(r);
      };
      nextRegionId.val := 2000;
    };

    let allRegions = regions.toArray();

    // 국토교통부 API로 아파트 실거래가 데이터 가져오기 시도
    let apiPrices = await PropertyLib.fetchAndBuildApiPrices(allRegions);

    prices.clear();

    if (apiPrices.size() > 0) {
      // API 데이터 사용 (아파트만): 다른 부동산 유형은 샘플 데이터로 채움
      let sampleAll = PropertyLib.buildSamplePrices(allRegions);

      // 샘플 데이터 중 villa/land만 추가
      for (p in sampleAll.values()) {
        switch (p.propertyType) {
          case (#apartment) {}; // API 데이터로 대체
          case _ { prices.add(p) };
        };
      };

      // API 아파트 데이터 추가
      for (p in apiPrices.values()) {
        prices.add(p);
      };

      // API 데이터가 없는 지역의 아파트는 샘플 데이터로 채움
      // (getLawdCd가 null을 반환한 지역들)
      for (p in sampleAll.values()) {
        switch (p.propertyType) {
          case (#apartment) {
            let hasApiData = apiPrices.find(func(ap) {
              ap.regionId == p.regionId and ap.month == p.month
            }) != null;
            if (not hasApiData) {
              prices.add(p);
            };
          };
          case _ {};
        };
      };
    } else {
      // API 완전 실패: 샘플 데이터로 폴백
      let samplePrices = PropertyLib.buildSamplePrices(allRegions);
      for (p in samplePrices.values()) {
        prices.add(p);
      };
    };

    lastUpdated.val := Time.now();
  };

  // 샘플 데이터 초기화 (앱 최초 로드 시 호출)
  public shared ({ caller = _ }) func initSampleData() : async () {
    // 지역 데이터가 없으면 먼저 초기화
    if (regions.isEmpty()) {
      let sampleRegions = PropertyLib.buildSampleRegions();
      for (r in sampleRegions.values()) {
        regions.add(r);
      };
      nextRegionId.val := 2000;
    };

    // 가격 데이터는 항상 새로 생성 (최신 시세 반영, 2026년 4월까지)
    prices.clear();
    let currentRegions = regions.toArray();
    let samplePrices = PropertyLib.buildSamplePrices(currentRegions);
    for (p in samplePrices.values()) {
      prices.add(p);
    };
    lastUpdated.val := Time.now();

    // 백그라운드에서 국토교통부 API 데이터로 아파트 가격 업데이트 시도
    // (비동기로 실행되어 initSampleData는 즉시 반환)
    ignore (async {
      let apiPrices = await PropertyLib.fetchAndBuildApiPrices(currentRegions);
      if (apiPrices.size() > 0) {
        // API 아파트 데이터로 샘플 아파트 데이터 교체
        let nonAptPrices = prices.filter(func(p) {
          switch (p.propertyType) {
            case (#apartment) false;
            case _ true;
          }
        }).toArray();
        prices.clear();
        for (p in nonAptPrices.values()) {
          prices.add(p);
        };
        for (p in apiPrices.values()) {
          prices.add(p);
        };
        // Fill missing apartment regions with sample data
        let sampleAll = PropertyLib.buildSamplePrices(currentRegions);
        for (p in sampleAll.values()) {
          switch (p.propertyType) {
            case (#apartment) {
              let hasApiData = apiPrices.find(func(ap) {
                ap.regionId == p.regionId and ap.month == p.month
              }) != null;
              if (not hasApiData) {
                prices.add(p);
              };
            };
            case _ {};
          };
        };
        lastUpdated.val := Time.now();
      };
    });
  };
};
