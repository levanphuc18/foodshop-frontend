export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, '');
export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL ??
  `${API_BASE_URL.replace(/\/api\/v1$/, '').replace(/^http/, 'ws')}/ws`;
export const SITE_NAME = 'DrySea';
export const SITE_DESCRIPTION = 'Artisanal seafood preservation, rooted in coastal heritage.';
