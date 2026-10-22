export interface Role {
  id: number
  name: string
  description: string | null
  created_at: string
}

export interface Permission {
  id: number
  name: string
  description: string | null
  created_at: string
}

export interface RolePermission {
  id: number
  role_id: number
  permission_id: number
}

export interface UserRole {
  id: number
  user_id: string
  role_id: number
}