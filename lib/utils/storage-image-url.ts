/**
 * Convert a Supabase storage public URL to our image proxy URL.
 * Use this for paystub/receipt img src so browsers send auth (same-origin) and RLS allows access.
 * Returns the proxy URL for paystubs/receipts storage URLs; otherwise the original URL unchanged.
 */
export function storageImageToProxyUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const m = url.match(/\/storage\/v1\/object\/public\/(paystubs|receipts)\/(.+)$/);
  if (!m) return url;
  const [, bucket, path] = m;
  if (!bucket || !path) return url;
  return `/api/storage/image?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(path)}`;
}

/** True if the URL points to a PDF (cannot be shown in img; use iframe or placeholder). */
export function isPdfUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    if (url.toLowerCase().includes(".pdf")) return true;
    const pathParam = new URL(url, "http://_").searchParams.get("path");
    return (pathParam?.toLowerCase().includes(".pdf")) ?? false;
  } catch {
    return false;
  }
}
