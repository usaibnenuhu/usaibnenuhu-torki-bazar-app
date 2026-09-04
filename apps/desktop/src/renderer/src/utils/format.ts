export function formatBDT(value: number | string | null | undefined): string {
  const num = typeof value === "string" ? Number(value) : value;
  if (num === null || num === undefined || Number.isNaN(num)) return "৳0";
  return `৳${num.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${formatDate(date)} ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}
