/**
 * Respuesta de error estándar del backend CLT (api_consumo_backend.md §3).
 * Todas las respuestas de error son JSON con este formato.
 */
export interface ErrorResponse {
  /** ISO-8601 (UTC) */
  timestamp: string;
  /** 400, 401, 403, 404, 409, 500 */
  status: number;
  /** "Bad Request", "Unauthorized", etc. */
  error: string;
  /** Mensaje legible para el usuario */
  message: string;
  /** Ruta del request */
  path: string;
  /** Solo en 400 validación: campo → mensaje */
  errores?: Record<string, string> | null;
}

/** Type guard para comprobar si un objeto es ErrorResponse. */
export function isErrorResponse(obj: unknown): obj is ErrorResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'status' in obj &&
    'message' in obj &&
    typeof (obj as ErrorResponse).message === 'string'
  );
}

/**
 * Extrae mensaje y errores por campo desde HttpErrorResponse.error (puede ser ErrorResponse o string).
 */
export function getErrorMessage(err: { error?: unknown; message?: string }, fallback = 'Error en la petición'): string {
  const body = err?.error;
  if (isErrorResponse(body)) {
    const msg = body.message || body.error || fallback;
    if (body.errores && Object.keys(body.errores).length > 0) {
      const fieldMsgs = Object.entries(body.errores)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ');
      return `${msg} (${fieldMsgs})`;
    }
    return msg;
  }
  if (typeof body === 'string') return body;
  return err?.message || fallback;
}

/**
 * Devuelve errores por campo si el backend envió ErrorResponse.errores (400 validación).
 */
export function getFieldErrors(err: { error?: unknown }): Record<string, string> | null {
  const body = err?.error;
  if (isErrorResponse(body) && body.errores && typeof body.errores === 'object') {
    return body.errores;
  }
  return null;
}
