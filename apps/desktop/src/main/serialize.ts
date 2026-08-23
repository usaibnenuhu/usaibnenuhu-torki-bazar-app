// Electron IPC uses the structured clone algorithm, which cannot transfer
// Prisma.Decimal instances. Recursively convert them (and any other
// non-plain values) into plain, cloneable data before sending to the
// renderer.
export function serialize<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map((v) => serialize(v)) as unknown as T;
  if (typeof value === "object") {
    const maybeDecimal = value as unknown as { toFixed?: unknown; toNumber?: unknown; constructor?: { name?: string } };
    if (typeof maybeDecimal.toFixed === "function" && typeof maybeDecimal.toNumber === "function") {
      return (value as unknown as { toString(): string }).toString() as unknown as T;
    }
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = serialize(val);
    }
    return result as T;
  }
  return value;
}
