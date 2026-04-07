import Types "../types/property";
import List "mo:core/List";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";

module {
  public type Region = Types.Region;
  public type PropertyPrice = Types.PropertyPrice;
  public type RegionSummary = Types.RegionSummary;
  public type PropertyType = Types.PropertyType;
  public type RegionId = Types.RegionId;

  // Returns all regions, optionally filtered by parentId
  public func getRegions(
    regions : List.List<Region>,
    parentId : ?RegionId
  ) : [Region] {
    switch (parentId) {
      case null {
        // Return only top-level regions (no parent)
        regions.filter(func(r) { r.parentId == null }).toArray()
      };
      case (?pid) {
        regions.filter(func(r) { r.parentId == ?pid }).toArray()
      };
    }
  };

  // Returns historical price data for a region/type, limited to `months` most recent
  public func getRegionPrices(
    prices : List.List<PropertyPrice>,
    regionId : RegionId,
    propertyType : PropertyType,
    months : Nat
  ) : [PropertyPrice] {
    let filtered = prices.filter(func(p) {
      p.regionId == regionId and p.propertyType == propertyType
    }).toArray();
    // Sort descending by month (YYYYMM text comparison works correctly)
    let sorted = filtered.sort(func(a, b) { Text.compare(b.month, a.month) });
    if (months == 0) { sorted }
    else { sorted.sliceToArray(0, months) }
  };

  // Returns all top-level regions with current (latest) price for a property type
  public func getRegionSummaries(
    regions : List.List<Region>,
    prices : List.List<PropertyPrice>,
    propertyType : PropertyType
  ) : [RegionSummary] {
    let topLevel = regions.filter(func(r) { r.parentId == null }).toArray();
    topLevel.map<Region, RegionSummary>(func(region) {
      let regionPrices = prices.filter(func(p) {
        p.regionId == region.id and p.propertyType == propertyType
      }).toArray();
      let sorted = regionPrices.sort(func(a, b) { Text.compare(b.month, a.month) });
      let latest : ?PropertyPrice = if (sorted.size() == 0) null else ?sorted[0];
      { region; latestPrice = latest }
    })
  };

  // Returns price data for multiple regions for comparison
  public func compareRegions(
    prices : List.List<PropertyPrice>,
    regionIds : [RegionId],
    propertyType : PropertyType
  ) : [PropertyPrice] {
    prices.filter(func(p) {
      p.propertyType == propertyType and
      regionIds.find(func(id) { id == p.regionId }) != null
    }).toArray()
      .sort(func(a, b) {
        let regionCmp = if (a.regionId < b.regionId) #less
                        else if (a.regionId > b.regionId) #greater
                        else #equal;
        switch (regionCmp) {
          case (#equal) Text.compare(b.month, a.month);
          case other other;
        }
      })
  };

  // Search regions by name (partial match)
  public func searchRegions(
    regions : List.List<Region>,
    queryText : Text
  ) : [Region] {
    let lower = queryText.toLower();
    regions.filter(func(r) { r.name.toLower().contains(#text lower) }).toArray()
  };

  // Admin: add a region (using the provided region as-is)
  public func addRegion(
    regions : List.List<Region>,
    _nextId : Nat,
    region : Region
  ) : () {
    regions.add(region)
  };

  // Admin: add a price record
  public func addPropertyPrice(
    prices : List.List<PropertyPrice>,
    price : PropertyPrice
  ) : () {
    prices.add(price)
  };

  // ─── Sample data helpers ──────────────────────────────────────────

  type RegionSpec = {
    id : RegionId;
    name : Text;
    parentId : ?RegionId;
    level : Types.RegionLevel;
  };

  // Build 17 provinces + sub-regions
  public func buildSampleRegions() : [Region] {
    // Top-level: 17 시/도 (id 1–17)
    // Sub-regions: id 100+
    [
      // 1 서울특별시
      { id = 1; name = "서울"; parentId = null; level = #province },
      { id = 101; name = "강남구"; parentId = ?1; level = #city },
      { id = 102; name = "서초구"; parentId = ?1; level = #city },
      { id = 103; name = "송파구"; parentId = ?1; level = #city },
      { id = 104; name = "마포구"; parentId = ?1; level = #city },
      { id = 105; name = "용산구"; parentId = ?1; level = #city },
      { id = 106; name = "성동구"; parentId = ?1; level = #city },
      { id = 107; name = "영등포구"; parentId = ?1; level = #city },
      { id = 108; name = "노원구"; parentId = ?1; level = #city },
      { id = 109; name = "도봉구"; parentId = ?1; level = #city },
      { id = 110; name = "강북구"; parentId = ?1; level = #city },
      // 2 부산광역시
      { id = 2; name = "부산"; parentId = null; level = #province },
      { id = 201; name = "해운대구"; parentId = ?2; level = #city },
      { id = 202; name = "수영구"; parentId = ?2; level = #city },
      { id = 203; name = "남구"; parentId = ?2; level = #city },
      { id = 204; name = "동구"; parentId = ?2; level = #city },
      { id = 205; name = "서구"; parentId = ?2; level = #city },
      // 3 대구광역시
      { id = 3; name = "대구"; parentId = null; level = #province },
      { id = 301; name = "수성구"; parentId = ?3; level = #city },
      { id = 302; name = "달서구"; parentId = ?3; level = #city },
      // 4 인천광역시
      { id = 4; name = "인천"; parentId = null; level = #province },
      { id = 401; name = "연수구"; parentId = ?4; level = #city },
      { id = 402; name = "남동구"; parentId = ?4; level = #city },
      // 5 광주광역시
      { id = 5; name = "광주"; parentId = null; level = #province },
      { id = 501; name = "북구"; parentId = ?5; level = #city },
      { id = 502; name = "서구"; parentId = ?5; level = #city },
      // 6 대전광역시
      { id = 6; name = "대전"; parentId = null; level = #province },
      { id = 601; name = "유성구"; parentId = ?6; level = #city },
      { id = 602; name = "서구"; parentId = ?6; level = #city },
      // 7 울산광역시
      { id = 7; name = "울산"; parentId = null; level = #province },
      { id = 701; name = "남구"; parentId = ?7; level = #city },
      { id = 702; name = "북구"; parentId = ?7; level = #city },
      // 8 세종특별자치시
      { id = 8; name = "세종"; parentId = null; level = #province },
      { id = 801; name = "조치원읍"; parentId = ?8; level = #city },
      // 9 경기도
      { id = 9; name = "경기"; parentId = null; level = #province },
      { id = 901; name = "수원시"; parentId = ?9; level = #city },
      { id = 902; name = "성남시"; parentId = ?9; level = #city },
      { id = 903; name = "용인시"; parentId = ?9; level = #city },
      { id = 904; name = "안양시"; parentId = ?9; level = #city },
      { id = 905; name = "고양시"; parentId = ?9; level = #city },
      // 10 강원특별자치도
      { id = 10; name = "강원"; parentId = null; level = #province },
      { id = 1001; name = "춘천시"; parentId = ?10; level = #city },
      { id = 1002; name = "원주시"; parentId = ?10; level = #city },
      // 11 충청북도
      { id = 11; name = "충북"; parentId = null; level = #province },
      { id = 1101; name = "청주시"; parentId = ?11; level = #city },
      { id = 1102; name = "충주시"; parentId = ?11; level = #city },
      // 12 충청남도
      { id = 12; name = "충남"; parentId = null; level = #province },
      { id = 1201; name = "천안시"; parentId = ?12; level = #city },
      { id = 1202; name = "아산시"; parentId = ?12; level = #city },
      // 13 전라북도
      { id = 13; name = "전북"; parentId = null; level = #province },
      { id = 1301; name = "전주시"; parentId = ?13; level = #city },
      { id = 1302; name = "군산시"; parentId = ?13; level = #city },
      // 14 전라남도
      { id = 14; name = "전남"; parentId = null; level = #province },
      { id = 1401; name = "목포시"; parentId = ?14; level = #city },
      { id = 1402; name = "여수시"; parentId = ?14; level = #city },
      // 15 경상북도
      { id = 15; name = "경북"; parentId = null; level = #province },
      { id = 1501; name = "포항시"; parentId = ?15; level = #city },
      { id = 1502; name = "구미시"; parentId = ?15; level = #city },
      // 16 경상남도
      { id = 16; name = "경남"; parentId = null; level = #province },
      { id = 1601; name = "창원시"; parentId = ?16; level = #city },
      { id = 1602; name = "진주시"; parentId = ?16; level = #city },
      // 17 제주특별자치도
      { id = 17; name = "제주"; parentId = null; level = #province },
      { id = 1701; name = "제주시"; parentId = ?17; level = #city },
      { id = 1702; name = "서귀포시"; parentId = ?17; level = #city },
    ]
  };

  // Base average prices per region per property type (만원)
  // Apartment base prices — reflects realistic Korean market
  func baseApartment(regionId : RegionId) : Nat {
    switch (regionId) {
      case 1   120000; // 서울 평균 ~12억
      case 101  200000; // 강남구 ~20억
      case 102  180000; // 서초구 ~18억
      case 103  170000; // 송파구 ~17억
      case 104  120000; // 마포구 ~12억
      case 105  160000; // 용산구 ~16억
      case 106  130000; // 성동구 ~13억
      case 107  110000; // 영등포구 ~11억
      case 108   70000; // 노원구 ~7억
      case 109   60000; // 도봉구 ~6억
      case 110   55000; // 강북구 ~5.5억
      case 2    50000; // 부산 ~5억
      case 201   80000; // 해운대구 ~8억
      case 202   70000; // 수영구 ~7억
      case 203   55000; // 남구 ~5.5억
      case 204   40000; // 동구 ~4억
      case 205   38000; // 서구 ~3.8억
      case 3    35000; // 대구 ~3.5억
      case 301   50000; // 수성구 ~5억
      case 302   28000; // 달서구 ~2.8억
      case 4    45000; // 인천 ~4.5억
      case 401   50000; // 연수구 ~5억
      case 402   38000; // 남동구 ~3.8억
      case 5    25000; // 광주 ~2.5억
      case 501   27000; // 북구 ~2.7억
      case 502   26000; // 서구 ~2.6억
      case 6    30000; // 대전 ~3억
      case 601   38000; // 유성구 ~3.8억
      case 602   27000; // 서구 ~2.7억
      case 7    30000; // 울산 ~3억
      case 701   35000; // 남구 ~3.5억
      case 702   25000; // 북구 ~2.5억
      case 8    38000; // 세종 ~3.8억
      case 801   32000; // 조치원읍 ~3.2억
      case 9    65000; // 경기 ~6.5억
      case 901   60000; // 수원시 ~6억
      case 902   90000; // 성남시 ~9억
      case 903   70000; // 용인시 ~7억
      case 904   50000; // 안양시 ~5억
      case 905   58000; // 고양시 ~5.8억
      case 10   17000; // 강원 ~1.7억
      case 1001  20000; // 춘천시 ~2억
      case 1002  18000; // 원주시 ~1.8억
      case 11   20000; // 충북 ~2억
      case 1101  25000; // 청주시 ~2.5억
      case 1102  17000; // 충주시 ~1.7억
      case 12   22000; // 충남 ~2.2억
      case 1201  30000; // 천안시 ~3억
      case 1202  27000; // 아산시 ~2.7억
      case 13   18000; // 전북 ~1.8억
      case 1301  22000; // 전주시 ~2.2억
      case 1302  14000; // 군산시 ~1.4억
      case 14   14000; // 전남 ~1.4억
      case 1401  16000; // 목포시 ~1.6억
      case 1402  18000; // 여수시 ~1.8억
      case 15   18000; // 경북 ~1.8억
      case 1501  22000; // 포항시 ~2.2억
      case 1502  20000; // 구미시 ~2억
      case 16   22000; // 경남 ~2.2억
      case 1601  28000; // 창원시 ~2.8억
      case 1602  18000; // 진주시 ~1.8억
      case 17   40000; // 제주 ~4억
      case 1701  42000; // 제주시 ~4.2억
      case 1702  35000; // 서귀포시 ~3.5억
      case _    20000;
    }
  };

  func baseVilla(regionId : RegionId) : Nat {
    // Villa ~45-50% of apartment
    baseApartment(regionId) * 48 / 100
  };

  // Land price per ㎡ in 만원 — separate scale from apartment
  func baseLand(regionId : RegionId) : Nat {
    switch (regionId) {
      case 1   5000;  // 서울 ~5000만원/㎡
      case 101  8000;  // 강남구
      case 102  7500;  // 서초구
      case 103  7000;  // 송파구
      case 104  5000;  // 마포구
      case 105  6500;  // 용산구
      case 106  5200;  // 성동구
      case 107  4500;  // 영등포구
      case 108  3000;  // 노원구
      case 109  2800;  // 도봉구
      case 110  2500;  // 강북구
      case 2    800;  // 부산
      case 201  1500;  // 해운대구
      case 202  1200;  // 수영구
      case 203   900;  // 남구
      case 204   600;  // 동구
      case 205   550;  // 서구
      case 3    500;  // 대구
      case 301   900;  // 수성구
      case 302   450;  // 달서구
      case 4    600;  // 인천
      case 401   800;  // 연수구
      case 402   550;  // 남동구
      case 5    350;  // 광주
      case 501   400;  // 북구
      case 502   380;  // 서구
      case 6    400;  // 대전
      case 601   600;  // 유성구
      case 602   380;  // 서구
      case 7    400;  // 울산
      case 701   500;  // 남구
      case 702   350;  // 북구
      case 8    700;  // 세종
      case 801   500;  // 조치원읍
      case 9   1200;  // 경기
      case 901  1000;  // 수원시
      case 902  1800;  // 성남시
      case 903  1200;  // 용인시
      case 904   900;  // 안양시
      case 905  1000;  // 고양시
      case 10   200;  // 강원
      case 1001   300;  // 춘천시
      case 1002   280;  // 원주시
      case 11   250;  // 충북
      case 1101   400;  // 청주시
      case 1102   200;  // 충주시
      case 12   280;  // 충남
      case 1201   500;  // 천안시
      case 1202   450;  // 아산시
      case 13   220;  // 전북
      case 1301   350;  // 전주시
      case 1302   180;  // 군산시
      case 14   200;  // 전남
      case 1401   250;  // 목포시
      case 1402   280;  // 여수시
      case 15   220;  // 경북
      case 1501   350;  // 포항시
      case 1502   300;  // 구미시
      case 16   280;  // 경남
      case 1601   480;  // 창원시
      case 1602   250;  // 진주시
      case 17   800;  // 제주
      case 1701   900;  // 제주시
      case 1702   700;  // 서귀포시
      case _    300;
    }
  };

  func basePrice(regionId : RegionId, pt : PropertyType) : Nat {
    switch (pt) {
      case (#apartment) baseApartment(regionId);
      case (#villa)     baseVilla(regionId);
      case (#land)      baseLand(regionId);
    }
  };

  // Monthly trend deltas (12 months, index 0 = 202401, index 11 = 202412)
  // Values are basis points applied to prevPrice (100 = 1%)
  // Seoul/Gyeonggi: steady upward; regional cities: stable/slight decrease
  func trendDelta(regionId : RegionId, monthIdx : Nat) : Int {
    // Upward markets: 서울 core + 경기 + 세종
    let upward  : [Int] = [ 50,  60,  80, 100, 120, 130, 110,  90,  80,  70,  60,  50 ];
    // Moderate up: 부산 premium, 인천 연수구, 대전 유성구
    let modUp   : [Int] = [ 20,  30,  40,  50,  60,  50,  40,  30,  20,  20,  25,  30 ];
    // Flat: most provincial cities
    let flat  : [Int] = [  0,   5,  10,   5,   0,  -5,  -5,   0,   5,  10,   5,   0 ];
    // Slight decline: smaller regional cities
    let decline : [Int] = [ -20, -15, -10,  -5,  -5, -10, -15, -20, -15, -10,  -5,   0 ];

    // Classify region into trend bucket
    let isUpward = regionId == 1 or regionId == 101 or regionId == 102 or
                   regionId == 103 or regionId == 104 or regionId == 105 or
                   regionId == 106 or regionId == 107 or regionId == 9 or
                   regionId == 901 or regionId == 902 or regionId == 903 or
                   regionId == 904 or regionId == 905 or regionId == 8 or
                   regionId == 801;
    let isModUp  = regionId == 108 or regionId == 109 or regionId == 110 or
                   regionId == 201 or regionId == 202 or regionId == 4 or
                   regionId == 401;
    let isStable = regionId == 2 or regionId == 203 or regionId == 204 or
                   regionId == 205 or regionId == 601 or regionId == 701 or
                   regionId == 3 or regionId == 301 or regionId == 6 or
                   regionId == 602 or regionId == 7 or regionId == 702 or
                   regionId == 402;

    let pattern = if (isUpward) upward
                  else if (isModUp) modUp
                  else if (isStable) flat
                  else decline;

    if (monthIdx < 12) pattern[monthIdx] else 0
  };

  // Produce YYYYMM strings for 12 months: 202401 … 202412
  func yearMonth(monthIdx : Nat) : Text {
    let m = monthIdx + 1;
    let ms = if (m < 10) "0" # m.toText() else m.toText();
    "2024" # ms
  };

  // Build all sample price records
  public func buildSamplePrices(regions : [Region]) : [PropertyPrice] {
    let pts : [PropertyType] = [#apartment, #villa, #land];
    var result : [PropertyPrice] = [];
    for (region in regions.values()) {
      for (pt in pts.values()) {
        let base = basePrice(region.id, pt);
        var prevPrice : Int = base.toInt();
        for (mi in Nat.range(0, 12)) {
          let delta = trendDelta(region.id, mi);
          // delta is basis points * 10 — apply as fractional change on base
          let change : Int = prevPrice * delta / 10000;
          let newPrice : Int = prevPrice + change;
          let newPriceNat : Nat = if (newPrice > 0) newPrice.toNat() else 1000;
          let pricePerSqm : Nat = newPriceNat / 30; // rough 30평 unit
          let record : PropertyPrice = {
            regionId = region.id;
            propertyType = pt;
            averagePrice = newPriceNat;
            pricePerSqm = pricePerSqm;
            month = yearMonth(mi);
            changeFromPrevMonth = change;
            changePercent = if (prevPrice > 0) (change * 10000 / prevPrice) else 0;
          };
          result := result.concat([record]);
          prevPrice := newPrice;
        };
      };
    };
    result
  };
};
