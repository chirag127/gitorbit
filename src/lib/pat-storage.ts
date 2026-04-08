const STORAGE_KEY = 'gitorbit_pat';
const STORAGE_META_KEY = 'gitorbit_pat_meta';

export interface PatMeta {
  setAt: number;
  username: string | null;
  scopes: string[];
}

export function setPat(token: string): void {
  const sanitized = token.trim().replace(/[\r\n\t]/g, '');
  if (!sanitized || sanitized.length < 10) {
    throw new Error('Invalid token format');
  }
  localStorage.setItem(STORAGE_KEY, sanitized);
  localStorage.setItem(STORAGE_META_KEY, JSON.stringify({
    setAt: Date.now(),
    username: null,
    scopes: [],
  }));
}

export function getPat(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function clearPat(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_META_KEY);
}

export function hasPat(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function getPatMeta(): PatMeta | null {
  const raw = localStorage.getItem(STORAGE_META_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function updatePatMeta(meta: Partial<PatMeta>): void {
  const existing = getPatMeta() || { setAt: Date.now(), username: null, scopes: [] };
  localStorage.setItem(STORAGE_META_KEY, JSON.stringify({ ...existing, ...meta }));
}
