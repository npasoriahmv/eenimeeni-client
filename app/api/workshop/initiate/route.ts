import { auth } from "@/auth"
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMerchantTxnNo, IciciHash } from "@/lib/iciciHash";
import { generateTxnDate } from "@/lib/iciciHash";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { count, workShopId, amount } = body;
        const session = await auth();
        if (!session) {
            return NextResponse.json({ status: 400, message: "Bad Request Please Login First" })
        }

        const checkWorkShop = await prisma.workShop.findUnique({
            where: { id: workShopId }
        });

        if (!checkWorkShop) {
            return NextResponse.json({ status: 400, message: "WorkShop not found Invalid Request" })
        }

        const totalSuccessFullBooking = await prisma.workShopBooking.count({
            where: { status: "CONFIRMED", workshopId: workShopId }
        });

        if ((count + totalSuccessFullBooking) > checkWorkShop.maxkids) {
            return NextResponse.json({ status: 400, message: 'Invalid Request - Booking Limit exceeded' })
        }

        //Verify the Amount Here
        const verifiedAmount = count * checkWorkShop.fee

        if (verifiedAmount !== amount) {
            return NextResponse.json({ status: 400, message: 'Invaild Request Amount is wrong' })
        }

        const createWorkShop = await prisma.workShopBooking.create({
            data: {
                userId: session.user.id,
                workshopId: workShopId,
                participants: count,
                amount: amount,
            }
        });

        const payment = await prisma.payment.create({
            data: {
                merchantTxnNo: generateMerchantTxnNo(),
                userId: createWorkShop.userId,
                amount: 0,
                workShopBookingId: createWorkShop.id
            }
        });

        //This block consist the payment logic for workshops
        let payloadForPayment = {
            "merchantId": process.env.ICICI_MID!,
            "aggregatorID": process.env.ICICI_AGG_ID!,
            "merchantTxnNo": payment.merchantTxnNo,
            "amount": amount.toString(),
            "currencyCode": "356",
            "payType": "0",
            "customerEmailID": session.user.email || "dy223mmy@gamil.com",
            "transactionType": "SALE",
            "returnURL": process.env.ICICI_RETURN_URL!,
            "txnDate": generateTxnDate(),
            "customerMobileNo": session.user.phone!,
            "customerName": session.user.name!,
            "secureHash": ""
        }

        const { status, message } = IciciHash(payloadForPayment);

        if (!status) {
            return NextResponse.json({ status: 500, message: "Something went Wrong" })
        }

        console.log(`This is secure Hash ${message}`)

        payloadForPayment.secureHash = message;
        console.log(payloadForPayment);

        const respose = await fetch(`${process.env.ICICI_INITIATE_URL}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payloadForPayment)
        });

        const result = await respose.json();
        console.log(result)
        const url = `${result?.redirectURI}?tranCtx=${result.tranCtx}`
        return NextResponse.json({ status: 200, url });
    } catch (error) {
        console.log('Error Occured in Intiate Payment', error);
        return NextResponse.json({ status: 500, message: "Something Went Wrong" })
    }
}