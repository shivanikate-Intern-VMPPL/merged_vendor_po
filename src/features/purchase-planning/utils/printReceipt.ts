
import type { ReviewPurchaseOrder } from '../hooks/usePurchaseOrders';

/*
 * ============================================================
 * Mulyam Thermal Receipt Printer
 * Printer: XP-A260H
 *
 * FIX: this template previously built label/value pairs as
 * separate flex <span> elements (meta-label / meta-value),
 * relying entirely on CSS to create the visual gap between
 * them. Whatever pipeline actually drives this printer does
 * not reliably preserve that CSS-only spacing — the printed
 * output showed "PO NumberPO-20260813-0021" and
 * "ITEMQTYRATETAXTOTAL" with words fused together, because the
 * only thing separating them was a flex layout gap, not an
 * actual space character in the text.
 *
 * The already-working single-PO receipt (SuccessScreen.tsx)
 * never had this problem because it puts the label, colon, and
 * value into ONE literal text string, e.g. `PO No: ${po_number}`
 * — so the spacing survives no matter how the printer's
 * pipeline handles CSS. This file now follows that exact same
 * pattern, and matches its page width (72mm) and general
 * structure, so both receipts look identical.
 *
 * - This file contains the ONLY receipt template.
 * - Single Print and Print All use the same template.
 * - We do NOT print the React page.
 * - We do NOT use window.print() anywhere outside this file.
 * ============================================================
 */

/**
 * Escape text before putting it into HTML.
 * This prevents special characters in vendor/item names
 * from breaking the receipt HTML.
 */
function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Format date and time for receipt.
 */
function formatDateTime(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const datePart = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const timePart = date
    .toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .toLowerCase();

  return `${datePart}, ${timePart}`;
}

/**
 * Create one compact 72-mm thermal receipt.
 *
 * This is the ONLY receipt HTML used by:
 * - Print Receipt
 * - Print All
 *
 * Every line below is built as ONE literal text string with
 * spacing already embedded in it — never split across separate
 * elements that depend on CSS layout to create a visual gap.
 */
function buildReceiptHtml(
  po: ReviewPurchaseOrder,
  collectedBy: string,
): string {
  // const safeCollectedBy = escapeHtml(collectedBy);
    // Use the real person who created the PO; fall back to the passed value.
  const safeCollectedBy = escapeHtml(po.created_by_name || collectedBy);
  const safePoNumber = escapeHtml(po.po_number);
  const safeVendor = escapeHtml(po.vendor_name);
  const safeDateTime = escapeHtml(formatDateTime(po.created_at));

  /*
   * Calculate subtotal.
   *
   * IMPORTANT:
   * Use != null instead of a truthy check so rate = 0
   * is handled correctly.
   */
  const subtotal = po.items.reduce((sum, item) => {
    const rate =
      item.rate != null ? Number(item.rate) : 0;

    const quantity = Number(item.quantity) || 0;

    return sum + quantity * rate;
  }, 0);

  /*
   * The current ReviewPurchaseOrder type used by your app
   * does not expose a tax field.
   *
   * Therefore we keep the same behavior as your previous
   * printReceipt.ts and show Tax = 0.00.
   */
  const tax = 0;

  const grandTotal = subtotal + tax;

  /*
   * Item lines — each one is a single literal text string,
   * same pattern as the working single-PO template's item
   * text (`${qty} x ${rate} = ${total}`), not a multi-span
   * flex row.
   */
  const itemsText = po.items
    .map((item) => {
      const itemName = escapeHtml(item.item_name);
      const quantity = Number(item.quantity) || 0;
      const rate = item.rate != null ? Number(item.rate) : 0;
      const lineTotal = quantity * rate;

      return `${itemName}\n  ${quantity} Kg x Rs.${rate.toFixed(2)} = Rs.${lineTotal.toFixed(2)}`;
    })
    .join('\n');

  const line = '-'.repeat(32);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=72mm, initial-scale=1.0" />
  <title>Purchase Receipt - ${safePoNumber}</title>

  <style>
    @page {
      size: 72mm auto;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    html,
    body {
      width: 72mm;
      margin: 0;
      padding: 0;
      background: #fff;
      color: #000;
    }

    body {
      font-family: "Courier New", Courier, monospace;
      overflow-x: hidden;
    }

    .receipt {
      width: 68mm;
      margin: 0 auto;
      padding: 2mm 0 3mm;
      font-size: 11px;
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    .center { text-align: center; }
    .bold { font-weight: 700; }

    .line-sep {
      white-space: pre;
      margin: 4px 0;
      overflow: hidden;
    }

    .section { margin: 4px 0; }

    .row {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      margin: 3px 0;
    }

    .row span:first-child { flex: 1; }

    .row span:last-child {
      white-space: nowrap;
      text-align: right;
    }

    .items {
      white-space: pre-wrap;
      word-break: break-word;
    }

    @media print {
      html,
      body {
        width: 72mm !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .receipt {
        width: 68mm !important;
        margin: 0 auto !important;
        padding-top: 2mm !important;
        padding-bottom: 3mm !important;
      }

      .receipt,
      .section,
      .items {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .receipt-page {
        page-break-after: always;
        break-after: page;
      }

      .receipt-page:last-child {
        page-break-after: auto;
        break-after: auto;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-page">
    <div class="receipt">

      <div class="center bold">MULYAM AGRONOMICS PVT LTD</div>
      <div class="center">Purchase Receipt</div>

      <div class="line-sep">${line}</div>

      <div class="section">
        <div>PO No: ${safePoNumber}</div>
        <div>Date: ${safeDateTime}</div>
        <div>Vendor: ${safeVendor}</div>
        <div>Collected By: ${safeCollectedBy}</div>
      </div>

      <div class="line-sep">${line}</div>

      <div class="bold">ITEMS</div>
      <div class="section items">${itemsText}</div>

      <div class="line-sep">${line}</div>

      <div class="row">
        <span>Subtotal</span>
        <span>Rs.${subtotal.toFixed(2)}</span>
      </div>

      <div class="row">
        <span>Tax</span>
        <span>Rs.${tax.toFixed(2)}</span>
      </div>

      <div class="row bold">
        <span>GRAND TOTAL</span>
        <span>Rs.${grandTotal.toFixed(2)}</span>
      </div>

      <div class="line-sep">${line}</div>

      <div class="section">Collected By: ${safeCollectedBy}</div>

      <div class="center">________________________</div>
      <div class="center">For Mulyam Agronomics Pvt Ltd</div>
      <div class="center">Authorized Signature</div>

      <div class="line-sep">${line}</div>
      <div class="center bold">Thank you!</div>

    </div>
  </div>
</body>
</html>
`;
}


/**
 * Wait until the print document has loaded.
 */
async function waitForPrintDocument(
  win: Window
): Promise<void> {

  await new Promise<void>((resolve) => {

    const start = Date.now();

    const check = () => {

      if (
        win.document.readyState === 'complete' ||
        Date.now() - start >= 2000
      ) {
        resolve();
        return;
      }

      window.setTimeout(check, 50);
    };

    check();
  });

  try {
    if (win.document.fonts?.ready) {
      await win.document.fonts.ready;
    }
  } catch {
    // Fonts are optional for thermal printing.
  }

  /*
   * Give the browser one small rendering cycle.
   */
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 100);
  });
}


/**
 * Close a print window safely.
 */
function closePrintWindow(win: Window): void {
  try {
    win.close();
  } catch {
    // Ignore browser restrictions.
  }
}


/**
 * ============================================================
 * PRINT ONE RECEIPT
 * ============================================================
 */
export async function printReceipt(
  po: ReviewPurchaseOrder,
  collectedBy: string = 'Procurement Team'
): Promise<void> {

  /*
   * IMPORTANT:
   *
   * Open the print window immediately inside the button
   * action so Chrome does not block the popup.
   */
  const win = window.open(
    '',
    '_blank',
    'width=400,height=700'
  );

  if (!win) {
    window.alert(
      'Please allow pop-ups for this website to print the receipt.'
    );

    return;
  }

  let closed = false;

  const closeWindow = () => {
    if (closed) {
      return;
    }

    closed = true;

    closePrintWindow(win);
  };

  try {

    /*
     * Build the EXACT SAME receipt used by Print All.
     */
    const html = buildReceiptHtml(
      po,
      collectedBy
    );

    win.document.open();

    win.document.write(html);

    win.document.close();

    await waitForPrintDocument(win);

    win.focus();

    /*
     * This is the ONLY actual browser print command.
     */
    win.print();

    /*
     * Chrome normally fires this after printing.
     */
    win.onafterprint = closeWindow;

    /*
     * Safety timeout in case onafterprint is not fired.
     */
    window.setTimeout(
      closeWindow,
      30000
    );

  } catch (error) {

    console.error(
      'Failed to print purchase receipt:',
      error
    );

    closeWindow();

    window.alert(
      'Unable to prepare the receipt for printing.'
    );
  }
}


/**
 * ============================================================
 * PRINT ALL RECEIPTS
 * ============================================================
 *
 * IMPORTANT:
 *
 * We do NOT:
 * - extract <body>
 * - extract <style>
 * - reconstruct CSS
 * - create a second receipt design
 *
 * Instead we directly call buildReceiptHtml() for every PO
 * and put those receipts into ONE print document.
 *
 * Therefore:
 *
 * Print Receipt === Print All
 *
 * ============================================================
 */
export async function printAllReceipts(
  orders: ReviewPurchaseOrder[],
  collectedBy: string = 'Procurement Team'
): Promise<void> {

  if (!orders.length) {

    window.alert(
      'There are no synced purchase orders to print.'
    );

    return;
  }

  const win = window.open(
    '',
    '_blank',
    'width=400,height=700'
  );

  if (!win) {

    window.alert(
      'Please allow pop-ups for this website to print the receipts.'
    );

    return;
  }

  let closed = false;

  const closeWindow = () => {

    if (closed) {
      return;
    }

    closed = true;

    closePrintWindow(win);
  };

  try {

    /*
     * Build each receipt using the SAME function used
     * by Single Print.
     */
    const receipts = orders
      .map((po) => {

        const html = buildReceiptHtml(
          po,
          collectedBy
        );

        /*
         * Extract only the receipt-page from the complete
         * document.
         *
         * This does NOT recreate the styling.
         *
         * Instead, we use the same receipt markup and the
         * CSS defined below.
         */
        const bodyMatch = html.match(
          /<body[^>]*>([\s\S]*?)<\/body>/i
        );

        return bodyMatch
          ? bodyMatch[1]
          : '';
      })
      .join('');

    /*
     * Build ONE document.
     *
     * The receipt CSS here is intentionally the same
     * 72-mm thermal CSS used in buildReceiptHtml().
     */
    const combinedHtml = `
<!DOCTYPE html>
<html lang="en">
<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=72mm, initial-scale=1.0"
  />

  <title>Mulyam Purchase Receipts</title>

  <style>

    @page {
      size: 72mm auto;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    html,
    body {
      width: 72mm;
      margin: 0;
      padding: 0;
      background: #fff;
      color: #000;
    }

    body {
      font-family: "Courier New", Courier, monospace;
      overflow-x: hidden;
    }

    .receipt {
      width: 68mm;
      margin: 0 auto;
      padding: 2mm 0 3mm;
      font-size: 11px;
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    .center { text-align: center; }
    .bold { font-weight: 700; }

    .line-sep {
      white-space: pre;
      margin: 4px 0;
      overflow: hidden;
    }

    .section { margin: 4px 0; }

    .row {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      margin: 3px 0;
    }

    .row span:first-child { flex: 1; }

    .row span:last-child {
      white-space: nowrap;
      text-align: right;
    }

    .items {
      white-space: pre-wrap;
      word-break: break-word;
    }

    .receipt-page {
      width: 72mm;
      margin: 0;
      padding: 0;
      page-break-after: always;
      break-after: page;
    }

    .receipt-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    @media print {
      html,
      body {
        width: 72mm !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
      }

      .receipt {
        width: 68mm !important;
        margin: 0 auto !important;
        padding-top: 2mm !important;
        padding-bottom: 3mm !important;
      }
    }

  </style>

</head>

<body>

  ${receipts}

</body>
</html>
`;

    win.document.open();

    win.document.write(combinedHtml);

    win.document.close();

    await waitForPrintDocument(win);

    win.focus();

    win.print();

    win.onafterprint = closeWindow;

    window.setTimeout(
      closeWindow,
      30000
    );

  } catch (error) {

    console.error(
      'Failed to print purchase receipts:',
      error
    );

    closeWindow();

    window.alert(
      'Unable to prepare the receipts for printing.'
    );
  }
}
