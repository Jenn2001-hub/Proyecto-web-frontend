// Modelo de datos de usuario
export interface User {
  id: number;
  nombre: string;
  email?: string;
  rol_id?: number;
  administrador_id?: number;
  password?: string;
  token?: string;
  administradorId?: number;
}