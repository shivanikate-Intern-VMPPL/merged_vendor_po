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

// Verifies the caller's JWT is valid (rejects anonymous/forged requests),
// then resolves their role via user_roles -> roles. Throws a Response
// (not an Error) on failure — callers catch it and return it directly,
// e.g.:
//   try { auth = await requireAuth(req) } catch (res) { return res as Response }
//
// SECURITY: a caller with no user_roles row (brand-new signup, or a role
// that was deleted) resolves to a null role. This is explicitly rejected
// here with a 403 rather than being passed through as `role: null`,
// because any endpoint that forgot to call requireRole() would otherwise
// treat "no role" as "no restriction" and serve full data to an
// authenticated-but-unprovisioned account. requireAuth succeeding now
// guarantees a real, non-null role string every caller can trust.
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

  const roleName = userRole?.roles?.name ?? null

  if (!roleName) {
    throw forbidden("This account has not been assigned a role yet. Contact an administrator.")
  }

  return { userId: user.id, email: user.email ?? null, role: roleName }
}

// Throws a 403 Response if the caller's role isn't in `allowed`.
// Usage: requireRole(auth, ["office", "admin"])
export function requireRole(auth: AuthResult, allowed: string[]): void {
  if (!allowed.includes(auth.role)) {
    throw forbidden(
      `This action requires one of the following roles: ${allowed.join(", ")}`
    )
  }
}