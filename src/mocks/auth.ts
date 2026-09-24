import type { AuthUser, LoginCredentials } from '@/types/auth';

const MOCK_USERS: Array<{ credentials: LoginCredentials; user: AuthUser }> = [
  {
    credentials: { username: 'researcher', password: '123456' },
    user: {
      id: 'user-001',
      name: '林晓研',
      department: '投资研究部',
      roles: ['投研成员'],
      permissions: ['dashboard', 'collection', 'portfolio', 'reports'],
    },
  },
  {
    credentials: { username: 'viewer', password: '123456' },
    user: {
      id: 'user-002',
      name: '周谨言',
      department: '董事会办公室',
      roles: ['只读人员'],
      permissions: ['dashboard'],
    },
  },
  {
    credentials: { username: 'admin', password: '123456' },
    user: {
      id: 'user-003',
      name: '陈致远',
      department: '系统管理部',
      roles: ['管理员'],
      permissions: ['dashboard', 'collection', 'portfolio', 'reports', 'settings'],
    },
  },
];

export function findMockUser(credentials: LoginCredentials): AuthUser | null {
  const match = MOCK_USERS.find(
    ({ credentials: expected }) =>
      expected.username === credentials.username && expected.password === credentials.password,
  );

  return match?.user ?? null;
}
