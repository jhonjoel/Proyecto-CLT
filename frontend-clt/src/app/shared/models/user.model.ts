/**
 * Usuario del sistema (CLT).
 * Usado en AuthResponse y en vistas que muestran datos del usuario.
 */
export interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
}
