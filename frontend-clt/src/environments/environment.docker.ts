/**
 * Configuración para ejecución en Docker.
 * API URL relativa: Nginx hace proxy de /api al backend.
 */
export const environment = {
  production: true,
  apiBaseUrl: '',
  apiUrl: '/api',
  turnstileSiteKey: '1x00000000000000000000AA',
};
