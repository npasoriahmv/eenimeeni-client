import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { mobile, message } = await request.json();

    // 1. Credentials from your Airtel IQ Dashboard
    const CUSTOMER_ID = process.env.CUSTOMER_ID!;
    const ENTITY_ID = process.env.ENTITY_ID!; // From DLT Portal
    const TEMPLATE_ID = process.env.TEMPLATE_ID!; // From DLT Portal
    
    
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

    const response = await fetch("https://iqmessaging.airtel.in/api/v4/send-sms", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.AUTHORIZATION!,
      },
      body: body,
    });

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
  }
}