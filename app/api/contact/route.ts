import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Resend } from "resend"

enum QueryType {
  GENERAL = "GENERAL",
  PARTY = "PARTY",
  EVENT = "EVENT",
  OTHER = "OTHER",
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, phone, query, message } = body;

    if (!name || !email || !phone || !query || !message) {
      return NextResponse.json(
        { message: "Bad Request, Fill the form completely" },
        { status: 400 }
      );
    }

    let queryType: QueryType;

    switch (query.toLowerCase()) {
      case "general":
        queryType = QueryType.GENERAL;
        break;
      case "party":
        queryType = QueryType.PARTY;
        break;
      case "event":
        queryType = QueryType.EVENT;
        break;
      default:
        queryType = QueryType.OTHER;
    }
    console.log({
      name,
      email,
      phone,
      queryType,
      message,
    });
    await Promise.allSettled([
      prisma.contactInquiry.create({
        data: { name, email, phone, queryType, message },
      }),
      resend.emails.send({
        from: 'onboarding@resend.dev',
        to: "lumiroenterprises@gmail.com",
        subject: "New Contact Inquiry Received",
        html: `
          <h2>New Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Query Type:</strong> ${queryType}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      })
    ])
    return NextResponse.json(
      { message: "Form submitted successfully We will contact you soon" },
      { status: 200 }
    );
  } catch (error) {
    console.log(`Error Occured in the Form Submission Route ${error}`)
    return NextResponse.json({ status: 501, message: 'Something went wrong' })
  }
}
