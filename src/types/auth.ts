export type Permission =
  | 'dashboard'
  | 'collection'
  | 'portfolio'
  | 'reports'
  | 'settings';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  department: string;
  roles: string[];
  permissions: Permission[];
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
