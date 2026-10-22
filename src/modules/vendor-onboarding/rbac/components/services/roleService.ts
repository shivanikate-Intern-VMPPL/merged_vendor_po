import { supabase } from "../../../supabase.js";

export async function getUserRole(userId: number) {
  // Get role_id
  const { data: userRole, error } = await supabase
    .from("vo_user_roles")
    .select("role_id")
    .eq("user_id", userId)
    .single();

  if (error) throw error;

  // Get role
  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("*")
    .eq("id", userRole.role_id)
    .single();

  if (roleError) throw roleError;

  return {
    role_id: userRole.role_id,
    role,
  };
}
/**
 * Get role name by user id
 */
export async function getRoleNameByUserId(userId: number) {
  // Get role_id
  const { data: userRole, error } = await supabase
    .from("vo_user_roles")
    .select("role_id")
    .eq("user_id", userId)
    .single();

  if (error || !userRole) {
    return "";
  }

  // Get role name
  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("role_name")
    .eq("id", userRole.role_id)
    .single();

  if (roleError || !role) {
    return "";
  }

  return role.role_name;
}
/**
 * Get all roles
 */
export async function getRoles() {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("id");

  if (error) throw error;

  return data;
}