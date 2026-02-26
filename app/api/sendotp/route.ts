import twilio from "twilio";
import { NextResponse } from "next/server";

const client = twilio(process.env.accountSid, process.env.AUTH_TOKEN);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phoneNumber } = body;

        if (!phoneNumber || phoneNumber.length < 10) {
            return NextResponse.json(
                { status: "error", message: "Invalid phone number" },
                { status: 400 }
            );
        }

        const verification = await client.verify.v2
            .services("VA75b2b3221f3fe0237cad21dea1887a1e")
            .verifications.create({
                channel: 'sms',
                to: `+91${phoneNumber}`
            });

        console.log(verification);
        
        return NextResponse.json({ 
            status: "success", 
            message: "OTP sent successfully" 
        });
        
    } catch (error) {
        console.error("Error sending OTP:", error);
        return NextResponse.json(
            { status: "error", message: "Failed to send OTP" },
            { status: 500 }
        );
    }
}