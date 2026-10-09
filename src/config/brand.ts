/** Add only business details confirmed by RZ Design RJ. */
const env = import.meta.env;

function verifiedUrl(value: string | undefined, instagram = false): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    if (instagram && !['instagram.com', 'www.instagram.com'].includes(url.hostname.toLowerCase())) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function verifiedPhone(value: string | undefined): string | null {
  if (!value?.trim() || !/^[+\d\s().-]+$/.test(value.trim())) return null;
  const number = value.replace(/\D/g, '');
  return /^[1-9]\d{9,14}$/.test(number) ? number : null;
}

function verifiedEndpoint(value: string | undefined): string | null {
  const endpoint = value?.trim();
  if (!endpoint) return null;
  if (/^\/(?!\/)[^\\\r\n]*$/.test(endpoint)) return endpoint;
  return verifiedUrl(endpoint);
}

export const brand = {
  name: 'RZ Design RJ',
  whatsapp: verifiedPhone(env.VITE_WHATSAPP),
  instagram: verifiedUrl(env.VITE_INSTAGRAM_URL, true),
  siteUrl: verifiedUrl(env.VITE_SITE_URL),
  quoteEndpoint: verifiedEndpoint(env.VITE_QUOTE_ENDPOINT),
} as const;

export function whatsappUrl(message = 'Olá, RZ Design RJ! Quero conversar sobre um projeto de comunicação visual.'): string | null {
  return brand.whatsapp ? `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(message)}` : null;
}

export default brand;
