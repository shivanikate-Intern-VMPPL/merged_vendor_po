import { supabase } from "../../../supabase.js";

/**
 * Get all permissions
 */
export async function getAllPermissions() {
  const { data, error } = await supabase
    .from("permissions")
    .select("*")
    .order("id");

  if (error) throw error;

  return data;
}

/**
 * Create permission
 */
export async function createPermission(
  permissionName: string,
  description: string
) {
  const { data, error } = await supabase
    .from("permissions")
    .insert([
      {
        permission_name: permissionName,
        description,
      },
    ])
    .select();

  if (error) throw error;

  return data;
}

/**
 * Update permission
 */
export async function updatePermission(
  id: number,
  permissionName: string,
  description: string
) {
  const { error } = await supabase
    .from("permissions")
    .update({
      permission_name: permissionName,
      description,
    })
    .eq("id", id);

  if (error) throw error;
}

/**
 * Delete permission
 */
export async function deletePermission(id: number) {
  const { error } = await supabase
    .from("permissions")
    .delete()
    .eq("id", id);

  if (error) throw error;
}