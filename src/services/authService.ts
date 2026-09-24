import { findMockUser } from '@/mocks/auth';
import type { AuthUser, LoginCredentials } from '@/types/auth';

const MOCK_LATENCY_MS = 500;

function withMockLatency<T>(callback: () => T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(callback()), MOCK_LATENCY_MS);
  });
}

export function login(credentials: LoginCredentials): Promise<AuthUser> {
  return withMockLatency(() => {
    const user = findMockUser(credentials);
    if (!user) {
      throw new Error('账号或密码错误，请重试');
    }
    return user;
  });
}

export function logout(): Promise<void> {
  return withMockLatency(() => undefined);
}

export function getCurrentUser(): Promise<AuthUser | null> {
  return withMockLatency(() => null);
}
