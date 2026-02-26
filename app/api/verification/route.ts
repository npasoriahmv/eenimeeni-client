import { NextResponse } from "next/server";
import twilio from "twilio"

const client = twilio(process.env.accountSid, process.env.AUTH_TOKEN);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { code, phoneNumber } = body;
        
        if (!code || code.length !== 6 || !phoneNumber) {
            return NextResponse.json({ 
                success: false, 
                message: 'Please enter a valid 6-digit OTP' 
            });
        }

        const verificationCheck = await client.verify.v2
            .services("VA75b2b3221f3fe0237cad21dea1887a1e")
            .verificationChecks.create({
                code: code,
                to: `+91${phoneNumber}`
            });

        if (verificationCheck.status === "approved") {
            return NextResponse.json({ 
                success: true, 
                message: "Phone number verified successfully!" 
            });
        } else {
            return NextResponse.json({ 
                success: false, 
                message: "Invalid OTP. Please try again." 
            });
        }
        
    } catch (error: any) {
        console.log(`Error in OTP Verification: ${error}`);
        
        // Handle Twilio specific errors
        if (error.code === 20404) {
            return NextResponse.json({ 
                success: false, 
                message: "OTP expired. Please request a new one." 
            });
        }
        
        return NextResponse.json({ 
            success: false, 
            message: "Verification failed. Please try again." 
        });
    }
}