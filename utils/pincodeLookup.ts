const cache = new Map<string, string | null>();

// Local quick map fallback
import { lookupPincode as localLookup } from "@/app/data/PincodeMap";

const normalizeName = (value?: string) =>
  String(value || "")
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/\([^)]*\)/g, "")
    .replace(/\but\b/g, "")
    .replace(/\bnct\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const unique = (values: string[]) =>
  Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));

const getCityQueries = (city: string) => {
  const aliases: Record<string, string[]> = {
    Gurgaon: ["Gurgaon", "Gurugram"],
    "Bengaluru (Bangalore) Urban": ["Bengaluru", "Bangalore"],
    "Bengaluru (Bangalore) Rural": ["Bengaluru", "Bangalore"],
    "Mysuru (Mysore)": ["Mysuru", "Mysore"],
    "Mumbai City": ["Mumbai"],
    "Mumbai Suburban": ["Mumbai"],
    "Gautam Buddha Nagar": ["Noida", "Gautam Buddha Nagar"],
    "Sahibzada Ajit Singh Nagar (Mohali)": ["Mohali", "Sahibzada Ajit Singh Nagar"],
    "Lahaul &amp; Spiti": ["Lahaul", "Spiti"],
  };
  const parenthetical = city.match(/\(([^)]+)\)/)?.[1] || "";
  const withoutParenthetical = city.replace(/\([^)]*\)/g, "").trim();
  return unique([
    ...(aliases[city] || []),
    city,
    withoutParenthetical,
    parenthetical,
  ]);
};

/**
 * Attempt to resolve a pincode for the given state + city/district.
 * Order:
 *  1) Local fallback map (fast, offline)
 *  2) Public postalpincode.in API (best-effort)
 */
export const getPincodeForCity = async (
  state?: string,
  city?: string
): Promise<string | null> => {
  if (!state || !city) return null;
  const key = `${state}::${city}`;

  if (cache.has(key)) return cache.get(key) || null;

  // Local lookup first
  const local = localLookup(state, city);
  if (local) {
    cache.set(key, local);
    return local;
  }

  const stateKey = normalizeName(state);
  const cityKey = normalizeName(city);

  // Remote best-effort lookup
  try {
    for (const query of getCityQueries(city)) {
      const resp = await fetch(
        `https://api.postalpincode.in/postoffice/${encodeURIComponent(query)}`
      );
      const data = await resp.json();
      if (Array.isArray(data) && data[0]?.Status === "Success") {
        const postOffices = data[0].PostOffice || [];
        const exactOffice = postOffices.find((p: any) => {
          const officeState = normalizeName(p.State);
          const officeDistrict = normalizeName(p.District);
          return officeState === stateKey && officeDistrict === cityKey;
        });
        const sameStateOffice = postOffices.find((p: any) => {
          const officeState = normalizeName(p.State);
          return officeState === stateKey;
        });
        const pin = exactOffice?.Pincode || sameStateOffice?.Pincode || null;
        if (pin) {
          cache.set(key, pin);
          return pin;
        }
      }
    }
  } catch (_) {
    // ignore errors, return null
  }

  cache.set(key, null);
  return null;
};
