import { supabase } from "../../../supabase.js";

/**
 * Get all permissions assigned to a role
 */
export async function getRolePermissionIds(roleId: number) {
  const { data, error } = await supabase
    .from("role_permissions")
    .select("permission_id")
    .eq("role_id", roleId);

  if (error) throw error;

  return data;
}

/**
 * Assign permission to role
 */
export async function assignPermission(
  roleId: number,
  permissionId: number
) {
  const { error } = await supabase
    .from("role_permissions")
    .insert([
      {
        role_id: roleId,
        permission_id: permissionId,
      },
    ]);

  if (error) throw error;
}

/**
 * Remove permission from role
 */
export async function removePermission(
  roleId: number,
  permissionId: number
) {
  const { error } = await supabase
    .from("role_permissions")
    .delete()
    .eq("role_id", roleId)
    .eq("permission_id", permissionId);

  if (error) throw error;
}