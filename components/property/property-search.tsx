"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

function normalizeListingTypeParam(v: string): string {
  const s = v.trim().toLowerCase();
  if (s === "buy") return "sale";
  if (s === "rent") return "rent";
  return "";
}

// Inverse of normalizeListingTypeParam — turns the URL's stored value
// ("sale" / "rent") back into this component's internal Buy/Rent state
// ("buy" / "rent"), so a URL built by HeroSearch (?listingType=sale)
// pre-selects "Buy" here instead of silently landing on "All Types".
function listingTypeFromUrl(v: string | null): string {
  const s = (v ?? "").trim().toLowerCase();
  if (s === "sale") return "buy";
  if (s === "rent") return "rent";
  return "";
}

// Matches a row's raw listing_type value against the selected filter
// ("" = all, "buy" = sale-type rows, "rent" = rent-type rows). Used as a
// client-side safety net in case the backend doesn't honor listing_type
// on this endpoint or returns a broader set than requested.
function rowMatchesListingType(
  rawListingType: unknown,
  filter: string,
): boolean {
  if (!filter) return true;
  const v = (rawListingType ?? "").toString().trim().toLowerCase();
  if (filter === "buy") return v === "for sale" || v === "sale" || v === "buy";
  if (filter === "rent") return v === "for rent" || v === "rent";
  return true;
}

interface PropertySearchProps {
  onSearch: (filters: {
    search?: string;
    type?: string;
    listingType?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    city?: string;
    scope?: string;
  }) => void;
  minPriceRange?: number;
  maxPriceRange?: number;
}

export function PropertySearch({
  onSearch,
  minPriceRange = 0,
  maxPriceRange = 10000000,
}: PropertySearchProps) {
  // BUG FIX: this panel used to always initialize its filter state to
  // empty strings, regardless of what was already active in the URL
  // (e.g. ?search=manila&listingType=sale&scope=all from the Hero
  // search bar). That meant opening this panel and applying just one
  // extra filter (like "Studio") silently wiped out search/listingType,
  // producing a much broader — and confusing — result set. We now seed
  // every field from the current URL's query params on first render, so
  // this panel is additive to whatever filters are already applied.
  const searchParams = useSearchParams();

  const initialListingType = listingTypeFromUrl(
    searchParams.get("listingType"),
  );
  const initialMinPrice = searchParams.get("minPrice");
  const initialMaxPrice = searchParams.get("maxPrice");
  const initialCity = searchParams.get("city") ?? "";
  const initialSearch = searchParams.get("search") ?? "";
  const hasInitialFilters = Boolean(
    searchParams.get("propertyType") ||
    initialMinPrice ||
    initialMaxPrice ||
    searchParams.get("bedrooms") ||
    initialCity,
  );

  const [isExpanded, setIsExpanded] = useState(hasInitialFilters);
  const [search, setSearch] = useState(initialSearch);
  const [listingType, setListingType] = useState<string>(initialListingType);
  const [type, setType] = useState<string>(
    () => searchParams.get("propertyType") ?? "",
  );
  // Min/Max Price default to the actual min/max price found among the
  // properties currently in the catalog (derived below from the same
  // fetch used to compute price bounds), not a fixed prop — so e.g. a
  // catalog ranging ₱4.50M–₱21.32M shows that range, not a generic
  // 0–10M. priceBounds is null until that fetch resolves; the
  // minPriceRange/maxPriceRange props are only a fallback if it never
  // does.
  const [priceBounds, setPriceBounds] = useState<{
    min: number;
    max: number;
  } | null>(null);
  const [minPrice, setMinPrice] = useState<string>(
    initialMinPrice ?? String(minPriceRange),
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    initialMaxPrice ?? String(maxPriceRange),
  );
  // Track manual edits so an async update to the derived/prop price
  // bounds doesn't clobber a value the user already typed — this also
  // covers the value we just seeded from the URL above.
  const minPriceTouched = useRef(Boolean(initialMinPrice));
  const maxPriceTouched = useRef(Boolean(initialMaxPrice));
  const [bedrooms, setBedrooms] = useState<string>(
    () => searchParams.get("bedrooms") ?? "",
  );

  // City — plain text field. No autosuggest/dropdown: it used to be a
  // custom combobox backed by a portaled dropdown of every distinct city
  // in the catalog, but that machinery has been removed per request.
  // `search` (free text) and `city` are still two independent filters
  // that get ANDed together server-side, so each one now clears the
  // other the moment the user actually edits it — previously only the
  // City dropdown did this (when a city was picked, it cleared `search`),
  // but typing a *new* value into the top search box never cleared a
  // stale `city` left over from an earlier search. That stale AND is
  // what made every subsequent search silently return 0 results.
  const [city, setCity] = useState<string>(initialCity);

  // Re-sync default price fields whenever the derived catalog range
  // (or, failing that, the prop fallback) arrives/changes, as long as
  // the user hasn't already edited that field themselves (or it wasn't
  // already seeded from the URL).
  useEffect(() => {
    if (minPriceTouched.current) return;
    setMinPrice(String(priceBounds?.min ?? minPriceRange));
  }, [priceBounds, minPriceRange]);

  useEffect(() => {
    if (maxPriceTouched.current) return;
    setMaxPrice(String(priceBounds?.max ?? maxPriceRange));
  }, [priceBounds, maxPriceRange]);

  // Fetch catalog data purely to derive the min/max price bounds shown in
  // this panel's UI — scoped to the selected listing type (Buy/Rent), same
  // as the results page's own query. This panel backs the "For Sale" /
  // "For Rent" search results page (properties-client.tsx), which only
  // ever searches the agent-owned `properties` table — so this probe
  // intentionally does NOT send scope=all, and the derived min/max range
  // reflects that same agent-only pool rather than pulling in
  // developer_properties. This is separate from the actual search request
  // in handleSearch below, and never affects which properties are
  // actually returned by Search/Apply/Reset.
  useEffect(() => {
    let cancelled = false;

    const loadPriceBounds = async () => {
      try {
        const params = new URLSearchParams();
        params.append("page", "1");
        params.append("per_page", "1000");
        params.append("status", "active");
        // Intentionally no scope param — this page/panel only searches
        // the agent `properties` table, matching fetchProperties() in
        // properties-client.tsx.

        const listingTypeParam = normalizeListingTypeParam(listingType);
        if (listingTypeParam) params.append("listing_type", listingTypeParam);

        const res = await fetch(`/api/properties?${params}`);
        if (!res.ok) throw new Error("Failed to fetch properties");
        const data = await res.json();
        if (cancelled) return;

        const allRows: any[] = Array.isArray(data?.data) ? data.data : [];
        // Client-side filter as a safety net in case the backend doesn't
        // honor listing_type on this endpoint.
        const rows = allRows.filter((p) =>
          rowMatchesListingType(p?.listing_type, listingType),
        );

        // Rent listings are priced per month (price_per_month), sale
        // listings by price — same logic PreviewRow uses to display.
        const prices = rows
          .map((p) => {
            const isRent = (p?.listing_type ?? "")
              .toString()
              .toLowerCase()
              .includes("rent");
            const raw = isRent
              ? (p?.price_per_month ?? p?.price)
              : (p?.price ?? p?.price_per_month);
            const num = Number(raw);
            return Number.isFinite(num) && num > 0 ? num : null;
          })
          .filter((n): n is number => n !== null);

        setPriceBounds(
          prices.length > 0
            ? { min: Math.min(...prices), max: Math.max(...prices) }
            : null,
        );
      } catch (err) {
        console.error("Failed to fetch catalog price bounds:", err);
        if (!cancelled) setPriceBounds(null);
      }
    };

    loadPriceBounds();
    return () => {
      cancelled = true;
    };
  }, [listingType]);

  const handleSearch = () => {
    onSearch({
      search: search || undefined,
      listingType: listingType || undefined,
      type: type || undefined,
      // BUG FIX: this used to always send `minPrice`/`maxPrice`, even when
      // the user never touched those fields — they'd get silently filled
      // with the derived catalog range (or, worse, collapse to a single
      // exact value when only one listing in the catalog has a parseable
      // price, e.g. min === max === 4,500,000). That turned an innocuous
      // "search taguig/makati" into an unintended exact-price filter that
      // excluded every other listing. Only forward these when the user
      // (or an incoming URL) actually set them.
      minPrice:
        minPriceTouched.current && minPrice ? parseInt(minPrice) : undefined,
      maxPrice:
        maxPriceTouched.current && maxPrice ? parseInt(maxPrice) : undefined,
      // bedrooms "0" (Studio) must still be sent — compare to "" not
      // falsiness, since 0 is falsy as a number but a legit selection here.
      bedrooms: bedrooms !== "" ? parseInt(bedrooms) : undefined,
      city: city || undefined,
      // This panel only ever drives the agent-only "For Sale" / "For Rent"
      // results page — it never sets scope, so the request stays scoped
      // to the `properties` table (see fetchProperties in
      // properties-client.tsx, which now only sends scope=all when it's
      // explicitly present in the filters object).
    });
  };

  const handleReset = () => {
    setSearch("");
    setListingType("");
    setType("");
    setCity("");
    // Reset back to the real catalog min/max, not empty — and allow
    // future updates to sync again since the user is explicitly resetting.
    minPriceTouched.current = false;
    maxPriceTouched.current = false;
    setMinPrice(String(priceBounds?.min ?? minPriceRange));
    setMaxPrice(String(priceBounds?.max ?? maxPriceRange));
    setBedrooms("");
    onSearch({});
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8">
      {/* Main Search Bar */}
      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
          <input
            type="text"
            placeholder="Search by address, city, or keyword..."
            value={search}
            onChange={(e) => {
              const val = e.target.value;
              setSearch(val);
              // `search` and `city` are ANDed together server-side. If a
              // stale `city` from an earlier search is still set, typing
              // a brand-new free-text query here would otherwise get
              // silently ANDed against it and return 0 results no matter
              // what's typed. An explicit new search supersedes a
              // leftover city filter.
              if (val && city) setCity("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full h-12 pl-10 pr-4 py-3 bg-blue-950/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/80 transition text-sm text-white placeholder-blue-300"
          />
        </div>
        <Button
          onClick={handleSearch}
          className="bg-gradient-to-r from-blue-400/80 to-blue-500 hover:from-blue-500/60 hover:to-blue-600/60 h-12 text-blue-950 font-bold whitespace-nowrap"
        >
          Search
        </Button>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3 border border-blue-700 rounded-lg hover:bg-blue-900/50 transition flex items-center gap-2 justify-center sm:w-auto text-white"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Filters</span>
        </button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-blue-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-down">
          {/* Listing Type */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Type
            </label>
            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value)}
              className="w-full h-12 px-3 py-2 bg-blue-950/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-white"
            >
              <option value="">All Types</option>
              <option value="buy">Buy</option>
              <option value="rent">Rent</option>
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Property Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-12 px-3 py-2 bg-blue-950/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-white"
            >
              <option value="">All Types</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="office_space">Office Space</option>
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Min Price
            </label>
            <input
              type="number"
              min={priceBounds?.min ?? minPriceRange}
              max={priceBounds?.max ?? maxPriceRange}
              value={minPrice}
              onChange={(e) => {
                minPriceTouched.current = true;
                setMinPrice(e.target.value);
              }}
              className="w-full h-12 px-3 py-2 bg-blue-950/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-white placeholder-blue-300"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Max Price
            </label>
            <input
              type="number"
              min={priceBounds?.min ?? minPriceRange}
              max={priceBounds?.max ?? maxPriceRange}
              value={maxPrice}
              onChange={(e) => {
                maxPriceTouched.current = true;
                setMaxPrice(e.target.value);
              }}
              className="w-full h-12 px-3 py-2 bg-blue-950/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-white placeholder-blue-300"
            />
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Bedrooms
            </label>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full h-12 px-3 py-2 bg-blue-950/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-white"
            >
              <option value="">Any</option>
              <option value="0">Studio</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5+</option>
            </select>
          </div>

          {/* City — plain text input, no autosuggest/dropdown */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              City
            </label>
            <input
              type="text"
              placeholder="Enter city..."
              value={city}
              onChange={(e) => {
                const val = e.target.value;
                setCity(val);
                // Same reasoning as the top search box above, mirrored:
                // an explicit city edit supersedes a leftover free-text
                // search rather than getting ANDed against it.
                if (val && search) setSearch("");
              }}
              className="w-full h-12 px-3 py-2 bg-blue-950/50 border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-white placeholder-blue-300"
            />
          </div>

          {/* Actions */}
          <div className="sm:col-span-2 lg:col-span-4 flex gap-2 justify-end mt-5">
            <Button
              onClick={handleReset}
              variant="outline"
              className="border border-blue-700 hover:bg-blue-900/50 text-white h-12 w-22"
            >
              Reset
            </Button>
            <Button
              onClick={handleSearch}
              className="bg-gradient-to-r from-blue-400/80 to-blue-500 hover:from-blue-500/50 hover:to-blue-600/80 h-12 w-auto text-blue-950  font-bold"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
