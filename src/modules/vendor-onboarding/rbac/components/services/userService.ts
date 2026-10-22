import { supabase } from "../../../supabase.js";

/**
 * Get ALL users
 */
export async function getUsers() {
  const { data, error } = await supabase
    .from("Users")
    .select("*")
    .order("id");

  if (error) throw error;

  return data;
}

/**
 * Get one user by email
 */
export async function getUserByEmail(email: string) {
  console.log("Searching Email:", email);

  const { data, error } = await supabase
    .from("Users")
    .select("*")
    .eq("email", email);

  console.log("Data:", data);
  console.log("Error:", error);

  if (error) throw error;

  return data?.[0];
}