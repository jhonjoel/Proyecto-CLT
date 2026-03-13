// Configuración según api_consumo_backend.md §1.
export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:8080',
  apiUrl: 'http://localhost:8080/api',
  /** Cloudflare Turnstile: sitekey. En producción usar la real; en debug: 1x00000000000000000000AA */
  turnstileSiteKey: '1x00000000000000000000AA',
};
