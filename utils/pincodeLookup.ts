const cache = new Map<string, string | null>();

// Local quick map fallback
import { lookupPincode as localLookup } from "@/app/data/PincodeMap";

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

  // Remote best-effort lookup
  try {
    const resp = await fetch(
      `https://api.postalpincode.in/postoffice/${encodeURIComponent(city)}`
    );
    const data = await resp.json();
    if (Array.isArray(data) && data[0]?.Status === "Success") {
      const office = (data[0].PostOffice || []).find(
        (p: any) =>
          p.State?.toLowerCase() === state.toLowerCase() &&
          p.District?.toLowerCase() === city.toLowerCase()
      );
      const fallbackOffice = (data[0].PostOffice || [])[0];
      const pin = office?.Pincode || fallbackOffice?.Pincode || null;
      cache.set(key, pin || null);
      return pin || null;
    }
  } catch (_) {
    // ignore errors, return null
  }

  cache.set(key, null);
  return null;
};
