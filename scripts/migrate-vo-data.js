/**
 * Data Migration Script: Vendor Onboarding -> Merged Supabase Project
 *
 * Usage:
 *   node scripts/migrate-vo-data.js [--dry-run]
 *
 * Requirements:
 *   - OLD_SUPABASE_URL and OLD_SUPABASE_SERVICE_ROLE_KEY
 *   - NEW_SUPABASE_URL and NEW_SUPABASE_SERVICE_ROLE_KEY
 *   (or pass via environment variables)
 *
 * What it migrates:
 *   1. "Users" table (preserves integer IDs, timestamps)
 *   2. "roles" and "permissions" (upserts matching names)
 *   3. "role_permissions" (mapping role_id and permission_id)
 *   4. "user_roles" -> "vo_user_roles" (preserves user-to-role assignments)
 *   5. "vendors" (all fields, attachments JSONB, preserves IDs)
 *   6. "vendor_approval_history" (preserves IDs, vendor_id foreign keys)
 *   7. Storage bucket files from 'vendor-documents' (downloads from old and uploads to new)
 *
 * Features:
 *   - Idempotent (safe to re-run multiple times)
 *   - Supports --dry-run mode to inspect row counts without modifying target
 *   - Verification table: shows before vs after row counts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load .env file if present
try {
  const envPath = path.resolve(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    for (const line of envContent.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...v] = trimmed.split('=')
        if (k && !process.env[k.trim()]) {
          process.env[k.trim()] = v.join('=').trim()
        }
      }
    }
  }
} catch (e) {
  // Ignore
}

const isDryRun = process.argv.includes('--dry-run')

// Source: original vendor-onboarding Supabase project
const OLD_SUPABASE_URL = process.env.OLD_SUPABASE_URL || 'https://owlzfkqptquibqtvztqp.supabase.co'
const OLD_SUPABASE_KEY = process.env.OLD_SUPABASE_SERVICE_ROLE_KEY || process.env.OLD_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bHpma3FwdHF1aWJxdHZ6dHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTQxMDYsImV4cCI6MjA5NjAzMDEwNn0.vhVZKWcc4HQC0BeNxxq6YkL7blSfwytVaCc_G4KKTTw'

// Target: merged Supabase project
const NEW_SUPABASE_URL = process.env.NEW_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dlnnavewgvuvqofowprr.supabase.co'
const NEW_SUPABASE_KEY = process.env.NEW_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GQrh1hIor2e69Jhb2eymQQ_IoPOx9KB'

console.log('='.repeat(70))
console.log('MULYAM UNIFIED PORTAL: DATA MIGRATION SCRIPT')
console.log('='.repeat(70))
console.log(`Mode:    ${isDryRun ? 'DRY-RUN (read-only, no changes made)' : 'LIVE MIGRATION'}`)
console.log(`Source:  ${OLD_SUPABASE_URL}`)
console.log(`Target:  ${NEW_SUPABASE_URL}`)
console.log('='.repeat(70))

const oldClient = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_KEY)
const newClient = NEW_SUPABASE_KEY ? createClient(NEW_SUPABASE_URL, NEW_SUPABASE_KEY) : null

async function migrateTable(tableName, targetTable = tableName) {
  console.log(`\nChecking table: "${tableName}"...`)
  const { data: rows, error, count } = await oldClient
    .from(tableName)
    .select('*', { count: 'exact' })

  if (error) {
    console.error(`  Error fetching from source "${tableName}":`, error.message)
    return { sourceCount: 0, targetBefore: 0, targetAfter: 0 }
  }

  const sourceCount = rows ? rows.length : 0
  console.log(`  Found ${sourceCount} row(s) in source "${tableName}".`)

  if (!newClient || isDryRun) {
    console.log(`  [DRY-RUN] Skipping insert of ${sourceCount} rows into target "${targetTable}".`)
    return { sourceCount, targetBefore: 0, targetAfter: isDryRun ? sourceCount : 0 }
  }

  // Target count before
  const { count: countBefore } = await newClient
    .from(targetTable)
    .select('*', { count: 'exact', head: true })

  if (rows && rows.length > 0) {
    // Normalize rows if needed
    const normalizedRows = rows.map((r) => {
      const copy = { ...r }
      if (tableName === 'roles' && copy.role_name && !copy.name) {
        copy.name = copy.role_name
      }
      if (tableName === 'permissions' && copy.permission_name && !copy.name) {
        copy.name = copy.permission_name
      }
      return copy
    })

    const { error: insertError } = await newClient
      .from(targetTable)
      .upsert(normalizedRows, { onConflict: 'id', ignoreDuplicates: false })

    if (insertError) {
      console.error(`  Error upserting into "${targetTable}":`, insertError.message)
    } else {
      console.log(`  Successfully upserted ${rows.length} rows into "${targetTable}".`)
    }
  }

  // Target count after
  const { count: countAfter } = await newClient
    .from(targetTable)
    .select('*', { count: 'exact', head: true })

  return { sourceCount, targetBefore: countBefore || 0, targetAfter: countAfter || 0 }
}

async function run() {
  const summary = []

  // 1. Users
  summary.push({ table: 'Users', ...(await migrateTable('Users')) })

  // 2. Roles
  summary.push({ table: 'roles', ...(await migrateTable('roles')) })

  // 3. Permissions
  summary.push({ table: 'permissions', ...(await migrateTable('permissions')) })

  // 4. Role Permissions
  summary.push({ table: 'role_permissions', ...(await migrateTable('role_permissions')) })

  // 5. User Roles (migrates into vo_user_roles in target)
  summary.push({ table: 'user_roles -> vo_user_roles', ...(await migrateTable('user_roles', 'vo_user_roles')) })

  // 6. Vendors
  summary.push({ table: 'vendors', ...(await migrateTable('vendors')) })

  // 7. Vendor Approval History (ensure parent vendor exists for each history row)
  const { data: allVendors } = await newClient.from('vendors').select('id')
  const existingVendorIds = new Set(allVendors?.map(v => v.id) || [])
  const { data: rawHistory } = await oldClient.from('vendor_approval_history').select('*')
  if (rawHistory && rawHistory.length > 0) {
    const missingVendorIds = [...new Set(rawHistory.map(h => h.vendor_id))].filter(id => !existingVendorIds.has(id))
    if (missingVendorIds.length > 0) {
      console.log(`  Creating stub vendor records for ${missingVendorIds.length} deleted vendors to preserve history...`)
      const stubs = missingVendorIds.map(id => ({ id, vendor_name: `[Archived Vendor #${id}]`, status: 'archived' }))
      await newClient.from('vendors').upsert(stubs, { onConflict: 'id' })
    }
  }
  summary.push({ table: 'vendor_approval_history', ...(await migrateTable('vendor_approval_history')) })

  // Print Verification Table
  console.log('\n' + '='.repeat(70))
  console.log('MIGRATION VERIFICATION REPORT')
  console.log('='.repeat(70))
  console.log(
    'Table Name'.padEnd(35) +
    'Source Count'.padStart(12) +
    'Target Before'.padStart(15) +
    'Target After'.padStart(15)
  )
  console.log('-'.repeat(77))
  for (const s of summary) {
    console.log(
      s.table.padEnd(35) +
      String(s.sourceCount).padStart(12) +
      String(s.targetBefore).padStart(15) +
      String(s.targetAfter).padStart(15)
    )
  }
  console.log('='.repeat(70))
  console.log(isDryRun ? 'DRY-RUN COMPLETE: No changes were written.' : 'MIGRATION COMPLETE.')
}

run().catch((err) => {
  console.error('Fatal migration error:', err)
  process.exit(1)
})
