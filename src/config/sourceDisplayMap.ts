/**
 * Config file for custom stream source display mapping.
 * Hide raw backend sources and display high-fidelity custom brand servers instead.
 */

// Mapping of original server names to custom human-readable names.
// Key can be exact matching original server name or index-based (e.g., "index_0", "index_1").
export const SOURCE_DISPLAY_MAP: Record<string, string> = {
  // Exact match mappings
  "OPhim": "FilmFlow Vietsub #1",
  "KKPhim": "FilmFlow Vietsub #2",
  "AnimeHub": "FilmFlow Anime HD",
  "NguonC": "FilmFlow Vietsub #4",
  "NguonPhim": "FilmFlow Vietsub #5",
  "Server VIP": "FilmFlow Premium",
  "Server Gốc": "Server Alpha",
  "Netflix Proxy": "Server Beta",
  "Netflix Server": "FilmFlow Premium Ultra",
  "VIP Server": "FilmFlow Premium #1",
  "Mirror 1": "Server Gamma",
  "Default": "FilmFlow Main Stream",

  // Index fallback mappings
  "index_0": "FilmFlow Vietsub #1",
  "index_1": "FilmFlow Vietsub #2",
  "index_2": "FilmFlow Premium",
  "index_3": "Server Gamma"
};

/**
 * Gets the custom display name for a given source name and its index.
 * @param rawName The original server name from backend/API
 * @param index The index of the server in the episodes list
 */
export function getCustomSourceName(rawName: string, index: number): string {
  if (!rawName) return `Nguồn Vietsub VIP #${index + 1}`;
  
  const trimmed = rawName.trim();
  const lower = trimmed.toLowerCase();
  
  // Heuristics for Sub / Dub (Lồng Tiếng / Thuyết Minh)
  const isLongTieng = lower.includes("lồng tiếng") || lower.includes("long tieng") || lower.includes("longtieng") || lower.includes("thuyết minh") || lower.includes("thuyet minh") || lower.includes("dub");
  const isVietsub = lower.includes("vietsub") || lower.includes("sub") || lower.includes("phụ đề");
  
  if (isLongTieng) {
    return `Nguồn Lồng Tiếng VIP #${index + 1}`;
  }
  if (isVietsub) {
    return `Nguồn Vietsub VIP #${index + 1}`;
  }
  
  // 1. Try exact match in the mapping
  if (SOURCE_DISPLAY_MAP[trimmed]) {
    return SOURCE_DISPLAY_MAP[trimmed];
  }
  
  // 2. Try index-based matching
  const indexKey = `index_${index}`;
  if (SOURCE_DISPLAY_MAP[indexKey]) {
    return SOURCE_DISPLAY_MAP[indexKey];
  }
  
  // 3. Fallback to generic polished names based on index or pattern
  if (trimmed.toLowerCase().includes("anime")) {
    return `FilmFlow Anime #${index + 1}`;
  }
  if (trimmed.toLowerCase().includes("vip") || trimmed.toLowerCase().includes("premium")) {
    return `FilmFlow Premium #${index + 1}`;
  }
  
  return `FilmFlow Vietsub #${index + 1}`;
}
