export const hebrewOnly = (text = "") =>
  (text || "").replace(/[^\u0590-\u05FF\s'-]/g, " ").replace(/\s+/g, " ").trim();

export const splitHebrewName = (fullName = "") => {
  const clean = hebrewOnly(fullName);
  if (!clean) return { firstName: "", lastName: "" };
  const parts = clean.split(" ").filter(Boolean);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
};

export const displayName = (user = {}, fallbackEmail = "") => {
  const u = user ?? {};
  const fn = hebrewOnly(u.firstName || "");
  const ln = hebrewOnly(u.lastName || "");
  return `${fn}${fn && ln ? " " : ""}${ln}`.trim();
};

export const getUserInitials = (user = {}, fallbackEmail = "") => {
  const u = user ?? {};
  const fn = hebrewOnly(u.firstName || "");
  const ln = hebrewOnly(u.lastName || "");
  if (fn && ln) return `${fn[0]}${ln[0]}`;
  if (fn) return fn.slice(0, 2);
  if (ln) return ln.slice(0, 2);
  return "";
};

const palette = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#0ea5e9', '#14b8a6', '#f59e0b'];
export const getAvatarColor = (user = {}, seed = "") => {
  const u = user ?? {};
  if (u.avatarColor) return u.avatarColor;
  const key = (u.id || u.email || u.firstName || u.lastName || seed || "").toString();
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
};
