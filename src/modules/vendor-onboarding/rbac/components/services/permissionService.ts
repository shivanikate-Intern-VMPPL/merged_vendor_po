import { supabase } from "../../../supabase.js";

export async function getRolePermissions(roleId: number) {

  // Get permission ids
  const { data: rolePermissions, error } = await supabase
    .from("role_permissions")
    .select("permission_id")
    .eq("role_id", roleId);

  if (error) throw error;

  const ids = rolePermissions.map(p => p.permission_id);

  // Get permission names
  const { data: permissions, error: permissionError } = await supabase
    .from("permissions")
    .select("*")
    .in("id", ids);

  if (permissionError) throw permissionError;

  return permissions;
}