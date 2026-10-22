import { supabase } from "../../../supabase.js";

export async function getDashboardCounts() {
  const [
    usersResult,
    rolesResult,
    permissionsResult,
    pendingResult,
  ] = await Promise.all([
    supabase.from("Users").select("*", { count: "exact", head: true }),
    supabase.from("roles").select("*", { count: "exact", head: true }),
    supabase.from("permissions").select("*", { count: "exact", head: true }),
    supabase
      .from("vendors")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return {
    totalUsers: usersResult.count ?? 0,
    totalRoles: rolesResult.count ?? 0,
    totalPermissions: permissionsResult.count ?? 0,
    pendingVendors: pendingResult.count ?? 0,
  };
}