// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// Configuración según api_consumo_backend.md §1: Base URL + prefijo /api.
export const environment = {
  production: false,
  /** Base URL del backend (api_consumo_backend.md). */
  apiBaseUrl: 'http://localhost:8080',
  /** URL base de la API: apiBaseUrl + prefijo /api. */
  apiUrl: 'http://localhost:8080/api',
  /** Cloudflare Turnstile: sitekey de prueba (siempre pasa). Producción: usar sitekey real. */
  turnstileSiteKey: '1x00000000000000000000AA',
};
