import { Booking_Prefix } from "@/lib/Booking_Prefix";
import { generateAndAssignInvoice } from "@/lib/invoice";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

import { NextResponse, NextRequest } from "next/server";
export async function POST(request: NextRequest) {
    try {
        const form = await request.formData();
        const HashKey = process.env.ICICI_KEY!

        let formData: Record<string, any> = {};

        for (const [key, value] of form.entries()) {
            formData[key] = value;
        }

        const merchantTxnNo = formData["merchantTxnNo"]
        let transactionId = formData["txnID"];
        let responseCode = formData["responseCode"]
        let responseMessage = formData["respDescription"];
        let amount = formData["amount"]
        let rawResponse = formData;
        let paymentMode = formData["paymentMode"]

        const success = ["000", "0000", "R1000"].includes(responseCode);
        const redirectUrl = `/payment/status?status=${success}&merchantTxnNo=${merchantTxnNo}`

        const responseForUser = `
      <html><body>
        <script>window.location.href = "${redirectUrl}"</script>
      </body></html>
    `

        //Dynamic Hash String Generation.
        const sortedKeys = Object.keys(formData)
            .filter(k => k !== "secureHash" && formData[k] !== undefined && formData[k] !== "")
            .sort()

        const KeyString = sortedKeys.map(k => formData[k]).join("");
        const hmac = crypto.createHmac("sha256", HashKey);
        hmac.update(KeyString);
        const hashedValue = hmac.digest("hex").toLowerCase();

        //This portion handles If the Hash Value doesnot match
        if (formData["secureHash"] && hashedValue !== formData["secureHash"]) {
            console.log("Hash mismatched! Possible tampering. ", {
                received: formData["secureHash"],
                calculated: hashedValue,
                formData
            });
            const status = "pending"
            const redirectUrl = `/payment/status?status=${status}&merchantTxnNo=${merchantTxnNo}`
            return new NextResponse(`
      <html><body>
        <script>window.location.href = "${redirectUrl}"</script>
      </body></html>
    `, { headers: { "Content-Type": "text/html" } })
        }

        //Here we will update the venue-Booking Tables
        if (success) {
            // if The Payment is SuccessFull then Update the Tables Accordingly 
            const find_Payment = await prisma.payment.update({
                where: { merchantTxnNo },
                data: {
                    amount,
                    transaction_method: paymentMode,
                    transactionId: transactionId,
                    status: "SUCCESS",
                    responseCode: responseCode,
                    responseMessage: responseMessage,
                    rawResponse: rawResponse,
                }
            });

            const paymentwithInvoice = await generateAndAssignInvoice(find_Payment.id);
            if (!paymentwithInvoice.invoiceNumber) {
                await generateAndAssignInvoice(find_Payment.id)
            }

            const venue = await prisma.venueBooking.update({
                where: { id: find_Payment?.venueBookingId! },
                data: {
                    status: "CONFIRMED"
                }
            });

            await prisma.venueBooking.update({
                where: { id: venue.id },
                data: {
                    bookingId: `${Booking_Prefix.minymoevenue}${venue.bookingNumber}`
                }
            })
            const status = "true"
            const redirectUrl = `/payment/status?status=${status}&merchantTxnNo=${merchantTxnNo}`

            return new NextResponse(`
      <html><body>
        <script>window.location.href = "${redirectUrl}"</script>
      </body></html>
    `, { headers: { "Content-Type": "text/html" } })
        } else {
            //Other WISE Marks the Payments as Failed 
            const find_Payment = await prisma.payment.update({
                where: { merchantTxnNo },
                data: {
                    status: "FAILED",
                    rawResponse: rawResponse,
                }
            });
            await prisma.venueBooking.update({
                where: { id: find_Payment?.venueBookingId! },
                data: {
                    status: "CANCELLED"
                }
            });

            const status = "false"
            const redirectUrl = `/payment/status?status=${status}&merchantTxnNo=${merchantTxnNo}`

            return new NextResponse(`
      <html><body>
        <script>window.location.href = "${redirectUrl}"</script>
      </body></html>
    `, { headers: { "Content-Type": "text/html" } })
        }

    } catch (error) {
        console.log("Error in Callback Route", error);
        const status = "error"
        const redirectUrl = `/payment/status?status=${status}`
        return new NextResponse(`
      <html><body>
        <script>window.location.href = "${redirectUrl}"</script>
      </body></html>
    `, { headers: { "Content-Type": "text/html" } })
    }
}
