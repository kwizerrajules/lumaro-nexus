const requests: Record<string, { count: number; lastRequest: number }> = {};

const WINDOW_MS = 60 * 1000; 
const MAX_REQUESTS = 30; 

export function rateLimiter(ip: string) {
  const now = Date.now();
  const entry = requests[ip] || { count: 0, lastRequest: now };

  if (now - entry.lastRequest > WINDOW_MS) {
    entry.count = 0;
    entry.lastRequest = now;
  }

  entry.count++;

  requests[ip] = entry;

  if (entry.count > MAX_REQUESTS) {
    return false; // blocked
  }
  return true;
}
