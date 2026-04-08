import Types "../types/property";
import List "mo:core/List";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Iter "mo:core/Iter";

module {
  public type Region = Types.Region;
  public type PropertyPrice = Types.PropertyPrice;
  public type RegionSummary = Types.RegionSummary;
  public type PropertyType = Types.PropertyType;
  public type RegionId = Types.RegionId;

  // IC management canister interface for HTTP outcalls
  type HttpHeader = { name : Text; value : Text };
  type HttpRequestArgs = {
    url : Text;
    max_response_bytes : ?Nat64;
    method : { #get; #head; #post };
    headers : [HttpHeader];
    body : ?Blob;
    transform : ?{
      function : shared ({ response : HttpRequestResult; context : Blob }) -> async HttpRequestResult;
      context : Blob;
    };
    is_replicated : ?Bool;
  };
  type HttpRequestResult = {
    status : Nat;
    headers : [HttpHeader];
    body : Blob;
  };

  let ic : actor {
    http_request : HttpRequestArgs -> async HttpRequestResult;
  } = actor "aaaaa-aa";

  // Returns all regions, optionally filtered by parentId
  public func getRegions(
    regions : List.List<Region>,
    parentId : ?RegionId
  ) : [Region] {
    switch (parentId) {
      case null {
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

  // ─── Date helpers ──────────────────────────────────────────────────

  // Compute current year/month from Time.now() (nanoseconds since epoch)
  // Time.now() is nanoseconds; 1 second = 1_000_000_000 ns
  func currentYearMonth() : (Nat, Nat) {
    let nowNs : Int = Time.now();
    // seconds since Unix epoch
    let nowSec : Int = nowNs / 1_000_000_000;
    // Days since epoch
    let totalDays : Int = nowSec / 86400;
    // Use a simple algorithm to get year/month from days since 1970-01-01
    // Using the algorithm from https://howardhinnant.github.io/date_algorithms.html
    let z = totalDays + 719468;
    let era = if (z >= 0) z / 146097 else (z - 146096) / 146097;
    let doe = z - era * 146097;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let m = if (mp < 10) mp + 3 else mp - 9;
    let yearVal = if (m <= 2) y + 1 else y;
    (yearVal.toNat(), m.toNat())
  };

  // Build YYYYMM string for a month offset from current month
  // offset 0 = current month, offset -1 = previous month, etc.
  func yearMonthOffset(offsetMonths : Int) : Text {
    let (curYear, curMonth) = currentYearMonth();
    let totalMonths : Int = curYear.toInt() * 12 + (curMonth.toInt() - 1) + offsetMonths;
    let y = totalMonths / 12;
    let m = (totalMonths % 12) + 1;
    let mNat = m.toNat();
    let ms = if (mNat < 10) "0" # mNat.toText() else mNat.toText();
    y.toText() # ms
  };

  // Build last 12 months of YYYYMM strings, index 0 = 12 months ago, index 11 = current month
  func buildMonthList() : [Text] {
    Array.tabulate<Text>(12, func(i) {
      yearMonthOffset(-11 + i.toInt())
    })
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

  // Base average prices per region (만원) — updated for 2025-2026 market
  func baseApartment(regionId : RegionId) : Nat {
    switch (regionId) {
      case 1   135000; // 서울 평균 ~13.5억 (2026)
      case 101  230000; // 강남구 ~23억
      case 102  210000; // 서초구 ~21억
      case 103  195000; // 송파구 ~19.5억
      case 104  140000; // 마포구 ~14억
      case 105  185000; // 용산구 ~18.5억
      case 106  155000; // 성동구 ~15.5억
      case 107  125000; // 영등포구 ~12.5억
      case 108   82000; // 노원구 ~8.2억
      case 109   70000; // 도봉구 ~7억
      case 110   63000; // 강북구 ~6.3억
      case 2    57000; // 부산 ~5.7억
      case 201   92000; // 해운대구 ~9.2억
      case 202   80000; // 수영구 ~8억
      case 203   63000; // 남구 ~6.3억
      case 204   46000; // 동구 ~4.6억
      case 205   43000; // 서구 ~4.3억
      case 3    38000; // 대구 ~3.8억
      case 301   56000; // 수성구 ~5.6억
      case 302   32000; // 달서구 ~3.2억
      case 4    52000; // 인천 ~5.2억
      case 401   58000; // 연수구 ~5.8억
      case 402   43000; // 남동구 ~4.3억
      case 5    28000; // 광주 ~2.8억
      case 501   30000; // 북구 ~3억
      case 502   29000; // 서구 ~2.9억
      case 6    34000; // 대전 ~3.4억
      case 601   43000; // 유성구 ~4.3억
      case 602   31000; // 서구 ~3.1억
      case 7    33000; // 울산 ~3.3억
      case 701   39000; // 남구 ~3.9억
      case 702   28000; // 북구 ~2.8억
      case 8    45000; // 세종 ~4.5억
      case 801   37000; // 조치원읍 ~3.7억
      case 9    78000; // 경기 ~7.8억
      case 901   72000; // 수원시 ~7.2억
      case 902  110000; // 성남시 ~11억 (분당)
      case 903   85000; // 용인시 ~8.5억
      case 904   60000; // 안양시 ~6억
      case 905   70000; // 고양시 ~7억
      case 10   19000; // 강원 ~1.9억
      case 1001  22000; // 춘천시 ~2.2억
      case 1002  20000; // 원주시 ~2억
      case 11   22000; // 충북 ~2.2억
      case 1101  28000; // 청주시 ~2.8억
      case 1102  19000; // 충주시 ~1.9억
      case 12   24000; // 충남 ~2.4억
      case 1201  34000; // 천안시 ~3.4억
      case 1202  31000; // 아산시 ~3.1억
      case 13   19000; // 전북 ~1.9억
      case 1301  24000; // 전주시 ~2.4억
      case 1302  15000; // 군산시 ~1.5억
      case 14   15000; // 전남 ~1.5억
      case 1401  17000; // 목포시 ~1.7억
      case 1402  20000; // 여수시 ~2억
      case 15   19000; // 경북 ~1.9억
      case 1501  24000; // 포항시 ~2.4억
      case 1502  22000; // 구미시 ~2.2억
      case 16   24000; // 경남 ~2.4억
      case 1601  31000; // 창원시 ~3.1억
      case 1602  20000; // 진주시 ~2억
      case 17   46000; // 제주 ~4.6억
      case 1701  48000; // 제주시 ~4.8억
      case 1702  40000; // 서귀포시 ~4억
      case _    22000;
    }
  };

  func baseVilla(regionId : RegionId) : Nat {
    baseApartment(regionId) * 48 / 100
  };

  func baseLand(regionId : RegionId) : Nat {
    switch (regionId) {
      case 1   5800;
      case 101  9500;
      case 102  9000;
      case 103  8500;
      case 104  6000;
      case 105  7800;
      case 106  6300;
      case 107  5400;
      case 108  3500;
      case 109  3200;
      case 110  2900;
      case 2    950;
      case 201  1800;
      case 202  1450;
      case 203  1050;
      case 204   700;
      case 205   640;
      case 3    580;
      case 301  1050;
      case 302   520;
      case 4    720;
      case 401   950;
      case 402   640;
      case 5    400;
      case 501   460;
      case 502   440;
      case 6    460;
      case 601   700;
      case 602   440;
      case 7    460;
      case 701   580;
      case 702   400;
      case 8    820;
      case 801   580;
      case 9   1450;
      case 901  1200;
      case 902  2200;
      case 903  1450;
      case 904  1080;
      case 905  1200;
      case 10   230;
      case 1001   350;
      case 1002   320;
      case 11   290;
      case 1101   460;
      case 1102   230;
      case 12   320;
      case 1201   580;
      case 1202   520;
      case 13   250;
      case 1301   400;
      case 1302   210;
      case 14   230;
      case 1401   290;
      case 1402   320;
      case 15   250;
      case 1501   400;
      case 1502   350;
      case 16   320;
      case 1601   560;
      case 1602   290;
      case 17   950;
      case 1701  1050;
      case 1702   820;
      case _    350;
    }
  };

  func basePrice(regionId : RegionId, pt : PropertyType) : Nat {
    switch (pt) {
      case (#apartment) baseApartment(regionId);
      case (#villa)     baseVilla(regionId);
      case (#land)      baseLand(regionId);
    }
  };

  // Monthly trend deltas for 12 months relative to base price
  // Values are basis points (100 = 1%). Applied sequentially from 12 months ago.
  // 2025~2026 trend: Seoul/Gyeonggi continued strong recovery; regional cities moderate
  func trendDelta(regionId : RegionId, monthIdx : Nat) : Int {
    // Strong upward: 서울 핵심 + 경기 + 세종
    let upward  : [Int] = [ 80, 100, 120, 130, 140, 150, 140, 130, 120, 110, 100,  90 ];
    // Moderate up: 부산 premium, 인천, 대전 유성구
    let modUp   : [Int] = [ 30,  40,  50,  60,  70,  60,  50,  40,  35,  35,  40,  45 ];
    // Flat: most provincial cities
    let flat    : [Int] = [  0,   5,  10,   5,   0,   0,   5,  10,   5,   0,   5,   5 ];
    // Slight decline: smaller regional cities
    let decline : [Int] = [ -10,  -5,   0,  -5, -10, -15, -10,  -5,  -5,   0,   5,   5 ];

    let isUpward = regionId == 1 or regionId == 101 or regionId == 102 or
                   regionId == 103 or regionId == 104 or regionId == 105 or
                   regionId == 106 or regionId == 107 or regionId == 9 or
                   regionId == 901 or regionId == 902 or regionId == 903 or
                   regionId == 904 or regionId == 905 or regionId == 8 or
                   regionId == 801;
    let isModUp  = regionId == 108 or regionId == 109 or regionId == 110 or
                   regionId == 201 or regionId == 202 or regionId == 4 or
                   regionId == 401 or regionId == 2 or regionId == 6 or
                   regionId == 601;
    let isStable = regionId == 203 or regionId == 204 or regionId == 205 or
                   regionId == 602 or regionId == 701 or regionId == 3 or
                   regionId == 301 or regionId == 7 or regionId == 702 or
                   regionId == 402 or regionId == 17 or regionId == 1701 or
                   regionId == 1702;

    let pattern = if (isUpward) upward
                  else if (isModUp) modUp
                  else if (isStable) flat
                  else decline;

    if (monthIdx < 12) pattern[monthIdx] else 0
  };

  // Build all sample price records using dynamically calculated recent months
  public func buildSamplePrices(regions : [Region]) : [PropertyPrice] {
    let pts : [PropertyType] = [#apartment, #villa, #land];
    let months = buildMonthList(); // last 12 months from today
    var result : [PropertyPrice] = [];
    for (region in regions.values()) {
      for (pt in pts.values()) {
        let base = basePrice(region.id, pt);
        var prevPrice : Int = base.toInt();
        for (mi in Nat.range(0, 12)) {
          let delta = trendDelta(region.id, mi);
          let change : Int = prevPrice * delta / 10000;
          let newPrice : Int = prevPrice + change;
          let newPriceNat : Nat = if (newPrice > 0) newPrice.toNat() else 1000;
          let pricePerSqm : Nat = newPriceNat / 30;
          let record : PropertyPrice = {
            regionId = region.id;
            propertyType = pt;
            averagePrice = newPriceNat;
            pricePerSqm = pricePerSqm;
            month = months[mi];
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

  // ─── 국토교통부 API Integration ────────────────────────────────────

  // Map regionId to LAWD_CD (법정동코드 앞 5자리)
  func getLawdCd(regionId : RegionId) : ?Text {
    switch (regionId) {
      case 1   ?"11110"; // 서울 → 종로구 (representative)
      case 101  ?"11680"; // 강남구
      case 102  ?"11650"; // 서초구
      case 103  ?"11710"; // 송파구
      case 104  ?"11440"; // 마포구
      case 105  ?"11170"; // 용산구
      case 106  ?"11200"; // 성동구
      case 107  ?"11560"; // 영등포구
      case 108  ?"11350"; // 노원구
      case 109  ?"11320"; // 도봉구
      case 110  ?"11305"; // 강북구
      case 2   ?"21110"; // 부산 중구 (representative)
      case 201  ?"21710"; // 해운대구
      case 202  ?"21740"; // 수영구
      case 203  ?"21680"; // 남구
      case 204  ?"21130"; // 서구
      case 205  ?"21140"; // 동구
      case 3   ?"22110"; // 대구 중구 (representative)
      case 301  ?"22710"; // 수성구
      case 302  ?"22530"; // 달서구
      case 4   ?"23110"; // 인천 중구 (representative)
      case 401  ?"23720"; // 연수구
      case 402  ?"23740"; // 남동구
      case 5   ?"29110"; // 광주 동구 (representative)
      case 501  ?"29170"; // 북구
      case 502  ?"29140"; // 서구
      case 6   ?"30110"; // 대전 동구 (representative)
      case 601  ?"30200"; // 유성구
      case 602  ?"30140"; // 서구
      case 7   ?"31110"; // 울산 중구 (representative)
      case 701  ?"31140"; // 남구
      case 702  ?"31170"; // 북구
      case 8   ?"36110"; // 세종
      case 9   ?"41110"; // 경기 수원 장안구 (representative)
      case 901  ?"41111"; // 수원시
      case 902  ?"41130"; // 성남시
      case 903  ?"41460"; // 용인시
      case 904  ?"41170"; // 안양시
      case 905  ?"41280"; // 고양시
      case _    null;
    }
  };

  // Parse a simple XML text value by tag name (naive but sufficient for this API)
  func parseXmlValue(xml : Text, tag : Text) : ?Text {
    let openTag = "<" # tag # ">";
    let closeTag = "</" # tag # ">";
    // Find open tag position
    switch (xml.stripStart(#text openTag)) {
      case null {
        // search within XML by splitting on open tag
        let parts = xml.split(#text openTag);
        var found : ?Text = null;
        var first = true;
        for (part in parts) {
          if (first) { first := false }
          else if (found == null) {
            switch (part.stripEnd(#text (part.size().toText()))) {
              case _ {
                // split on close tag
                let inner = part.split(#text closeTag);
                switch (inner.next()) {
                  case (?v) { found := ?v };
                  case null {};
                };
              };
            };
          };
        };
        found
      };
      case (?rest) {
        let inner = rest.split(#text closeTag);
        inner.next()
      };
    }
  };

  // Extract all values of a repeating tag from XML
  func _extractAllTagValues(xml : Text, tag : Text) : [Text] {
    let openTag = "<" # tag # ">";
    let closeTag = "</" # tag # ">";
    let parts = xml.split(#text openTag);
    var results : [Text] = [];
    var first = true;
    for (part in parts) {
      if (first) { first := false }
      else {
        let inner = part.split(#text closeTag);
        switch (inner.next()) {
          case (?v) { results := results.concat([v.trim(#char ' ')]) };
          case null {};
        };
      };
    };
    results
  };

  // Count occurrences of <item> in XML response
  func _countItems(xml : Text) : Nat {
    let parts = xml.split(#text "<item>");
    var count = 0;
    var first = true;
    for (_ in parts) {
      if (first) { first := false }
      else { count += 1 };
    };
    count
  };

  // Extract <item> blocks from XML
  func extractItems(xml : Text) : [Text] {
    let parts = xml.split(#text "<item>");
    var items : [Text] = [];
    var first = true;
    for (part in parts) {
      if (first) { first := false }
      else {
        let inner = part.split(#text "</item>");
        switch (inner.next()) {
          case (?item) { items := items.concat([item]) };
          case null {};
        };
      };
    };
    items
  };

  // Parse 거래금액 text (e.g. "150,000" or "15,000") to 만원 Nat
  func parseAmount(s : Text) : ?Nat {
    // Remove commas and whitespace
    let cleaned = s.replace(#char ',', "").trim(#char ' ');
    cleaned.toNat()
  };

  // API endpoint for apartment transactions
  let API_KEY = "52a00fe7cf4d4301b57ac9606467659d";
  let APT_URL = "https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade";

  // Fetch apartment prices for a single district/month from 국토교통부 API
  // Returns average price in 만원 or null if API fails
  public func fetchAptAvgPrice(lawdCd : Text, dealYmd : Text) : async ?Nat {
    let url = APT_URL # "?serviceKey=" # API_KEY #
              "&LAWD_CD=" # lawdCd #
              "&DEAL_YMD=" # dealYmd #
              "&numOfRows=100&pageNo=1";
    try {
      let response = await ic.http_request({
        url = url;
        max_response_bytes = ?200_000;
        method = #get;
        headers = [{ name = "Accept"; value = "application/xml" }];
        body = null;
        transform = null;
        is_replicated = ?false;
      });
      if (response.status == 200) {
        switch (response.body.decodeUtf8()) {
          case (?xmlText) {
            let items = extractItems(xmlText);
            if (items.size() == 0) { return null };
            var total : Nat = 0;
            var count : Nat = 0;
            for (item in items.values()) {
              switch (parseXmlValue(item, "거래금액")) {
                case (?amtStr) {
                  switch (parseAmount(amtStr)) {
                    case (?amt) {
                      total += amt;
                      count += 1;
                    };
                    case null {};
                  };
                };
                case null {};
              };
            };
            if (count > 0) ?( total / count ) else null
          };
          case null null;
        };
      } else { null };
    } catch _ { null };
  };

  // Fetch API prices for key regions for the last 3 months and build a full 12-month set
  // Returns a list of PropertyPrice records, or empty list on complete failure
  public func fetchAndBuildApiPrices(regions : [Region]) : async [PropertyPrice] {
    let months = buildMonthList();
    // Only fetch the 3 most recent months to limit API call count
    let recentMonths = months.sliceToArray(9, 12); // indices 9,10,11 = last 3 months
    var apiPrices : [PropertyPrice] = [];

    for (region in regions.values()) {
      switch (getLawdCd(region.id)) {
        case (?lawdCd) {
          // Fetch data for recent 3 months
          var monthPrices : [(Text, ?Nat)] = [];
          for (ym in recentMonths.values()) {
            let avgPrice = await fetchAptAvgPrice(lawdCd, ym);
            monthPrices := monthPrices.concat([(ym, avgPrice)]);
          };

          // Build 12-month series: extrapolate backwards for the first 9 months
          // using base prices and trend deltas, then use API data for the last 3
          let base = basePrice(region.id, #apartment);
          var prevPrice : Int = base.toInt();

          // First compute prices for all 12 months using sample logic
          var sampleMonthPrices : [Nat] = [];
          for (mi in Nat.range(0, 12)) {
            let delta = trendDelta(region.id, mi);
            let change : Int = prevPrice * delta / 10000;
            let newPrice : Int = prevPrice + change;
            let newPriceNat : Nat = if (newPrice > 0) newPrice.toNat() else 1000;
            sampleMonthPrices := sampleMonthPrices.concat([newPriceNat]);
            prevPrice := newPrice;
          };

          // Override last 3 months with API data where available
          var finalPrices : [Nat] = sampleMonthPrices;
          for (i in Nat.range(0, 3)) {
            let idx = 9 + i;
            let (_, apiPrice) = monthPrices[i];
            switch (apiPrice) {
              case (?p) {
                finalPrices := Array.tabulate<Nat>(12, func(j) {
                  if (j == idx) p else finalPrices[j]
                });
              };
              case null {};
            };
          };

          // Build PropertyPrice records for apartment
          var lastPrice : Nat = if (finalPrices.size() > 0) finalPrices[0] else base;
          for (mi in Nat.range(0, 12)) {
            let curPrice = finalPrices[mi];
            let changeAmt : Int = curPrice.toInt() - lastPrice.toInt();
            let changePct : Int = if (lastPrice > 0) (changeAmt * 10000 / lastPrice.toInt()) else 0;
            let record : PropertyPrice = {
              regionId = region.id;
              propertyType = #apartment;
              averagePrice = curPrice;
              pricePerSqm = curPrice / 30;
              month = months[mi];
              changeFromPrevMonth = changeAmt;
              changePercent = changePct;
            };
            apiPrices := apiPrices.concat([record]);
            lastPrice := curPrice;
          };
        };
        case null {
          // No LAWD_CD mapping — skip (will be filled by fallback)
        };
      };
    };
    apiPrices
  };
};
