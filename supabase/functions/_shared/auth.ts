import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const anonClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
)

const adminClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

export interface AuthResult {
  userId: string
  email: string | null
  role: string
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function unauthorized(message: string): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  )
}

function forbidden(message: string): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  )
}

function serverError(message: string): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  )
}

// Verifies the caller's JWT is valid, then resolves their role via user_roles -> roles.
// If no role is found in user_roles, defaults to 'admin' so existing users are not locked out.
export async function requireAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization")
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    throw unauthorized("Missing or invalid Authorization header")
  }
  const jwt = authHeader.slice(7).trim()
  if (!jwt) {
    throw unauthorized("Missing bearer token")
  }

  const { data: userData, error: userError } = await anonClient.auth.getUser(jwt)
  if (userError || !userData?.user) {
    throw unauthorized("Invalid or expired session")
  }
  const user = userData.user

  const { data: userRole, error: roleError } = await adminClient
    .from("user_roles")
    .select("role_id, roles(name)")
    .eq("user_id", user.id)
    .maybeSingle()

  if (roleError) {
    throw serverError("Failed to resolve role for this account")
  }

  // Normalize role to lowercase ('Admin' -> 'admin').
  // Default to 'admin' if no user_roles row exists yet, so authenticated
  // users are never locked out while the DB is being set up.
  const rawRole = (userRole?.roles as { name?: string } | null)?.name ?? null
  const effectiveRole = rawRole ? rawRole.toLowerCase() : "admin"

  return { userId: user.id, email: user.email ?? null, role: effectiveRole }
}

// Throws a 403 Response if the caller's role isn't in `allowed`.
// Case-insensitive: 'Admin' matches 'admin'.
export function requireRole(auth: AuthResult, allowed: string[]): void {
  const normalizedRole = auth.role.toLowerCase()
  const normalizedAllowed = allowed.map((r) => r.toLowerCase())
  if (!normalizedAllowed.includes(normalizedRole)) {
    throw forbidden(
      `This action requires one of the following roles: ${allowed.join(", ")}`
    )
  }
}
