/**
 * Minimal pincode lookup for auto-fill based on state + city.
 * Extend as needed; keep entries lean to avoid bloating bundle.
 * This is a fallback; for broader coverage we also query postalpincode.in at runtime.
 */
export const PINCODE_MAP: Record<string, string> = {
  // format: `${state}::${city}` : pincode
  "Delhi::New Delhi": "110001",
  "Delhi::Delhi": "110006",
  "Maharashtra::Mumbai": "400001",
  "Maharashtra::Pune": "411001",
  "Maharashtra::Nagpur": "440001",
  "Karnataka::Bengaluru": "560001",
  "Karnataka::Mysuru": "570001",
  "Tamil Nadu::Chennai": "600001",
  "Tamil Nadu::Coimbatore": "641001",
  "West Bengal::Kolkata": "700001",
  "Uttar Pradesh::Lucknow": "226001",
  "Uttar Pradesh::Noida": "201301",
  "Uttar Pradesh::Ghaziabad": "201001",
  "Gujarat::Ahmedabad": "380001",
  "Gujarat::Surat": "395003",
  "Telangana::Hyderabad": "500001",
  "Rajasthan::Jaipur": "302001",
  "Madhya Pradesh::Bhopal": "462001",
  "Bihar::Patna": "800001",
};

export const lookupPincode = (state?: string, city?: string): string | null => {
  if (!state || !city) return null;
  const key = `${state}::${city}`;
  return PINCODE_MAP[key] || null;
};
