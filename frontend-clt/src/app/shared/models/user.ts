export class User {
  id!: number;
  username!: string;
  password?: string;
  firstName!: string;
  lastName!: string;
  token!: string;
  /** Nombre completo (backend CLT) */
  nombreCompleto?: string;
  /** Permisos del usuario (backend CLT) */
  permisos?: string[];
}
