import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { generateMerchantTxnNo, generateTxnDate, IciciHash } from "@/lib/iciciHash";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const session = await auth();

        //Verification 
        if (!session) {
            return NextResponse.json({ status: 400, error: 'Invalid User Please Login First' })
        }

        const { startTime, endTime, durationMinutes, headcount, totalAmount, pricingSnap } = body.payload;
        console.log(body.payload)
        if (!startTime || !endTime || !durationMinutes || !headcount || !totalAmount || !pricingSnap) {
            return NextResponse.json({ status: 400, message: "Incomplete Details Please Fill the Form Correctly" })
        }
        let durationHours = durationMinutes/60
        const [currentVenueConfigs] = await prisma.venueConfig.findMany();

        if (durationHours > currentVenueConfigs.maxDurationHours || durationHours < currentVenueConfigs.minDurationHours) {
            return NextResponse.json({ status: 400, message: "The duration hours are wrong" })
        }

        const verificationOfPrice = currentVenueConfigs.price_per_hour * durationHours;
        if (verificationOfPrice !== totalAmount) {
            return NextResponse.json({ status: 400, message: "The Price Calculation is wrong" })
        }

        // Here we will do the DB Entry of data
        const createVenueBooking = await prisma.venueBooking.create({
            data: {
                userId: session.user.id,
                startTime,
                endTime,
                totalAmount,
                headcount,
                durationHours,
                pricingSnap
            }
        });

        const createPaymentForVenue = await prisma.payment.create({
            data: {
                merchantTxnNo: generateMerchantTxnNo(),
                venueBookingId: createVenueBooking.id,
                amount: 0,
                userId: session.user.id
            }
        });

        const returnURL = `${process.env.NEXT_APP_URL}/api/icici/venue-booking/callback`

        // ICICI Payload for payment
        let payload = {
            "merchantId": process.env.ICICI_MID!,
            "aggregatorID": process.env.ICICI_AGG_ID!,
            "merchantTxnNo": createPaymentForVenue.merchantTxnNo,
            "amount": totalAmount.toString(),
            "currencyCode": "356",
            "payType": "0",
            "customerEmailID": session.user.email!,
            "transactionType": "SALE",
            "returnURL": returnURL,
            "txnDate": generateTxnDate(),
            "customerMobileNo": session.user.phone!,
            "customerName": session.user.name!,
            "secureHash": ""
        }

        const { status, message } = IciciHash(payload);

        if (!status) {
            return NextResponse.json({ status: 500, message: "Something went Wrong" })
        }
        payload.secureHash = message;
        const respose = await fetch(`${process.env.ICICI_INITIATE_URL}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload)
        });
        const result = await respose.json();
        const url = `${result?.redirectURI}?tranCtx=${result.tranCtx}`
        return NextResponse.json({ status: 200, url });
    } catch (error) {
        console.log(`Error In the Venue_booking ROute ${error}`)
        return NextResponse.json({status:501, message:'Something went Wrong'})
    }
}