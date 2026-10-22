import { supabase } from "../../../supabase.js";

export async function assignRoleToUser(
  userId: number,
  roleId: number
) {
  console.log("assignRoleToUser called:", {
    userId,
    roleId,
  });

  // Check whether this user already has a role
  const {
    data: existingRole,
    error: fetchError,
  } = await supabase
    .from("vo_user_roles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    console.error(
      "Error checking existing role:",
      fetchError
    );

    throw fetchError;
  }

  // If the user already has a role, update it
  if (existingRole) {
    const { data, error } = await supabase
      .from("vo_user_roles")
      .update({
        role_id: roleId,
      })
      .eq("user_id", userId)
      .select();

    if (error) {
      console.error(
        "Error updating role:",
        error
      );

      throw error;
    }

    console.log(
      "Role updated successfully:",
      data
    );

    return data;
  }

  // If the user has no role, insert a new assignment
  const { data, error } = await supabase
    .from("vo_user_roles")
    .insert({
      user_id: userId,
      role_id: roleId,
    })
    .select();

  if (error) {
    console.error(
      "Error inserting role:",
      error
    );

    throw error;
  }

  console.log(
    "Role assigned successfully:",
    data
  );

  return data;
}