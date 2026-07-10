export type AppRole = 'user' | 'admin' | 'super_admin'

export function isAdminRole(role: unknown): role is 'admin' | 'super_admin' {
  return role === 'admin' || role === 'super_admin'
}

export function isCustomerRole(role: unknown): role is 'user' {
  return role === 'user'
}
