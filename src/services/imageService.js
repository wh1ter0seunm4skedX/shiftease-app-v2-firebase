// Lightweight client-side image search with optional providers.
// ⚠️ In production, proxy this through your backend/Cloud Function to keep keys private.

// Resolve env once to avoid inconsistent reads and ensure Vite replacement.
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const HAS_PEXELS_KEY = typeof PEXELS_API_KEY === "string" && PEXELS_API_KEY.length > 0;

const withTimeout = (promise, ms = 10000) =>
  Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);

function normalizePexelsPhotos(data) {
  const photos = Array.isArray(data?.photos) ? data.photos : [];
  return photos
    .map((p) => ({
      id: p.id,
      alt: p.alt || "photo",
      url: p.src?.large || p.src?.medium || p.src?.small || null,
      thumb: p.src?.tiny || p.src?.small || p.src?.medium || null,
      author: p.photographer || "",
      link: p.url || "",
    }))
    .filter((x) => Boolean(x.url));
}

/**
 * Fetch a single image for a query.
 * Returns: { url, attribution, provider } | null
 */
export async function fetchEventImage(query) {
  const q = (query || "").trim();
  if (!q) return null;

  if (!HAS_PEXELS_KEY) {
    console.warn("Missing VITE_PEXELS_API_KEY; single image fetch disabled");
    return null;
  }

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
    q
  )}&per_page=1&orientation=landscape`;

  let res;
  try {
    res = await withTimeout(
      fetch(url, { headers: { Authorization: PEXELS_API_KEY } }),
      15000
    );
  } catch (err) {
    console.error("Pexels single fetch failed:", err);
    return null;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Pexels single non-OK:", res.status, text);
    return null;
  }

  const data = await res.json().catch((e) => {
    console.error("Pexels single JSON parse error:", e);
    return null;
  });
  const photo = data?.photos?.[0];
  if (!photo?.src?.large) return null;

  return {
    url: photo.src.large,
    attribution: `${photo.photographer} (Pexels)`,
    provider: "pexels",
  };
}

/**
 * Search images for a query.
 * Returns: { items, page, total, error? }
 *  - error can be: 'missing_key' | 'timeout' | 'request_failed' | 'http_401' | 'http_429' | 'http_<code>' | 'bad_json'
 */
export async function searchEventImages(query, page = 1, perPage = 24) {
  const q = (query || "").trim();
  if (!q) return { items: [], page: 1, total: 0 };

  if (!HAS_PEXELS_KEY) {
    console.warn("Missing VITE_PEXELS_API_KEY; image search disabled");
    return { items: [], page: 1, total: 0, error: "missing_key" };
  }

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
    q
  )}&per_page=${perPage}&page=${page}&orientation=landscape`;

  let res;
  try {
    res = await withTimeout(
      fetch(url, { headers: { Authorization: PEXELS_API_KEY } }),
      15000
    );
  } catch (err) {
    const msg = err?.message === "timeout" ? "timeout" : "request_failed";
    console.error("Pexels request failed:", err);
    return { items: [], page, total: 0, error: msg };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Pexels non-OK:", res.status, text);
    return { items: [], page, total: 0, error: `http_${res.status}` };
  }

  const data = await res.json().catch((e) => {
    console.error("Pexels JSON parse error:", e);
    return null;
  });
  if (!data) return { items: [], page, total: 0, error: "bad_json" };

  return {
    items: normalizePexelsPhotos(data),
    page,
    total: data?.total_results || 0,
  };
}
