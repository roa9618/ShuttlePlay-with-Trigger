const PREFIX = 'sp';
const MULTIPLIER = 7919n;
const OFFSET = 104729n;
const CHECK_MOD = 1296n;

export const encodePublicId = (id: number | string | null | undefined) => {
  if (id === null || id === undefined || id === '' || id === 'demo') return String(id ?? '');
  if (typeof id === 'string' && id.toLowerCase().startsWith(PREFIX)) return id;
  const numeric = BigInt(String(id));
  const mixed = numeric * MULTIPLIER + OFFSET;
  return `${PREFIX}${mixed.toString(36)}${checksum(mixed)}`;
};

export const decodePublicId = (value: string | undefined) => {
  if (!value || value === 'demo') return value ?? '';
  if (/^\d+$/.test(value)) return value;
  const lower = value.toLowerCase();
  if (!lower.startsWith(PREFIX) || lower.length <= PREFIX.length + 2) return value;
  const payload = lower.slice(PREFIX.length, -2);
  const signature = lower.slice(-2);
  try {
    const mixed = parseBase36(payload);
    if (checksum(mixed) !== signature) return value;
    const shifted = mixed - OFFSET;
    if (shifted <= 0n || shifted % MULTIPLIER !== 0n) return value;
    return String(shifted / MULTIPLIER);
  } catch {
    return value;
  }
};

export const groupPath = (groupId: number | string, suffix = '') => `/groups/${encodePublicId(groupId)}${suffix}`;
export const sessionPath = (sessionId: number | string, suffix = '') => `/sessions/${encodePublicId(sessionId)}${suffix}`;

function checksum(mixed: bigint) {
  return ((mixed * 31n + 17n) % CHECK_MOD).toString(36).padStart(2, '0');
}

function parseBase36(value: string) {
  return value.split('').reduce((acc, char) => {
    const digit = BigInt(parseInt(char, 36));
    if (digit < 0n || digit >= 36n) throw new Error('Invalid base36 digit');
    return acc * 36n + digit;
  }, 0n);
}
