import logoSrc from "@/assets/logo-gestao-red.png";

let cachedBase64: string | null = null;

export async function getLogoBase64(): Promise<string> {
  if (cachedBase64) return cachedBase64;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      cachedBase64 = canvas.toDataURL("image/png", 0.9);
      resolve(cachedBase64);
    };
    img.onerror = () => resolve("");
    img.src = logoSrc;
  });
}
