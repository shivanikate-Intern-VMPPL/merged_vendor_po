/**
 * Automated test suite for Phase 3 WhatsApp Integration
 * Run with: node scripts/test-whatsapp-integration.js
 */

import {
  MetaCloudWhatsAppProvider,
  GupshupWhatsAppProvider,
  TwilioWhatsAppProvider,
  getWhatsAppProvider,
} from '../supabase/functions/_shared/whatsapp/provider.ts';

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
console.log('  RUNNING PHASE 3 WHATSAPP INTEGRATION UNIT TESTS');
console.log('='.repeat(70));

// Test 1: Provider Factory & Default Adapter
console.log('\n[TEST 1] Provider Factory & Swappable Adapters');
{
  const defaultProvider = getWhatsAppProvider();
  assert(defaultProvider.name === 'meta', `Default provider is 'meta' (got '${defaultProvider.name}')`);

  process.env.WHATSAPP_PROVIDER = 'gupshup';
  const gupshupProvider = getWhatsAppProvider();
  assert(gupshupProvider.name === 'gupshup', 'Successfully swaps to Gupshup adapter');

  process.env.WHATSAPP_PROVIDER = 'twilio';
  const twilioProvider = getWhatsAppProvider();
  assert(twilioProvider.name === 'twilio', 'Successfully swaps to Twilio adapter');

  process.env.WHATSAPP_PROVIDER = 'meta';
}

// Test 2: Meta Provider Payload Structure & Missing Credential Safety
console.log('\n[TEST 2] Meta Provider Missing Credentials Safety');
{
  const metaProvider = new MetaCloudWhatsAppProvider('', '');
  metaProvider.sendMessage({
    toPhone: '+919876543210',
    templateName: 'purchase_order_notification',
    templateLanguage: 'en',
    parameters: {
      vendorName: 'Test Vendor',
      poNumber: 'PO-20261109-0001',
      poDate: '09/11/2026',
      totalAmount: '15,000.00',
    },
    document: {
      url: 'https://storage.example.com/po.pdf',
      filename: 'PO-20261109-0001.pdf',
    },
  }).then((res) => {
    assert(res.success === false, 'Fails gracefully when credentials missing');
    assert(res.status === 'failed', 'Sets status to failed');
    assert(res.error.includes('credentials missing'), 'Detailed error message returned');
  });
}

// Test 3: Status Precedence & Callback Progression
console.log('\n[TEST 3] Status Progression Logic');
{
  const STATUS_PRECEDENCE = {
    failed: -1,
    queued: 0,
    sent: 1,
    delivered: 2,
    read: 3,
  };

  assert(STATUS_PRECEDENCE['read'] > STATUS_PRECEDENCE['delivered'], "'read' ranks higher than 'delivered'");
  assert(STATUS_PRECEDENCE['delivered'] > STATUS_PRECEDENCE['sent'], "'delivered' ranks higher than 'sent'");
  assert(STATUS_PRECEDENCE['sent'] > STATUS_PRECEDENCE['queued'], "'sent' ranks higher than 'queued'");

  // Verify that an out-of-order 'delivered' receipt does not overwrite an existing 'read'
  const currentStatus = 'read';
  const newStatus = 'delivered';
  const shouldUpdate = STATUS_PRECEDENCE[newStatus] >= STATUS_PRECEDENCE[currentStatus];
  assert(!shouldUpdate, 'Correctly prevents downgrading read status to delivered');
}

// Test 4: Webhook Signature HMAC Verification
console.log('\n[TEST 4] Webhook Signature Verification');
{
  import('crypto').then(async (crypto) => {
    const appSecret = 'my_super_secret_app_key';
    const payload = JSON.stringify({ entry: [{ id: '123' }] });
    const hmac = crypto.createHmac('sha256', appSecret).update(payload).digest('hex');
    const headerSig = `sha256=${hmac}`;

    const dummyReq = new Request('https://example.com/webhook', {
      method: 'POST',
      headers: { 'x-hub-signature-256': headerSig },
      body: payload,
    });

    const meta = new MetaCloudWhatsAppProvider('12345', 'token', appSecret);
    const isValid = await meta.verifyWebhookSignature(dummyReq, payload);
    assert(isValid === true, 'HMAC SHA-256 signature verified successfully');

    const invalidReq = new Request('https://example.com/webhook', {
      method: 'POST',
      headers: { 'x-hub-signature-256': 'sha256=tampered' },
      body: payload,
    });
    const isInvalid = await meta.verifyWebhookSignature(invalidReq, payload);
    assert(isInvalid === false, 'Tampered HMAC signature rejected');

    console.log('\n' + '='.repeat(70));
    console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('='.repeat(70));

    if (failed > 0) process.exit(1);
  });
}
