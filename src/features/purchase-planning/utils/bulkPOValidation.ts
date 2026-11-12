import * as XLSX from 'xlsx';
import type { ItemCatalogEntry } from '../hooks/useItemCatalog';

export interface ActiveVendor {
  id: string; // Zoho contact ID
  name: string;
  company_name?: string | null;
  mobile?: string | null;
  phone?: string | null;
  normalizedMobile?: string | null;
  source?: 'zoho' | 'supabase';
}

export type RowValidationStatus = 'OK' | 'ERROR' | 'AMBIGUOUS' | 'SKIPPED';

export interface ValidatedBulkRow {
  rowNumber: number;
  raw: {
    vendorId?: string;
    vendorMobile?: string;
    vendorName?: string;
    itemId?: string;
    article?: string;
    qty?: string | number;
    rate?: string | number;
    unit?: string;
    location?: string;
    rowComment?: string;
  };
  status: RowValidationStatus;
  reasons: string[];
  // Resolved entities
  resolvedVendorId: string | null;
  resolvedVendorName: string | null;
  resolvedVendorMobile: string | null;
  ambiguousCandidates?: ActiveVendor[];
  resolvedItemId: string | null;
  resolvedItemName: string | null;
  resolvedUnit: string | null;
  resolvedQty: number | null;
  resolvedRate: number | null;
  rateSource?: 'file' | 'item_catalog_default';
  location: string | null;
  rowComment: string | null;
}

export interface BulkParseResult {
  isLegacyTemplate: boolean;
  totalRows: number;
  validRowsCount: number;
  ambiguousRowsCount: number;
  errorRowsCount: number;
  skippedRowsCount: number;
  rows: ValidatedBulkRow[];
}

/**
 * Normalizes Indian mobile numbers per strict rule:
 * - remove spaces, hyphens, brackets, dots, and "+"
 * - drop a leading 91 or 0 when longer than 10 digits
 * - keep exactly 10 digits starting with 6-9
 * - store / compare as +91XXXXXXXXXX
 */
export function normalizeMobile(raw: unknown): { isValid: boolean; normalized: string; raw: string; error?: string } {
  if (raw === null || raw === undefined) {
    return { isValid: false, normalized: '', raw: '', error: 'Mobile is empty' };
  }
  const str = String(raw).trim();
  if (!str) {
    return { isValid: false, normalized: '', raw: str, error: 'Mobile is empty' };
  }

  // Remove spaces, hyphens, brackets, dots, and "+"
  let cleaned = str.replace(/[\s\-\(\)\[\]\.\+]/g, '');

  // Drop leading 91 or 0 when longer than 10 digits
  if (cleaned.length > 10) {
    if (cleaned.startsWith('91')) {
      cleaned = cleaned.slice(2);
    } else if (cleaned.startsWith('0')) {
      cleaned = cleaned.slice(1);
    }
  }

  // Exactly 10 digits starting with 6-9
  if (!/^[6-9]\d{9}$/.test(cleaned)) {
    return {
      isValid: false,
      normalized: cleaned,
      raw: str,
      error: `Invalid mobile: must be exactly 10 digits starting with 6-9 (got "${cleaned}")`,
    };
  }

  return {
    isValid: true,
    normalized: `+91${cleaned}`,
    raw: str,
  };
}

/**
 * Standardizes header string for robust matching.
 */
function cleanHeader(header: unknown): string {
  if (!header) return '';
  return String(header).toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Builds vendor indexes for quick and deterministic ID and Mobile resolution.
 */
export function buildVendorLookup(vendors: ActiveVendor[]) {
  const byId = new Map<string, ActiveVendor>();
  const byMobile = new Map<string, ActiveVendor[]>();

  for (const v of vendors) {
    if (!v.id) continue;
    const cleanId = String(v.id).trim();
    byId.set(cleanId, v);

    // Index by phone/mobile if available
    const mob = v.mobile || v.phone;
    if (mob) {
      const norm = normalizeMobile(mob);
      if (norm.isValid) {
        const list = byMobile.get(norm.normalized) || [];
        // Avoid duplicate entries for same vendor
        if (!list.some((existing) => existing.id === cleanId)) {
          list.push({ ...v, normalizedMobile: norm.normalized });
        }
        byMobile.set(norm.normalized, list);
      }
    }
  }

  return { byId, byMobile };
}

/**
 * Builds item indexes for Item ID resolution.
 */
export function buildItemLookup(items: ItemCatalogEntry[]) {
  const byId = new Map<string, ItemCatalogEntry>();
  const byName = new Map<string, ItemCatalogEntry>();

  for (const item of items) {
    if (!item.zoho_item_id) continue;
    byId.set(String(item.zoho_item_id).trim(), item);

    if (item.item_name) {
      byName.set(item.item_name.trim().toLowerCase(), item);
    }
  }

  return { byId, byName };
}

/**
 * Reads workbook buffer / binary and parses by header name.
 */
export function parseBulkPOWorkbook(
  data: ArrayBuffer | Uint8Array,
  vendors: ActiveVendor[],
  items: ItemCatalogEntry[]
): BulkParseResult {
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  if (!worksheet) {
    return {
      isLegacyTemplate: false,
      totalRows: 0,
      validRowsCount: 0,
      ambiguousRowsCount: 0,
      errorRowsCount: 0,
      skippedRowsCount: 0,
      rows: [],
    };
  }

  // Convert to 2D array of rows
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (rawRows.length === 0) {
    return {
      isLegacyTemplate: false,
      totalRows: 0,
      validRowsCount: 0,
      ambiguousRowsCount: 0,
      errorRowsCount: 0,
      skippedRowsCount: 0,
      rows: [],
    };
  }

  // Find header row (usually row 0, but check first 5 rows for match)
  let headerRowIndex = 0;
  let headerMap: Record<string, number> = {};
  let isLegacy = false;

  for (let r = 0; r < Math.min(5, rawRows.length); r++) {
    const row = rawRows[r];
    const map: Record<string, number> = {};

    row.forEach((cellVal: any, colIdx: number) => {
      const clean = cleanHeader(cellVal);
      if (clean) map[clean] = colIdx;
    });

    // Check if this row looks like a header row
    const hasVendorCol = Object.keys(map).some((k) => k.includes('vendor') || k.includes('farmer'));
    const hasItemCol = Object.keys(map).some((k) => k.includes('item') || k.includes('article'));

    if (hasVendorCol || hasItemCol) {
      headerRowIndex = r;
      headerMap = map;
      break;
    }
  }

  // Determine column indexes by known aliases
  const getColIndex = (aliases: string[]): number | undefined => {
    for (const alias of aliases) {
      const cleanAlias = cleanHeader(alias);
      for (const [key, idx] of Object.entries(headerMap)) {
        if (key === cleanAlias || key.startsWith(cleanAlias)) {
          return idx;
        }
      }
    }
    return undefined;
  };

  const colVendorId = getColIndex(['vendorid', 'vendor id', 'zohovendorid', 'contactid']);
  const colVendorMobile = getColIndex(['vendormobile', 'vendor mobile', 'mobile', 'phone', 'mobilenumber', 'farmermobile']);
  const colVendorName = getColIndex(['vendorname', 'vendor name', 'farmername', 'farmer name', 'name']);
  const colItemId = getColIndex(['itemid', 'item id', 'zohoitemid', 'item code']);
  const colArticle = getColIndex(['article', 'itemname', 'item name', 'item', 'description']);
  const colQty = getColIndex(['qty', 'quantity', 'requiredqty', 'reqqty']);
  const colRate = getColIndex(['rate', 'price', 'purchaserate', 'unitprice']);
  const colUnit = getColIndex(['unit', 'uom', 'measure']);
  const colLocation = getColIndex(['location', 'center', 'hub', 'branch']);
  const colComment = getColIndex(['rowcomment', 'row comment', 'comment', 'comments', 'notes', 'remark', 'remarks']);

  // Detect whether this is the new ID-based template or legacy name-based
  if (colVendorId === undefined && colItemId === undefined) {
    isLegacy = true;
  }

  const { byId: vendorById, byMobile: vendorByMobile } = buildVendorLookup(vendors);
  const { byId: itemById, byName: itemByName } = buildItemLookup(items);

  const validatedRows: ValidatedBulkRow[] = [];

  for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];

    // Check if entire row is empty or summary row
    const rowNonEmpty = row.some((cell) => cell !== '' && cell !== null && cell !== undefined);
    if (!rowNonEmpty) continue;

    const rawVendorId = colVendorId !== undefined ? String(row[colVendorId] ?? '').trim() : '';
    const rawVendorMobile = colVendorMobile !== undefined ? String(row[colVendorMobile] ?? '').trim() : '';
    const rawVendorName = colVendorName !== undefined ? String(row[colVendorName] ?? '').trim() : '';
    const rawItemId = colItemId !== undefined ? String(row[colItemId] ?? '').trim() : '';
    const rawArticle = colArticle !== undefined ? String(row[colArticle] ?? '').trim() : '';
    const rawQty = colQty !== undefined ? row[colQty] : '';
    const rawRate = colRate !== undefined ? row[colRate] : '';
    const rawUnit = colUnit !== undefined ? String(row[colUnit] ?? '').trim() : '';
    const rawLocation = colLocation !== undefined ? String(row[colLocation] ?? '').trim() : '';
    const rawComment = colComment !== undefined ? String(row[colComment] ?? '').trim() : '';

    // If all essential fields are blank, skip
    if (!rawVendorId && !rawVendorMobile && !rawVendorName && !rawItemId && !rawArticle && !rawQty) {
      continue;
    }

    const reasons: string[] = [];
    let status: RowValidationStatus = 'OK';

    // 1. Quantity Check (Requirement 8)
    const numQty = Number(rawQty);
    const hasValidQty = !isNaN(numQty) && numQty > 0 && String(rawQty).trim() !== '';

    if (!hasValidQty) {
      status = 'SKIPPED';
      reasons.push('Skipped: no qty');
    }

    // 2. Vendor Resolution (Requirement 3, 4, 5)
    let resolvedVendor: ActiveVendor | null = null;
    let ambiguousCandidates: ActiveVendor[] | undefined = undefined;

    if (rawVendorId) {
      // (a) Match by Vendor ID
      const v = vendorById.get(rawVendorId);
      if (v) {
        resolvedVendor = v;
      } else {
        // Vendor ID was provided but not found
        // If mobile is also provided, try mobile per requirement 3b
        if (rawVendorMobile) {
          const normMob = normalizeMobile(rawVendorMobile);
          if (normMob.isValid) {
            const matches = vendorByMobile.get(normMob.normalized) || [];
            if (matches.length === 1) {
              resolvedVendor = matches[0];
              reasons.push(`Vendor ID '${rawVendorId}' invalid; resolved by mobile to ${resolvedVendor.name}`);
            } else if (matches.length > 1) {
              status = 'AMBIGUOUS';
              ambiguousCandidates = matches;
              reasons.push(`Vendor ID '${rawVendorId}' invalid; mobile matches ${matches.length} vendors`);
            } else {
              if (status !== 'SKIPPED') status = 'ERROR';
              reasons.push(`Vendor ID '${rawVendorId}' not found and mobile not matched`);
            }
          } else {
            if (status !== 'SKIPPED') status = 'ERROR';
            reasons.push(`Vendor ID '${rawVendorId}' not found and mobile invalid`);
          }
        } else {
          if (status !== 'SKIPPED') status = 'ERROR';
          reasons.push(`Vendor ID '${rawVendorId}' not found in active vendors`);
        }
      }
    } else if (rawVendorMobile) {
      // (b) Match by normalized Vendor Mobile
      const normMob = normalizeMobile(rawVendorMobile);
      if (!normMob.isValid) {
        if (status !== 'SKIPPED') status = 'ERROR';
        reasons.push(normMob.error || 'Invalid mobile');
      } else {
        const matches = vendorByMobile.get(normMob.normalized) || [];
        if (matches.length === 1) {
          resolvedVendor = matches[0];
        } else if (matches.length > 1) {
          status = 'AMBIGUOUS';
          ambiguousCandidates = matches;
          reasons.push(`Mobile matches ${matches.length} vendors (ambiguous, pick below)`);
        } else {
          if (status !== 'SKIPPED') status = 'ERROR';
          reasons.push(`No active vendor found with mobile ${normMob.normalized}`);
        }
      }
    } else if (isLegacy && rawVendorName) {
      // Legacy fallback for old sheet (informational matching for review)
      const cleanName = rawVendorName.toLowerCase();
      const matched = vendors.filter((v) => v.name?.toLowerCase() === cleanName);
      if (matchesSingle(matched)) {
        resolvedVendor = matched[0];
        reasons.push('Legacy mapping: resolved by name');
      } else if (matched.length > 1) {
        status = 'AMBIGUOUS';
        ambiguousCandidates = matched;
        reasons.push(`Legacy: Name matches ${matched.length} vendors`);
      } else {
        if (status !== 'SKIPPED') status = 'ERROR';
        reasons.push(`Legacy: Vendor name '${rawVendorName}' not found`);
      }
    } else {
      // (c) ERROR: Never match by name alone in new template
      if (status !== 'SKIPPED') status = 'ERROR';
      reasons.push('Missing Vendor ID and Vendor Mobile');
    }

    // 3. Item Resolution (Requirement 6)
    let resolvedItem: ItemCatalogEntry | null = null;

    if (rawItemId) {
      const item = itemById.get(rawItemId);
      if (item && item.active !== false) {
        resolvedItem = item;
      } else {
        // Check "Column 1" rule: Do not accept old Column 1 values unless they exist in items AND Article matches
        if (rawArticle && item && item.item_name.toLowerCase().trim() === rawArticle.toLowerCase().trim()) {
          resolvedItem = item;
        } else {
          if (status !== 'SKIPPED') status = 'ERROR';
          reasons.push(`Item ID '${rawItemId}' not found in active catalog`);
        }
      }
    } else if (isLegacy && rawArticle) {
      // Legacy auto-map by Article name for confirmation
      const item = itemByName.get(rawArticle.toLowerCase().trim());
      if (item && item.active !== false) {
        resolvedItem = item;
        reasons.push('Legacy mapping: resolved by Article name');
      } else {
        if (status !== 'SKIPPED') status = 'ERROR';
        reasons.push(`Legacy: Article '${rawArticle}' not found in active catalog`);
      }
    } else {
      if (status !== 'SKIPPED') status = 'ERROR';
      reasons.push('Missing Item ID');
    }

    // 4. Rate Check (Requirement 8 & chosen behavior)
    let resolvedRate: number | null = null;
    let rateSource: 'file' | 'item_catalog_default' | undefined = undefined;

    const numRate = Number(rawRate);
    if (!isNaN(numRate) && numRate > 0 && String(rawRate).trim() !== '') {
      resolvedRate = numRate;
      rateSource = 'file';
    } else if (hasValidQty) {
      // Row has Qty but no Rate -> check Item default purchase rate
      const defaultPurchaseRate = resolvedItem?.purchase_rate;

      if (defaultPurchaseRate && defaultPurchaseRate > 0) {
        resolvedRate = defaultPurchaseRate;
        rateSource = 'item_catalog_default';
        reasons.push(`Using item catalog default purchase rate (₹${defaultPurchaseRate})`);
      } else {
        if (status !== 'SKIPPED') status = 'ERROR';
        reasons.push('Rate missing and item has no default purchase rate');
      }
    }

    const rowObj: ValidatedBulkRow = {
      rowNumber: r + 1,
      raw: {
        vendorId: rawVendorId,
        vendorMobile: rawVendorMobile,
        vendorName: rawVendorName,
        itemId: rawItemId,
        article: rawArticle,
        qty: rawQty,
        rate: rawRate,
        unit: rawUnit,
        location: rawLocation,
        rowComment: rawComment,
      },
      status,
      reasons,
      resolvedVendorId: resolvedVendor?.id ?? null,
      resolvedVendorName: resolvedVendor?.name ?? (rawVendorName || null),
      resolvedVendorMobile: resolvedVendor?.mobile || resolvedVendor?.phone || (rawVendorMobile || null),
      ambiguousCandidates,
      resolvedItemId: resolvedItem?.zoho_item_id ?? null,
      resolvedItemName: resolvedItem?.item_name ?? (rawArticle || null),
      resolvedUnit: resolvedItem?.unit || rawUnit || 'Kg',
      resolvedQty: hasValidQty ? numQty : null,
      resolvedRate,
      rateSource,
      location: rawLocation || null,
      rowComment: rawComment || null,
    };

    validatedRows.push(rowObj);
  }

  const validRowsCount = validatedRows.filter((r) => r.status === 'OK').length;
  const ambiguousRowsCount = validatedRows.filter((r) => r.status === 'AMBIGUOUS').length;
  const errorRowsCount = validatedRows.filter((r) => r.status === 'ERROR').length;
  const skippedRowsCount = validatedRows.filter((r) => r.status === 'SKIPPED').length;

  return {
    isLegacyTemplate: isLegacy,
    totalRows: validatedRows.length,
    validRowsCount,
    ambiguousRowsCount,
    errorRowsCount,
    skippedRowsCount,
    rows: validatedRows,
  };
}

function matchesSingle<T>(arr: T[]): boolean {
  return arr.length === 1;
}

/**
 * Generates the clean Bulk PO Excel template with Master List sheet.
 * Requirement 1:
 * - Columns: Vendor ID | Vendor Mobile | Vendor Name (info only) | Item ID | Article (info only) | Qty | Rate | Unit | Location (optional) | Row Comment (optional)
 * - Sheet 2 "Master List": active vendors (Vendor ID, Name, Mobile) and active items (Item ID, Name, Unit, Default Rate)
 */
export function generateBulkPOTemplate(vendors: ActiveVendor[], items: ItemCatalogEntry[]): Uint8Array {
  const wb = XLSX.utils.book_new();

  // Sheet 1: PO Template
  const headers = [
    'Vendor ID',
    'Vendor Mobile',
    'Vendor Name (info only)',
    'Item ID',
    'Article (info only)',
    'Qty',
    'Rate',
    'Unit',
    'Location (optional)',
    'Row Comment (optional)',
  ];

  // Provide realistic sample rows using actual master list data if available
  const sampleVendor1 = vendors[0];
  const sampleVendor2 = vendors[1] || vendors[0];
  const sampleItem1 = items[0];
  const sampleItem2 = items[1] || items[0];

  const sampleRows = [
    [
      sampleVendor1?.id || '3013316000145706504',
      sampleVendor1?.mobile || sampleVendor1?.phone || '9876543210',
      sampleVendor1?.name || 'Example Vendor 1',
      sampleItem1?.zoho_item_id || '3013316000000085001',
      sampleItem1?.item_name || 'Potato Jyoti Bulk',
      100,
      sampleItem1?.purchase_rate || sampleItem1?.rate || 18,
      sampleItem1?.unit || 'Kg',
      'Hub-1',
      'Grade A stock',
    ],
    [
      sampleVendor2?.id || '3013316000149407360',
      sampleVendor2?.mobile || sampleVendor2?.phone || '9876543211',
      sampleVendor2?.name || 'Example Vendor 2',
      sampleItem2?.zoho_item_id || '3013316000000085002',
      sampleItem2?.item_name || 'Tomato Hybrid Bulk',
      50,
      sampleItem2?.purchase_rate || sampleItem2?.rate || 22,
      sampleItem2?.unit || 'Kg',
      'Hub-1',
      '',
    ],
  ];

  const wsTemplateData = [headers, ...sampleRows];
  const wsTemplate = XLSX.utils.aoa_to_sheet(wsTemplateData);

  // Set column widths for readability
  wsTemplate['!cols'] = [
    { wch: 24 }, // Vendor ID
    { wch: 18 }, // Vendor Mobile
    { wch: 28 }, // Vendor Name (info only)
    { wch: 24 }, // Item ID
    { wch: 28 }, // Article (info only)
    { wch: 10 }, // Qty
    { wch: 10 }, // Rate
    { wch: 10 }, // Unit
    { wch: 20 }, // Location (optional)
    { wch: 26 }, // Row Comment (optional)
  ];

  XLSX.utils.book_append_sheet(wb, wsTemplate, 'PO Upload');

  // Sheet 2: Master List
  const masterHeaders = [
    'Vendor ID',
    'Vendor Name',
    'Vendor Mobile',
    '',
    'Item ID',
    'Item Name',
    'Unit',
    'Default Purchase Rate',
  ];

  const maxRows = Math.max(vendors.length, items.length);
  const masterRows: any[][] = [masterHeaders];

  for (let i = 0; i < maxRows; i++) {
    const v = vendors[i];
    const it = items[i];

    masterRows.push([
      v ? v.id : '',
      v ? v.name : '',
      v ? (v.mobile || v.phone || '') : '',
      '', // spacer
      it ? it.zoho_item_id : '',
      it ? it.item_name : '',
      it ? it.unit : '',
      it ? (it.purchase_rate ?? it.rate ?? '') : '',
    ]);
  }

  const wsMaster = XLSX.utils.aoa_to_sheet(masterRows);
  wsMaster['!cols'] = [
    { wch: 24 },
    { wch: 30 },
    { wch: 18 },
    { wch: 4 },
    { wch: 24 },
    { wch: 30 },
    { wch: 10 },
    { wch: 22 },
  ];

  XLSX.utils.book_append_sheet(wb, wsMaster, 'Master List');

  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(out);
}

/**
 * Generates an Excel error report workbook for download.
 * Requirement 7: "Download error report (xlsx)"
 */
export function generateErrorReport(rows: ValidatedBulkRow[]): Uint8Array {
  const wb = XLSX.utils.book_new();

  const headers = [
    'Row #',
    'Status',
    'Validation Messages / Reasons',
    'Vendor ID (Input)',
    'Vendor Mobile (Input)',
    'Vendor Name (Input)',
    'Resolved Vendor ID',
    'Resolved Vendor Name',
    'Item ID (Input)',
    'Article (Input)',
    'Resolved Item ID',
    'Resolved Item Name',
    'Qty',
    'Rate',
    'Unit',
    'Location',
    'Row Comment',
  ];

  const dataRows = rows.map((r) => [
    r.rowNumber,
    r.status,
    r.reasons.join(' | '),
    r.raw.vendorId || '',
    r.raw.vendorMobile || '',
    r.raw.vendorName || '',
    r.resolvedVendorId || '',
    r.resolvedVendorName || '',
    r.raw.itemId || '',
    r.raw.article || '',
    r.resolvedItemId || '',
    r.resolvedItemName || '',
    r.resolvedQty ?? r.raw.qty ?? '',
    r.resolvedRate ?? r.raw.rate ?? '',
    r.resolvedUnit ?? r.raw.unit ?? '',
    r.location || '',
    r.rowComment || '',
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  ws['!cols'] = [
    { wch: 8 },
    { wch: 14 },
    { wch: 45 },
    { wch: 24 },
    { wch: 18 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 16 },
    { wch: 25 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Validation Report');
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(out);
}
