export type Role = 'ADMIN' | 'SOLICITANTE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}