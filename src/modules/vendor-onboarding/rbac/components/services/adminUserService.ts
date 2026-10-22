import { supabase } from "../../../supabase.js";

export async function getAllUsersWithRoles() {
  const { data, error } = await supabase
    .from("Users")
    .select(`
      *,
      vo_user_roles (
        role_id,
        roles (
          role_name
        )
      )
    `)
    .order("id");

  if (error) throw error;

  return data?.map((u: any) => ({
    ...u,
    user_roles: u.vo_user_roles,
  })) || [];
}