/**
 * Vendor Onboarding Supabase Client
 *
 * This file replaces the original hardcoded supabase.ts from vendor-onboarding.
 * It reads from VITE_VO_SUPABASE_URL / VITE_VO_SUPABASE_ANON_KEY so that:
 *   - During migration: it still points at the original VO project.
 *   - After migration: set both to the shared project URL/key.
 *
 * All VO components that import from '../supabase.js' or './supabase.js'
 * are redirected here via the path alias defined in tsconfig.app.json.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  (import.meta.env.VITE_VO_SUPABASE_URL as string) ||
  'https://owlzfkqptquibqtvztqp.supabase.co'

const supabaseKey =
  (import.meta.env.VITE_VO_SUPABASE_ANON_KEY as string) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bHpma3FwdHF1aWJxdHZ6dHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTQxMDYsImV4cCI6MjA5NjAzMDEwNn0.vhVZKWcc4HQC0BeNxxq6YkL7blSfwytVaCc_G4KKTTw'

export const supabase = createClient(supabaseUrl, supabaseKey)