"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  MapPin,
  Home,
  Banknote,
  BedDouble,
  Tag,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";

interface DeveloperHeroSearchProps {
  /**
   * Fires with { search, listingType, type, minPrice, maxPrice, bedrooms }.
   * Unlike HeroSearch, this NEVER navigates — the /developer page already
   * owns its own state/fetch via handleSearch(), so we just hand the
   * filters object straight back to the parent.
   */
  onSearch: (filters: any) => void;
}

const LISTING_TYPES = [
  { label: "For Sale", value: "sale" },
  { label: "For Rent", value: "rent" },
];

const PROPERTY_TYPES = ["Residential", "Commercial", "Office Space"];

const BUDGETS = [
  { label: "Under ₱500K", value: "0-500000" },
  { label: "₱500K – ₱1M", value: "500000-1000000" },
  { label: "₱1M – ₱3M", value: "1000000-3000000" },
  { label: "₱3M – ₱5M", value: "3000000-5000000" },
  { label: "₱5M – ₱10M", value: "5000000-10000000" },
  { label: "₱10M – ₱20M", value: "10000000-20000000" },
  { label: "Above ₱20M", value: "20000000-999999999" },
];

const BEDROOMS = [
  "Studio",
  "1 Bedroom",
  "2 Bedrooms",
  "3 Bedrooms",
  "4 Bedrooms",
  "5+ Bedrooms",
];

/* ── Dropdown — same portal pattern as HeroSearch's FieldDropdown ──── */
function FieldDropdown({
  label,
  icon,
  placeholder,
  options,
  value,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  options: string[] | { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 220),
      });
    }
    setOpen((o) => !o);
  };

  const displayLabel = (opt: string | { label: string; value: string }) =>
    typeof opt === "string" ? opt : opt.label;
  const optionValue = (opt: string | { label: string; value: string }) =>
    typeof opt === "string" ? opt : opt.value;

  const selectedLabel = value
    ? displayLabel(
        (options as any[]).find((o) => optionValue(o) === value) ?? value,
      )
    : null;

  const panel =
    open && mounted
      ? createPortal(
          <div
            style={{
              position: "absolute",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              background: "#fff",
              borderRadius: 14,
              boxShadow:
                "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.06)",
              zIndex: 99999,
              overflow: "hidden",
              maxHeight: 320,
              overflowY: "auto",
              animation: "dhs-dropIn 0.18s ease",
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "11px 16px",
                fontSize: 13,
                color: "#9ca3af",
                fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                borderBottom: "1px solid #f3f4f6",
                cursor: "pointer",
              }}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              {placeholder}
            </div>
            {(options as any[]).map((opt) => {
              const val = optionValue(opt);
              const label2 = displayLabel(opt);
              const isActive = value === val;
              return (
                <div
                  key={val}
                  style={{
                    padding: "11px 16px",
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: "'DM Sans', sans-serif",
                    color: isActive ? "#c41e3a" : "#374151",
                    background: isActive ? "#fce4e7" : "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "background 0.12s",
                  }}
                  onClick={() => {
                    onChange(val);
                    setOpen(false);
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background =
                        "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = isActive
                      ? "#fef2f2"
                      : "transparent";
                  }}
                >
                  {label2}
                  {isActive && (
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#c41e3a",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={ref} className="dhs-dropdown" onClick={handleToggle}>
      <div className="dhs-dropdown-inner">
        <span className="dhs-dropdown-icon">{icon}</span>
        <div className="dhs-dropdown-text">
          <span className="dhs-dropdown-label">{label}</span>
          <span
            className={`dhs-dropdown-value${selectedLabel ? " selected" : ""}`}
          >
            {selectedLabel ?? placeholder}
          </span>
        </div>
        <ChevronDown
          size={13}
          color="#9ca3af"
          style={{
            flexShrink: 0,
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </div>
      {panel}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────────── */
export function DeveloperHeroSearch({ onSearch }: DeveloperHeroSearchProps) {
  const [location, setLocation] = useState("");
  const [listingType, setListingType] = useState("");
  const [propType, setPropType] = useState("");
  const [budget, setBudget] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [focused, setFocused] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // No navigation here — /developer owns its own fetch/state, so we just
  // hand the filters object back. Parent's handleSearch() does the rest.
  const handleSearch = () => {
    const [minPrice, maxPrice] = budget ? budget.split("-") : ["", ""];

    onSearch({
      search: location,
      listingType,
      type: propType,
      minPrice: minPrice || "",
      maxPrice: maxPrice || "",
      bedrooms,
    });
  };

  const activeCount = [listingType, propType, budget, bedrooms].filter(
    Boolean,
  ).length;

  return (
    <>
      <style>{`
        @keyframes dhs-dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dhs-drawerIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .dhs-wrapper {
          position: relative;
          width: 100%;
          background: transparent;
        }

        .dhs-label-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .dhs-label-text {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          font-family: 'DM Sans', sans-serif;
        }
        .dhs-filter-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(196,30,58,0.15);
          border: 1px solid rgba(196,30,58,0.35);
          border-radius: 100px;
          padding: 3px 11px;
        }

        .dhs-card {
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 16px;
          box-shadow: 0 20px 64px rgba(0,0,0,0.38);
          transition: box-shadow 0.25s ease;
          overflow: visible !important;
          position: relative;
        }
        .dhs-card:focus-within {
          box-shadow: 0 24px 80px rgba(0,0,0,0.45), 0 0 0 2px rgba(196,30,58,0.22);
        }

        .dhs-top-row {
          display: flex;
          align-items: center;
          padding: 8px 8px 8px 20px;
          min-height: 68px;
          gap: 0;
          background: rgba(255,255,255,0.97);
          border-radius: 16px 16px 0 0;
          position: relative;
          z-index: 5;
        }

        .dhs-location {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .dhs-location input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-size: 15px;
          font-weight: 500;
          color: #111827;
          font-family: 'DM Sans', sans-serif;
          min-width: 0;
        }
        .dhs-location input::placeholder { color: #c4c9d4; }
        .dhs-clear-btn {
          width: 20px; height: 20px;
          border-radius: 50%;
          background: #f3f4f6;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; color: #9ca3af; flex-shrink: 0;
        }
        .dhs-sep {
          width: 1px; height: 32px;
          background: rgba(0,0,0,0.1);
          margin: 0 12px; flex-shrink: 0;
        }

        .dhs-filters-toggle {
          display: none;
          align-items: center;
          gap: 6px;
          background: #f9fafb;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 10px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          color: #374151;
          font-family: 'DM Sans', sans-serif;
          flex-shrink: 0;
          transition: background 0.15s;
          margin-right: 8px;
        }
        .dhs-filters-toggle:hover { background: #f3f4f6; }
        .dhs-toggle-badge {
          width: 18px; height: 18px;
          background: #a52a2a; color: #fff;
          border-radius: 50%;
          font-size: 10px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
        }

        .dhs-search-btn {
          background: linear-gradient(135deg, #0f1b4d 0%, #5a2d5f 50%, #c41e3a 100%);
          color: #fff;
          border: none; cursor: pointer;
          padding: 0 28px;
          border-radius: 12px;
          font-size: 16px; font-weight: 800;
          letter-spacing: 0.04em;
          font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 8px;
          white-space: nowrap;
          box-shadow: 0 6px 20px rgba(12,27,77,0.4);
          transition: all 0.22s ease;
          flex-shrink: 0;
          height: 56px;
        }
        .dhs-search-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 32px rgba(12,27,77,0.5);
        }
        .dhs-search-btn:active { transform: translateY(0); }

        .dhs-filters-row {
          display: flex;
          align-items: stretch;
          border-top: 1px solid rgba(0,0,0,0.07);
          overflow: visible;
          position: relative;
          z-index: 10;
          background: rgba(255,255,255,0.97);
          border-radius: 0 0 16px 16px;
        }

        .dhs-dropdown {
          flex: 1;
          padding: 10px 16px;
          border-right: 1px solid rgba(0,0,0,0.07);
          cursor: pointer;
          position: relative;
          min-width: 0;
        }
        .dhs-dropdown:last-child { border-right: none; }
        .dhs-dropdown-inner {
          display: flex; align-items: center; gap: 8px;
        }
        .dhs-dropdown-icon { flex-shrink: 0; display: flex; }
        .dhs-dropdown-text {
          flex: 1; display: flex; flex-direction: column;
          gap: 2px; min-width: 0; overflow: hidden;
        }
        .dhs-dropdown-label {
          font-size: 9px; font-weight: 800; color: #9ca3af;
          text-transform: uppercase; letter-spacing: 0.1em;
          font-family: 'DM Sans', sans-serif;
        }
        .dhs-dropdown-value {
          font-size: 12px; font-weight: 400; color: #9ca3af;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .dhs-dropdown-value.selected { color: #111827; font-weight: 600; }

        .dhs-drawer {
          border-top: 1px solid rgba(0,0,0,0.07);
          animation: dhs-drawerIn 0.22s ease;
        }
        .dhs-drawer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .dhs-drawer-grid .dhs-dropdown {
          border-right: none;
          border-bottom: 1px solid rgba(0,0,0,0.07);
          padding: 14px 16px;
          flex: unset;
        }
        .dhs-drawer-grid .dhs-dropdown:nth-child(odd) {
          border-right: 1px solid rgba(0,0,0,0.07);
        }
        .dhs-drawer-grid .dhs-dropdown:nth-last-child(-n+2) {
          border-bottom: none;
        }

        @media (max-width: 768px) {
          .dhs-filters-row { display: none; }
          .dhs-filters-toggle { display: flex; }

          .dhs-top-row {
            padding: 8px 8px 8px 14px;
            min-height: 58px;
          }
          .dhs-location input { font-size: 14px; }
          .dhs-search-btn {
            height: 46px;
            padding: 0 18px;
            font-size: 13px;
            border-radius: 10px;
          }
        }

        @media (max-width: 480px) {
          .dhs-sep { display: none; }
          .dhs-top-row { padding: 8px; }
          .dhs-search-btn { padding: 0 14px; gap: 6px; }
          .dhs-search-btn span { display: none; }
          .dhs-search-btn::after { content: 'Go'; font-size: 13px; font-weight: 800; }
        }
      `}</style>

      <div className="dhs-wrapper">
        <div className="dhs-label-row">
          <span className="dhs-label-text">Search Developer Listings</span>
          {activeCount > 0 && (
            <div className="dhs-filter-badge">
              <Sparkles size={10} color="#f1948a" />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#f1948a",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {activeCount} filter{activeCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        <div className="dhs-card">
          <div className="dhs-top-row">
            <div className="dhs-location">
              <MapPin
                size={16}
                color={focused ? "#c41e3a" : "#c4c9d4"}
                style={{ flexShrink: 0, transition: "color 0.2s" }}
              />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Development name, city, or address…"
              />
              {location && (
                <button
                  className="dhs-clear-btn"
                  onClick={() => setLocation("")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="dhs-sep" />

            <button
              className="dhs-filters-toggle"
              onClick={() => setFiltersOpen((o) => !o)}
            >
              <SlidersHorizontal size={13} />
              Filters
              {activeCount > 0 && (
                <span className="dhs-toggle-badge">{activeCount}</span>
              )}
            </button>

            <button className="dhs-search-btn" onClick={handleSearch}>
              <Search size={15} strokeWidth={2.5} />
              <span>Search</span>
            </button>
          </div>

          <div className="dhs-filters-row">
            <FieldDropdown
              label="Listing Type"
              icon={<Tag size={14} color="#c0392b" />}
              placeholder="Any"
              options={LISTING_TYPES}
              value={listingType}
              onChange={setListingType}
            />
            <FieldDropdown
              label="Property Type"
              icon={<Home size={14} color="#c0392b" />}
              placeholder="Any type"
              options={PROPERTY_TYPES}
              value={propType}
              onChange={setPropType}
            />
            <FieldDropdown
              label="Budget"
              icon={<Banknote size={14} color="#c0392b" />}
              placeholder="Any price"
              options={BUDGETS}
              value={budget}
              onChange={setBudget}
            />
            <FieldDropdown
              label="Bedrooms"
              icon={<BedDouble size={14} color="#c0392b" />}
              placeholder="Any"
              options={BEDROOMS}
              value={bedrooms}
              onChange={setBedrooms}
            />
          </div>

          {filtersOpen && (
            <div className="dhs-drawer">
              <div className="dhs-drawer-grid">
                <FieldDropdown
                  label="Listing Type"
                  icon={<Tag size={14} color="#c0392b" />}
                  placeholder="Any"
                  options={LISTING_TYPES}
                  value={listingType}
                  onChange={setListingType}
                />
                <FieldDropdown
                  label="Property Type"
                  icon={<Home size={14} color="#c0392b" />}
                  placeholder="Any type"
                  options={PROPERTY_TYPES}
                  value={propType}
                  onChange={setPropType}
                />
                <FieldDropdown
                  label="Budget"
                  icon={<Banknote size={14} color="#c0392b" />}
                  placeholder="Any price"
                  options={BUDGETS}
                  value={budget}
                  onChange={setBudget}
                />
                <FieldDropdown
                  label="Bedrooms"
                  icon={<BedDouble size={14} color="#c0392b" />}
                  placeholder="Any"
                  options={BEDROOMS}
                  value={bedrooms}
                  onChange={setBedrooms}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
