import Types "types/property";
import PropertyMixin "mixins/property-api";
import List "mo:core/List";

actor {
  let regions = List.empty<Types.Region>();
  let prices = List.empty<Types.PropertyPrice>();
  var nextRegionIdVal : Nat = 1;
  let nextRegionId = { var val = nextRegionIdVal };
  let lastUpdated = { var val : Int = 0 };

  include PropertyMixin(regions, prices, nextRegionId, lastUpdated);
};
