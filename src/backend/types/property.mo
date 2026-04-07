import Common "common";

module {
  public type RegionId = Common.RegionId;
  public type YearMonth = Common.YearMonth;

  // 지역 계층 수준
  public type RegionLevel = {
    #province; // 시/도
    #city;     // 시/군/구
    #district; // 읍/면/동
  };

  public type Region = {
    id : RegionId;
    name : Text;
    parentId : ?RegionId;
    level : RegionLevel;
  };

  // 부동산 유형
  public type PropertyType = {
    #apartment; // 아파트
    #villa;     // 빌라/연립
    #land;      // 대지
  };

  public type PropertyPrice = {
    regionId : RegionId;
    propertyType : PropertyType;
    averagePrice : Nat;     // 만원 단위
    pricePerSqm : Nat;      // 만원/㎡ 단위
    month : YearMonth;      // YYYYMM
    changeFromPrevMonth : Int;   // 만원
    changePercent : Int;         // 소수점 2자리 * 100 (e.g. 1.50% → 150)
  };

  public type RegionSummary = {
    region : Region;
    latestPrice : ?PropertyPrice;
  };
};
