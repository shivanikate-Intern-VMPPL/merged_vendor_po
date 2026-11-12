// WhatsApp Provider Adapter Interface & Factory

function getEnv(key: string): string | undefined {
  if (typeof Deno !== 'undefined' && Deno?.env) {
    return Deno.env.get(key);
  }
  if (typeof process !== 'undefined' && process?.env) {
    return process.env[key];
  }
  return undefined;
}

export interface SendTemplateMessageParams {
  toPhone: string; // E.164 format, e.g. +91XXXXXXXXXX
  templateName: string;
  templateLanguage: string;
  parameters: {
    vendorName: string;
    poNumber: string;
    poDate: string;
    totalAmount: string;
  };
  document?: {
    url: string;
    filename: string;
  };
}

export interface SendMessageResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
  status: 'sent' | 'failed' | 'queued';
  rawResponse?: unknown;
}

export interface WhatsAppProvider {
  name: string;
  sendMessage(params: SendTemplateMessageParams): Promise<SendMessageResult>;
  verifyWebhookSignature?(req: Request, rawBody: string): Promise<boolean>;
}

/**
 * Meta WhatsApp Cloud API Provider Implementation
 */
export class MetaCloudWhatsAppProvider implements WhatsAppProvider {
  name = 'meta';

  private phoneNumberId: string;
  private accessToken: string;
  private appSecret?: string;

  constructor(phoneNumberId?: string, accessToken?: string, appSecret?: string) {
    this.phoneNumberId = phoneNumberId || getEnv('WHATSAPP_PHONE_NUMBER_ID') || '';
    this.accessToken = accessToken || getEnv('WHATSAPP_API_TOKEN') || getEnv('META_ACCESS_TOKEN') || '';
    this.appSecret = appSecret || getEnv('WHATSAPP_APP_SECRET');
  }

  async sendMessage(params: SendTemplateMessageParams): Promise<SendMessageResult> {
    if (!this.phoneNumberId || !this.accessToken) {
      return {
        success: false,
        status: 'failed',
        error: 'Meta WhatsApp credentials missing (WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_API_TOKEN)',
      };
    }

    // Clean phone number: Meta API expects recipient digits with country code, no "+" or spaces
    const recipient = params.toPhone.replace(/[^0-9]/g, '');

    const components: any[] = [];

    // Header document component (if PO PDF is present)
    if (params.document?.url) {
      components.push({
        type: 'header',
        parameters: [
          {
            type: 'document',
            document: {
              link: params.document.url,
              filename: params.document.filename || `PO-${params.parameters.poNumber}.pdf`,
            },
          },
        ],
      });
    }

    // Body variables component:
    // {{1}} = Vendor Name, {{2}} = PO Number, {{3}} = PO Date, {{4}} = Total Amount
    components.push({
      type: 'body',
      parameters: [
        { type: 'text', text: params.parameters.vendorName || 'Valued Partner' },
        { type: 'text', text: params.parameters.poNumber || 'N/A' },
        { type: 'text', text: params.parameters.poDate || new Date().toISOString().slice(0, 10) },
        { type: 'text', text: params.parameters.totalAmount || '0.00' },
      ],
    });

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'template',
      template: {
        name: params.templateName,
        language: {
          code: params.templateLanguage || 'en',
        },
        components,
      },
    };

    const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        const errorMsg = data.error?.message || `HTTP ${response.status}: Failed to send WhatsApp message`;
        console.error('[Meta WhatsApp Error]', data.error || data);
        return {
          success: false,
          status: 'failed',
          error: errorMsg,
          rawResponse: data,
        };
      }

      const messageId = data.messages?.[0]?.id;
      return {
        success: true,
        status: 'sent',
        providerMessageId: messageId,
        rawResponse: data,
      };
    } catch (err) {
      console.error('[Meta WhatsApp Network Error]', err);
      return {
        success: false,
        status: 'failed',
        error: (err as Error).message || 'Network exception connecting to Meta Cloud API',
      };
    }
  }

  async verifyWebhookSignature(req: Request, rawBody: string): Promise<boolean> {
    if (!this.appSecret) return true; // If no app secret configured, allow bypass in dev
    const signature = req.headers.get('x-hub-signature-256');
    if (!signature) return false;

    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(this.appSecret);
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );

      const expectedSigHex = signature.replace('sha256=', '');
      const expectedSigBytes = new Uint8Array(
        expectedSigHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
      );

      return await crypto.subtle.verify('HMAC', key, expectedSigBytes, encoder.encode(rawBody));
    } catch (err) {
      console.warn('Failed to verify HMAC signature:', err);
      return false;
    }
  }
}

/**
 * Gupshup / Generic Adapter Skeleton
 */
export class GupshupWhatsAppProvider implements WhatsAppProvider {
  name = 'gupshup';
  async sendMessage(_params: SendTemplateMessageParams): Promise<SendMessageResult> {
    return {
      success: false,
      status: 'failed',
      error: 'Gupshup adapter is ready to be configured with API credentials.',
    };
  }
}

/**
 * Twilio Adapter Skeleton
 */
export class TwilioWhatsAppProvider implements WhatsAppProvider {
  name = 'twilio';
  async sendMessage(_params: SendTemplateMessageParams): Promise<SendMessageResult> {
    return {
      success: false,
      status: 'failed',
      error: 'Twilio adapter is ready to be configured with API credentials.',
    };
  }
}

/**
 * Provider Factory: easily swappable via WHATSAPP_PROVIDER env variable
 */
export function getWhatsAppProvider(): WhatsAppProvider {
  const providerName = (getEnv('WHATSAPP_PROVIDER') || 'meta').toLowerCase();
  switch (providerName) {
    case 'gupshup':
      return new GupshupWhatsAppProvider();
    case 'twilio':
      return new TwilioWhatsAppProvider();
    case 'meta':
    default:
      return new MetaCloudWhatsAppProvider();
  }
}
