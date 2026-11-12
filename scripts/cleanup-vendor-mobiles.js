/**
 * One-time cleanup script for vendor mobile numbers in the `vendors` table.
 *
 * Rules:
 *  - Normalizes mobile numbers:
 *      * removes spaces, hyphens, brackets, dots, and "+"
 *      * drops leading 91 or 0 when longer than 10 digits
 *      * keeps exactly 10 digits starting with 6-9
 *      * stores as +91XXXXXXXXXX
 *  - Reports invalid / non-normalizable mobile numbers
 *  - Detects and reports duplicates across vendors
 *  - NEVER merges or deletes vendors automatically
 *
 * Usage:
 *  Dry run (default, safe):
 *    node scripts/cleanup-vendor-mobiles.js
 *    node scripts/cleanup-vendor-mobiles.js --dry-run
 *
 *  Apply updates:
 *    node scripts/cleanup-vendor-mobiles.js --apply
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Native .env parser if present
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
} catch {
  // ignore
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://dlnnavewgvuvqofowprr.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GQrh1hIor2e69Jhb2eymQQ_IoPOx9KB';

const isDryRun = !process.argv.includes('--apply');

export function normalizeMobile(raw) {
  if (raw === null || raw === undefined) {
    return { isValid: false, normalized: '', raw: '', error: 'Empty mobile' };
  }
  const str = String(raw).trim();
  if (!str) {
    return { isValid: false, normalized: '', raw: str, error: 'Empty mobile' };
  }

  // Remove spaces, hyphens, brackets, dots, and "+"
  let cleaned = str.replace(/[\s\-\(\)\[\]\.\+]/g, '');

  // Drop a leading 91 or 0 when the result is longer than 10 digits
  if (cleaned.length > 10) {
    if (cleaned.startsWith('91')) {
      cleaned = cleaned.slice(2);
    } else if (cleaned.startsWith('0')) {
      cleaned = cleaned.slice(1);
    }
  }

  // Must keep exactly 10 digits starting with 6-9
  if (!/^[6-9]\d{9}$/.test(cleaned)) {
    return {
      isValid: false,
      normalized: cleaned,
      raw: str,
      error: `Does not match 10 digits starting with 6-9 (got '${cleaned}')`,
    };
  }

  return {
    isValid: true,
    normalized: `+91${cleaned}`,
    raw: str,
  };
}

async function runCleanup() {
  console.log('='.repeat(70));
  console.log('  MULYAM: VENDOR MOBILE NORMALIZATION & DUPLICATE AUDIT');
  console.log(`  Mode: ${isDryRun ? 'DRY RUN (No database changes will be made)' : 'LIVE APPLY (Updating database)'}`);
  console.log(`  Target: ${SUPABASE_URL}`);
  console.log('='.repeat(70));

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { data: vendors, error } = await supabase
    .from('vendors')
    .select('id, vendor_name, mobile, status, zoho_contact_id')
    .order('id', { ascending: true });

  if (error) {
    console.error('Failed to fetch vendors:', error);
    process.exit(1);
  }

  console.log(`\nFound ${vendors.length} vendors in database.\n`);

  const updatesToApply = [];
  const invalidMobiles = [];
  const emptyMobiles = [];
  const alreadyNormalized = [];

  // Map to track duplicate normalized numbers: normalized -> array of vendors
  const normalizedMap = new Map();
  // Map to track duplicate raw numbers for unnormalized numbers
  const rawDuplicatesMap = new Map();

  for (const vendor of vendors) {
    const raw = vendor.mobile;
    if (!raw || !String(raw).trim()) {
      emptyMobiles.push(vendor);
      continue;
    }

    const result = normalizeMobile(raw);

    if (result.isValid) {
      const list = normalizedMap.get(result.normalized) || [];
      list.push({ ...vendor, normalized: result.normalized });
      normalizedMap.set(result.normalized, list);

      if (raw === result.normalized) {
        alreadyNormalized.push(vendor);
      } else {
        updatesToApply.push({
          id: vendor.id,
          vendor_name: vendor.vendor_name,
          oldMobile: raw,
          newMobile: result.normalized,
        });
      }
    } else {
      invalidMobiles.push({
        id: vendor.id,
        vendor_name: vendor.vendor_name,
        raw,
        reason: result.error,
      });

      const rawKey = String(raw).trim();
      const rawList = rawDuplicatesMap.get(rawKey) || [];
      rawList.push(vendor);
      rawDuplicatesMap.set(rawKey, rawList);
    }
  }

  // 1. Report Normalization Changes
  console.log('--- 1. NORMALIZATION SUMMARY ---');
  console.log(`Total vendors:            ${vendors.length}`);
  console.log(`Already normalized:       ${alreadyNormalized.length}`);
  console.log(`Pending normalization:    ${updatesToApply.length}`);
  console.log(`Invalid / Unparseable:    ${invalidMobiles.length}`);
  console.log(`Empty / Missing mobile:   ${emptyMobiles.length}\n`);

  if (updatesToApply.length > 0) {
    console.log(`Vendors to normalize (${updatesToApply.length}):`);
    updatesToApply.forEach((u) => {
      console.log(`  [ID ${u.id}] ${u.vendor_name || 'No name'}: "${u.oldMobile}" -> "${u.newMobile}"`);
    });
    console.log('');
  }

  if (invalidMobiles.length > 0) {
    console.log(`Invalid / Non-normalizable mobile numbers (${invalidMobiles.length}):`);
    invalidMobiles.forEach((inv) => {
      console.log(`  [ID ${inv.id}] ${inv.vendor_name || 'No name'}: raw="${inv.raw}" (${inv.reason})`);
    });
    console.log('');
  }

  // 2. Report Duplicates (Normalized)
  console.log('--- 2. DUPLICATE MOBILE AUDIT ---');
  let duplicateGroupsCount = 0;
  for (const [normMobile, list] of normalizedMap.entries()) {
    if (list.length > 1) {
      duplicateGroupsCount++;
      console.log(`\n  [DUPLICATE] Normalized Mobile ${normMobile} is shared by ${list.length} vendors:`);
      list.forEach((v) => {
        console.log(`    - Vendor ID: ${v.id} | Name: "${v.vendor_name}" | Zoho Contact ID: ${v.zoho_contact_id || 'none'} | Status: ${v.status}`);
      });
    }
  }

  // Also report duplicate invalid numbers (e.g. test numbers like '5643891207' repeated across multiple vendors)
  for (const [rawKey, list] of rawDuplicatesMap.entries()) {
    if (list.length > 1) {
      duplicateGroupsCount++;
      console.log(`\n  [DUPLICATE (Invalid Format)] Raw Mobile "${rawKey}" is shared by ${list.length} vendors:`);
      list.forEach((v) => {
        console.log(`    - Vendor ID: ${v.id} | Name: "${v.vendor_name}" | Zoho Contact ID: ${v.zoho_contact_id || 'none'} | Status: ${v.status}`);
      });
    }
  }

  if (duplicateGroupsCount === 0) {
    console.log('  No duplicate mobile numbers detected.');
  } else {
    console.log(`\n  => Found ${duplicateGroupsCount} groups of duplicate mobile numbers.`);
    console.log('  => NOTE: Per specification, vendors are NOT automatically merged or deleted.');
  }

  // 3. Execution (Apply or Dry-run)
  if (!isDryRun && updatesToApply.length > 0) {
    console.log('\n--- 3. APPLYING UPDATES TO DATABASE ---');
    let successCount = 0;
    let failCount = 0;

    for (const item of updatesToApply) {
      const { error: updateError } = await supabase
        .from('vendors')
        .update({ mobile: item.newMobile })
        .eq('id', item.id);

      if (updateError) {
        console.error(`  FAILED to update Vendor ${item.id}:`, updateError.message);
        failCount++;
      } else {
        successCount++;
      }
    }
    console.log(`Successfully updated ${successCount} vendors. (Failed: ${failCount})`);
  } else if (isDryRun) {
    console.log('\n--- 3. DRY RUN COMPLETE ---');
    console.log('No changes were made to the database.');
    console.log('To apply valid normalizations, run: node scripts/cleanup-vendor-mobiles.js --apply\n');
  }
}

runCleanup().catch((err) => {
  console.error('Fatal error during cleanup:', err);
  process.exit(1);
});
