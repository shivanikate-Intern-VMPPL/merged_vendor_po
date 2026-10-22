import type { ReactNode } from 'react'
import { usePermission } from '../../rbac/services/hooks/usePermission'

interface RoleGuardProps {
  permission: string
  children: ReactNode
}

export function RoleGuard({ permission, children }: RoleGuardProps) {
  const { hasPermission, loading } = usePermission(permission)

  if (loading) return null
  if (!hasPermission) return null

  return <>{children}</>
}