/**
 * Automated test suite for Bulk PO ID-Based Validation & Matching logic.
 * Run with: node scripts/test-bulk-po-validation.js
 */

import {
  normalizeMobile,
  buildVendorLookup,
  buildItemLookup,
  parseBulkPOWorkbook,
  generateBulkPOTemplate,
  generateErrorReport,
} from '../src/features/purchase-planning/utils/bulkPOValidation.ts';
import * as XLSX from 'xlsx';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('='.repeat(70));
console.log('  RUNNING BULK PO VALIDATION UNIT TESTS');
console.log('='.repeat(70));

// Test 1: Mobile Normalization
console.log('\n[TEST 1] Mobile Number Normalization');
{
  const t1 = normalizeMobile('+91 98765-43210');
  assert(t1.isValid && t1.normalized === '+919876543210', 'Handles +91 with spaces and hyphen');

  const t2 = normalizeMobile('09876543210');
  assert(t2.isValid && t2.normalized === '+919876543210', 'Handles leading 0 for 11 digits');

  const t3 = normalizeMobile('9876543210');
  assert(t3.isValid && t3.normalized === '+919876543210', 'Handles clean 10-digit number starting with 9');

  const t4 = normalizeMobile('6123456789');
  assert(t4.isValid && t4.normalized === '+916123456789', 'Handles 10-digit number starting with 6');

  const t5 = normalizeMobile('7123456789');
  assert(t5.isValid && t5.normalized === '+917123456789', 'Handles 10-digit number starting with 7');

  const t6 = normalizeMobile('8123456789');
  assert(t6.isValid && t6.normalized === '+918123456789', 'Handles 10-digit number starting with 8');

  const t7 = normalizeMobile('5643891207');
  assert(!t7.isValid, 'Rejects 10 digits starting with 5 (must be 6-9)');

  const t8 = normalizeMobile('1234567890');
  assert(!t8.isValid, 'Rejects 10 digits starting with 1');

  const t9 = normalizeMobile('');
  assert(!t9.isValid, 'Rejects empty string');

  const t10 = normalizeMobile('98765');
  assert(!t10.isValid, 'Rejects short number');
}

// Test 2: ID-based Matching & Ambiguous Detection
console.log('\n[TEST 2] ID-based Matching, Ambiguity & Fallbacks');
{
  const mockVendors = [
    { id: 'V-100', name: 'Vendor 100', mobile: '9876543210' },
    { id: 'V-200', name: 'Vendor 200A', mobile: '9988776655' },
    { id: 'V-201', name: 'Vendor 200B', mobile: '9988776655' }, // Shared duplicate mobile!
    { id: 'V-300', name: 'Vendor 300', mobile: '9123456780' },
  ];

  const mockItems = [
    {
      zoho_item_id: 'ITEM-1',
      item_name: 'Potato Jyoti Bulk',
      unit: 'Kg',
      rate: 20,
      purchase_rate: 18,
      active: true,
      can_be_purchased: true,
      can_be_sold: true,
    },
    {
      zoho_item_id: 'ITEM-2',
      item_name: 'Onion Red Bulk',
      unit: 'Kg',
      rate: 30,
      purchase_rate: 0, // No default purchase rate
      active: true,
      can_be_purchased: true,
      can_be_sold: true,
    },
    {
      zoho_item_id: 'ITEM-INACTIVE',
      item_name: 'Old Inactive Item',
      unit: 'Kg',
      rate: 15,
      purchase_rate: 15,
      active: false, // INACTIVE
      can_be_purchased: true,
      can_be_sold: true,
    },
  ];

  // Create test workbook
  const wb = XLSX.utils.book_new();
  const testData = [
    // Header
    ['Vendor ID', 'Vendor Mobile', 'Vendor Name (info only)', 'Item ID', 'Article (info only)', 'Qty', 'Rate', 'Unit', 'Location (optional)', 'Row Comment (optional)'],
    // Row 1: Fully valid with Vendor ID & Item ID
    ['V-100', '', 'Wrong Name Ignored', 'ITEM-1', 'Different Article Ignored', 50, 19, 'Kg', 'Hub-A', 'First test'],
    // Row 2: Resolved by Mobile (Vendor ID missing), Rate missing -> fallback to item default rate (18)
    ['', '9876543210', '', 'ITEM-1', '', 100, '', 'Kg', 'Hub-A', 'Fallback rate test'],
    // Row 3: Ambiguous Mobile (shared by V-200A and V-200B)
    ['', '9988776655', '', 'ITEM-1', '', 30, 20, 'Kg', '', 'Ambiguous test'],
    // Row 4: Skipped (Qty = 0)
    ['V-100', '', '', 'ITEM-1', '', 0, 20, 'Kg', '', 'Skip test'],
    // Row 5: Rate missing and item has no default purchase rate -> Error
    ['V-100', '', '', 'ITEM-2', '', 40, '', 'Kg', '', 'Missing rate error test'],
    // Row 6: Inactive Item -> Error
    ['V-100', '', '', 'ITEM-INACTIVE', '', 25, 15, 'Kg', '', 'Inactive item test'],
    // Row 7: Unknown Vendor ID and no mobile -> Error
    ['V-999', '', '', 'ITEM-1', '', 10, 20, 'Kg', '', 'Unknown vendor test'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(testData);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  const result = parseBulkPOWorkbook(buffer, mockVendors, mockItems);

  assert(!result.isLegacyTemplate, 'Identified as new ID-based template');
  assert(result.totalRows === 7, `Total rows parsed: ${result.totalRows} (expected 7)`);

  // Check Row 1 (OK)
  const r1 = result.rows[0];
  assert(r1.status === 'OK' && r1.resolvedVendorId === 'V-100' && r1.resolvedItemId === 'ITEM-1', 'Row 1 matched by Vendor ID and Item ID');

  // Check Row 2 (OK via Mobile, fallback rate applied)
  const r2 = result.rows[1];
  assert(
    r2.status === 'OK' &&
    r2.resolvedVendorId === 'V-100' &&
    r2.resolvedRate === 18 &&
    r2.rateSource === 'item_catalog_default',
    'Row 2 matched by Mobile and used item default purchase rate 18'
  );

  // Check Row 3 (AMBIGUOUS)
  const r3 = result.rows[2];
  assert(
    r3.status === 'AMBIGUOUS' &&
    r3.ambiguousCandidates?.length === 2,
    'Row 3 correctly marked AMBIGUOUS with 2 candidate vendors'
  );

  // Check Row 4 (SKIPPED: no qty)
  const r4 = result.rows[3];
  assert(r4.status === 'SKIPPED' && r4.reasons.includes('Skipped: no qty'), 'Row 4 skipped due to Qty = 0');

  // Check Row 5 (ERROR: rate missing)
  const r5 = result.rows[4];
  assert(r5.status === 'ERROR' && r5.reasons.some((re) => re.includes('Rate missing')), 'Row 5 rejected for missing rate on item with rate 0');

  // Check Row 6 (ERROR: inactive item)
  const r6 = result.rows[5];
  assert(r6.status === 'ERROR' && r6.reasons.some((re) => re.includes('not found in active catalog')), 'Row 6 rejected for inactive item');

  // Check Row 7 (ERROR: vendor not found)
  const r7 = result.rows[6];
  assert(r7.status === 'ERROR' && r7.reasons.some((re) => re.includes('not found')), 'Row 7 rejected for unknown vendor');
}

// Test 3: Legacy Name-Based Sheet Detection
console.log('\n[TEST 3] Legacy Name-Based Sheet Detection & Auto-Mapping');
{
  const mockVendors = [
    { id: 'V-100', name: 'Ramesh Kumar', mobile: '9876543210' },
  ];
  const mockItems = [
    {
      zoho_item_id: 'ITEM-1',
      item_name: 'Potato Jyoti Bulk',
      unit: 'Kg',
      rate: 20,
      purchase_rate: 18,
      active: true,
      can_be_purchased: true,
      can_be_sold: true,
    },
  ];

  const wb = XLSX.utils.book_new();
  const legacyData = [
    ['Farmer Name', 'Mobile', 'Article', 'Qty', 'Rate', 'Total'],
    ['Ramesh Kumar', '9876543210', 'Potato Jyoti Bulk', 50, 19, 950],
  ];

  const ws = XLSX.utils.aoa_to_sheet(legacyData);
  XLSX.utils.book_append_sheet(wb, ws, 'Old Format');
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  const result = parseBulkPOWorkbook(buffer, mockVendors, mockItems);

  assert(result.isLegacyTemplate === true, 'Detected old name-based sheet');
  assert(result.rows[0].status === 'OK', 'Auto-mapped legacy row into preview for user review');
  assert(result.rows[0].resolvedVendorId === 'V-100', 'Resolved legacy vendor');
  assert(result.rows[0].resolvedItemId === 'ITEM-1', 'Resolved legacy item');
}

// Test 4: Template & Error Report Generation
console.log('\n[TEST 4] Template & Error Report Generation');
{
  const mockVendors = [{ id: 'V-100', name: 'Vendor 100', mobile: '9876543210' }];
  const mockItems = [{ zoho_item_id: 'ITEM-1', item_name: 'Potato Bulk', unit: 'Kg', rate: 20, purchase_rate: 18, active: true, can_be_purchased: true, can_be_sold: true }];

  const templateBytes = generateBulkPOTemplate(mockVendors, mockItems);
  assert(templateBytes.length > 0, 'Generated template file bytes');

  const readBackWb = XLSX.read(templateBytes, { type: 'array' });
  assert(readBackWb.SheetNames.includes('PO Upload'), 'Template contains "PO Upload" sheet');
  assert(readBackWb.SheetNames.includes('Master List'), 'Template contains "Master List" sheet');

  const errorReportBytes = generateErrorReport([]);
  assert(errorReportBytes.length > 0, 'Generated error report file bytes');
}

console.log('\n' + '='.repeat(70));
console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('='.repeat(70));

if (failed > 0) {
  process.exit(1);
}
