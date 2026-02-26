import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"
import crypto from "crypto";

export const dynamic = "force-dynamic"

//HELPER : ICICI Status Check
async function checkIciciStatus(merchantTxnNo: string) {
    const payload = {
        merchantID: process.env.ICICI_MID!,
        aggregatorID: process.env.ICICI_AGG_ID!,
        merchantTxnNo,
        originalTxnNo: merchantTxnNo,
        transactionType: "STATUS",
        secureHash: ""
    };

    const key = process.env.ICICI_KEY!;
    const hashBase =
        payload.aggregatorID +
        payload.merchantID +
        payload.merchantTxnNo +
        payload.originalTxnNo +
        payload.transactionType;

    const hash = crypto.createHmac("sha256", key).update(hashBase).digest("hex");
    payload.secureHash = hash.toLowerCase();

    const form = new URLSearchParams();
    Object.entries(payload).forEach(([key, v]) => form.append(key, v));

    try {
        const res = await fetch("https://pgpayuat.icicibank.com/tsp/pg/api/command", {
            method: "POST",
            headers: { "Content-Type": 'application/x-www-form-urlencoded' },
            body: form.toString(),
        })

        const text = await res.text();
        console.log(text)
        try {
            return JSON.parse(text);
        } catch (error) {
            console.log("Error in Reconcile", error);
            return null;
        }
    } catch (error) {
        console.log("ICICI status API Failed", error);
        return null;
    }
}

async function cancelIcici(merchantTxnNo: string) {
    const payload = {
        merchantID: process.env.ICICI_MID!,
        aggregatorID: process.env.ICICI_AGG_ID!,
        merchantTxnNo,
        cancellationCode:"020",
        cancellationDesc:"Cancel By User",
        transactionType: "STATUS",
        secureHash: ""
    };

    const key = process.env.ICICI_KEY!;
    const hashBase =
        payload.aggregatorID +
        payload.cancellationCode+
        payload.cancellationDesc+
        payload.merchantID +
        payload.merchantTxnNo +
        payload.transactionType;

    const hash = crypto.createHmac("sha256", key).update(hashBase).digest("hex");
    payload.secureHash = hash.toLowerCase();

    try {
        const res = await fetch("https://pgpayuat.icicibank.com/tsp/pg/api/userCancel", {
            method: "POST",
            headers: { "Content-Type": 'application/json' },
            body: JSON.stringify(payload),
        })

        console.log("This is the raw response in User Cancel API", res)
        const json = await res.json();
        console.log("This is the UserCancel API", json)
        return json;
    } catch (error) {
        console.log("ICICI status API Failed", error);
        return null;
    }
}

export async function GET(request:Request) {
    //validate secret Header

    const incomingSecret = request.headers.get("x-cron-secret");
    if(incomingSecret !== process.env.CRON_SECRET){
        return NextResponse.json({error:"UNauthorized"}, {status:401})
    }

    const now = new Date();

    const pendingBookings = await prisma.booking.findMany({
        where: { status: "PENDING" },
        include: { payments: true }
    });

    for (const booking of pendingBookings) {
        const payment = booking.payments[0];
        if (!payment) continue;

        const merchantTxnNo = payment.merchantTxnNo;
        const ageMinutes = (now.getTime() - booking.createdAt.getTime()) / 1000 / 60;

        const status = await checkIciciStatus(merchantTxnNo);
        console.log(status)

        let txnStatus = status?.txnStatus
        let txnCode = status?.txnResponseCode;
        let transactionId = status?.txnID

        // Case 1
        if (txnStatus === "SUC" || (txnCode === "0000" || txnCode === "000")) {
            await prisma.payment.update({
                where: { merchantTxnNo },
                data: {
                    status: "SUCCESS",
                    responseCode: txnCode,
                    responseMessage: status.txnRespDescription,
                    rawResponse: status,
                    transactionId: transactionId
                }
            })

            await prisma.booking.update({
                where: { id: booking.id },
                data: { status: "CONFIRMED" }
            });

            continue;
        }

        //Case 2 Failure (REJ / ERR)
        if (txnStatus === "REJ" || txnStatus === "ERR") {
            await prisma.payment.update({
                where: { merchantTxnNo },
                data: {
                    status: "FAILED",
                    responseCode: txnCode,
                    responseMessage: status.txnRespDescription,
                    rawResponse: status,
                },
            });

            await prisma.booking.update({
                where: { id: booking.id },
                data: { status: "CANCELLED" },
            });

            continue;
        }


        //CASE 3 PENDING (REQ or No Response)
        if (!txnStatus || txnStatus === "REQ") {
            // If <18 minutes → do nothing
            if (ageMinutes < 18) continue;

            // ≥18 minutes → cancel the transaction
            await cancelIcici(merchantTxnNo);

            await prisma.payment.update({
                where: { merchantTxnNo },
                data: {
                    status: "FAILED",
                    responseCode: "TIMEOUT",
                    responseMessage: "Auto-cancel after timeout",
                },
            });

            await prisma.booking.update({
                where: { id: booking.id },
                data: { status: "CANCELLED" },
            });

            continue;
        }


    }

    return NextResponse.json({
        status: "ok",
        checked: pendingBookings.length,
    })


}

