import { supabase } from "../../../supabase.js";

/**
 * Get all roles
 */
export async function getAllRoles() {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("id");

  if (error) throw error;

  return data;
}

/**
 * Create new role
 */
export async function createRole(
  roleName: string,
  description: string
) {
  const { data, error } = await supabase
    .from("roles")
    .insert([
      {
        role_name: roleName,
        description: description,
      },
    ])
    .select();

  if (error) throw error;

  return data;
}

/**
 * Update role
 */
export async function updateRole(
  roleId: number,
  roleName: string,
  description: string
) {
  const { error } = await supabase
    .from("roles")
    .update({
      role_name: roleName,
      description: description,
    })
    .eq("id", roleId);

  if (error) throw error;
}

/**
 * Delete role
 */
export async function deleteRole(roleId: number) {
  // Check if any users are assigned to this role
  const { data: assignedUsers, error: checkError } = await supabase
    .from("vo_user_roles")
    .select("user_id")
    .eq("role_id", roleId);

  if (checkError) throw checkError;

  if (assignedUsers && assignedUsers.length > 0) {
    throw new Error(
      "Cannot delete this role because users are assigned to it."
    );
  }

  // Delete role
  const { error } = await supabase
    .from("roles")
    .delete()
    .eq("id", roleId);

  if (error) throw error;
}