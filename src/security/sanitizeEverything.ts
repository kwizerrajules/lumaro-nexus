
import DOMPurify from "isomorphic-dompurify";

// Generic sanitizer
export function sanitizeInput(value: any): any {
  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    // Sanitize HTML + trim spaces
    const clean = DOMPurify.sanitize(value.trim(), { ALLOWED_TAGS: [] });
    return clean;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeInput);
  }

  if (typeof value === "object") {
    const sanitized: Record<string, any> = {};
    for (const key in value) {
      sanitized[key] = sanitizeInput(value[key]);
    }
    return sanitized;
  }

  return value;
}

// Utility for sanitizing entire request bodies or params
export function sanitizeEverything<T>(data: T): T {
  return sanitizeInput(data);
}
