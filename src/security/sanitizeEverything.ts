export function sanitizeInput(value) {
  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    const cleaned = value
      .trim()
      .replace(/<[^>]*>/g, "");
    return cleaned;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeInput);
  }

  if (typeof value === "object") {
    const sanitized = {};
    for (const key in value) {
      sanitized[key] = sanitizeInput(value[key]);
    }
    return sanitized;
  }

  return value;
}

export function sanitizeEverything(data) {
  return sanitizeInput(data);
}
