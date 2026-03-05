import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const preferredRegion = ['bom1'];

export async function POST(request: Request) {
  const requestId = `smsotp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const mask = (value?: string | null) => {
    if (!value) return 'missing';
    if (value.length <= 8) return `${value.slice(0, 2)}***`;
    return `${value.slice(0, 4)}...${value.slice(-4)}`;
  };

  const normalizeEnv = (value?: string | null) => {
    if (!value) return '';
    return value.trim().replace(/^['"]|['"]$/g, '');
  };

  const parseAirtelResponse = (rawText: string, contentType: string | null) => {
    const normalizedContentType = (contentType ?? '').toLowerCase();
    const shouldTryJson =
      normalizedContentType.includes('application/json') ||
      normalizedContentType.includes('+json') ||
      (!normalizedContentType && rawText.trim().startsWith('{')) ||
      (!normalizedContentType && rawText.trim().startsWith('['));

    if (!rawText) {
      return { parsed: {}, parseError: null as unknown, isJson: shouldTryJson };
    }

    if (!shouldTryJson) {
      return {
        parsed: {
          raw: rawText,
          contentType: contentType ?? 'unknown',
        },
        parseError: null as unknown,
        isJson: false,
      };
    }

    try {
      return { parsed: JSON.parse(rawText), parseError: null as unknown, isJson: true };
    } catch (parseError) {
      return {
        parsed: {
          raw: rawText,
          contentType: contentType ?? 'unknown',
        },
        parseError,
        isJson: true,
      };
    }
  };

  try {
    console.log(`[sms-sendotp][${requestId}] Incoming OTP request`);

    const { mobile, message } = await request.json();
    console.log(`[sms-sendotp][${requestId}] Parsed request body`, {
      mobile,
      messageLength: typeof message === 'string' ? message.length : null,
    });

    // 1. Credentials from your Airtel IQ Dashboard
    const CUSTOMER_ID = normalizeEnv(process.env.CUSTOMER_ID);
    const ENTITY_ID = normalizeEnv(process.env.ENTITY_ID); // From DLT Portal
    const TEMPLATE_ID = normalizeEnv(process.env.TEMPLATE_ID); // From DLT Portal
    const AUTHORIZATION = normalizeEnv(process.env.AUTHORIZATION);

    console.log(`[sms-sendotp][${requestId}] Env check`, {
      hasCustomerId: Boolean(CUSTOMER_ID),
      hasEntityId: Boolean(ENTITY_ID),
      hasTemplateId: Boolean(TEMPLATE_ID),
      hasAuthorization: Boolean(AUTHORIZATION),
      authorizationLooksBasic: AUTHORIZATION.startsWith('Basic '),
      authorizationLength: AUTHORIZATION.length,
      customerIdPreview: mask(CUSTOMER_ID),
      entityIdPreview: mask(ENTITY_ID),
      templateIdPreview: mask(TEMPLATE_ID),
      authorizationPreview: mask(AUTHORIZATION),
    });

    if (!mobile || !message) {
      console.error(`[sms-sendotp][${requestId}] Missing required fields`, {
        hasMobile: Boolean(mobile),
        hasMessage: Boolean(message),
      });
      return NextResponse.json(
        { error: 'mobile and message are required', requestId },
        { status: 400 }
      );
    }

    if (!CUSTOMER_ID || !ENTITY_ID || !TEMPLATE_ID || !AUTHORIZATION) {
      console.error(`[sms-sendotp][${requestId}] Missing required env vars after normalization`);
      return NextResponse.json(
        { error: 'Server configuration missing required SMS credentials', requestId },
        { status: 500 }
      );
    }
    
    
    const body = JSON.stringify({
      customerId: CUSTOMER_ID,
      destinationAddress: [mobile],
      message: message,
      sourceAddress: 'ENIMOE', // e.g., 'AIRTEL'
      messageType: "SERVICE_IMPLICIT",
      dltTemplateId: TEMPLATE_ID,
      entityId: ENTITY_ID,
      otp: false
});

    console.log(`[sms-sendotp][${requestId}] Airtel payload prepared`, {
      destinationAddress: [mobile],
      sourceAddress: 'ENIMOE',
      messageType: 'SERVICE_IMPLICIT',
      dltTemplateId: TEMPLATE_ID,
      entityId: ENTITY_ID,
      otp: false,
    });

    const response = await fetch("https://iqmessaging.airtel.in/api/v4/send-sms", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'eenimeeni-client/1.0',
        'Authorization': AUTHORIZATION,
      },
      body: body,
    });

    const rawText = await response.text();
    const responseContentType = response.headers.get('content-type');
    const { parsed: data, parseError, isJson } = parseAirtelResponse(rawText, responseContentType);

    if (parseError) {
      console.error(`[sms-sendotp][${requestId}] Failed to parse Airtel response JSON`, {
        parseError,
        responseContentType,
        rawTextPreview: rawText.slice(0, 500),
      });
    }

    console.log(`[sms-sendotp][${requestId}] Airtel response received`, {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      responseHeaders: Object.fromEntries(response.headers.entries()),
      data,
      responseContentType,
      parsedAsJson: isJson,
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Airtel SMS API returned error',
          requestId,
          airtelStatus: response.status,
          airtelResponse: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error(`[sms-sendotp][${requestId}] Unhandled error while sending SMS`, {
      error,
      message: error instanceof Error ? error.message : null,
      stack: error instanceof Error ? error.stack : null,
    });
    return NextResponse.json({ error: 'Failed to send SMS', requestId }, { status: 500 });
  }
}