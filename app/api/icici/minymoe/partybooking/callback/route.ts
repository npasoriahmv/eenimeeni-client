import { Booking_Prefix } from "@/lib/Booking_Prefix"
import { generateAndAssignInvoice } from "@/lib/invoice"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { NextResponse, NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const HashKey = process.env.ICICI_KEY!

    const formData: Record<string, any> = {}
    for (const [key, value] of form.entries()) {
      formData[key] = value
    }

    const merchantTxnNo = formData["merchantTxnNo"]
    const transactionId = formData["txnID"]
    const responseCode = formData["responseCode"]
    const responseMessage = formData["respDescription"]
    const amount = Number(formData["amount"])
    const paymentMode = formData["paymentMode"]
    const rawResponse = formData

    const success = ["000", "0000", "R1000"].includes(responseCode)

    // -------------------------------
    // HASH VERIFICATION
    // -------------------------------
    const sortedKeys = Object.keys(formData)
      .filter(
        (k) =>
          k !== "secureHash" &&
          formData[k] !== undefined &&
          formData[k] !== ""
      )
      .sort()

    const keyString = sortedKeys.map((k) => formData[k]).join("")
    const hmac = crypto.createHmac("sha256", HashKey)
    hmac.update(keyString)
    const calculatedHash = hmac.digest("hex").toLowerCase()

    if (
      formData["secureHash"] &&
      calculatedHash !== formData["secureHash"]
    ) {
      console.error("ICICI hash mismatch", {
        received: formData["secureHash"],
        calculated: calculatedHash,
      })

      return redirectToStatus("pending", merchantTxnNo)
    }

    // -------------------------------
    // UPDATE PAYMENT
    // -------------------------------
    const payment = await prisma.payment.update({
      where: { merchantTxnNo },
      data: {
        amount,
        transaction_method: paymentMode,
        transactionId,
        status: success ? "SUCCESS" : "FAILED",
        responseCode,
        responseMessage,
        rawResponse,
      },
    })

    // -------------------------------
    // INVOICE (success only)
    // -------------------------------
    if (success) {
      const invoice = await generateAndAssignInvoice(payment.id)
      if (!invoice?.invoiceNumber) {
        await generateAndAssignInvoice(payment.id)
      }
    }

    // -------------------------------
    // HANDLE MINYMOE BOOKING
    // -------------------------------
    if (payment.minyMoePartyBookingId) {
      if (success) {
        const booking = await prisma.minyMoePartyBooking.findUnique({
          where: { id: payment.minyMoePartyBookingId },
          include: {
            payments: {
              where: { status: "SUCCESS" },
            },
          },
        })

        await prisma.minyMoePartyBooking.update({
          where: { id: booking?.id },
          data: {
            bookingId: `${Booking_Prefix.minymoeparty}${booking?.bookingNumber}`
          }
        })

        const totalPaid =
          booking?.payments.reduce(
            (sum, p) => sum + Number(p.amount),
            0
          ) ?? 0

        if (totalPaid >= Number(booking?.totalAmount)) {
          await prisma.minyMoePartyBooking.update({
            where: { id: booking!.id },
            data: { status: "CONFIRMED" },
          })
        }
      } else {
        // Failed payment → cancel booking (only if this was first payment)
        await prisma.minyMoePartyBooking.update({
          where: { id: payment.minyMoePartyBookingId },
          data: { status: "CANCELLED" },
        })
      }
    }

    return redirectToStatus(success ? "true" : "false", merchantTxnNo)
  } catch (error) {
    console.error("MinyMoe ICICI Callback Error:", error)
    return redirectToStatus("error")
  }
}

// -------------------------------
// Redirect Helper
// -------------------------------
function redirectToStatus(
  status: string,
  merchantTxnNo?: string
) {
  const redirectUrl = merchantTxnNo
    ? `/payment/status?status=${status}&merchantTxnNo=${merchantTxnNo}`
    : `/payment/status?status=${status}`

  return new NextResponse(
    `<html><body><script>window.location.href="${redirectUrl}"</script></body></html>`,
    { headers: { "Content-Type": "text/html" } }
  )
}
