const DEFAULT_MAX_DIMENSION = 2000;
const DEFAULT_QUALITY = 0.8;
const DEFAULT_COMPRESS_THRESHOLD_BYTES = 2 * 1024 * 1024; // 2MB

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  const src = await fileToDataUrl(file);
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to decode image"));
    img.src = src;
  });
}

export async function compressImageIfNeeded(
  file: File,
  opts?: {
    maxDimension?: number;
    quality?: number;
    thresholdBytes?: number;
  }
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const maxDimension = opts?.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const quality = opts?.quality ?? DEFAULT_QUALITY;
  const thresholdBytes = opts?.thresholdBytes ?? DEFAULT_COMPRESS_THRESHOLD_BYTES;

  if (file.size <= thresholdBytes) return file;
  if (typeof window === "undefined") return file;

  try {
    const image = await loadImage(file);
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
    );
    if (!blob || blob.size >= file.size) return file;

    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    return new File([blob], `${nameWithoutExt}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}
