import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import {
  generateMerchantTxnNo,
  generateTxnDate,
  IciciHash,
} from "@/lib/iciciHash"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { message: "Invalid user, please login" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      paymentType, // "ADVANCE" | "FULL"
      startTime,
      endTime,
      durationMinutes,
      guests,
      packageSnapshot,
      foodSnapshot,
      pricingSnapshot,
    } = body
    console.log(paymentType, // "ADVANCE" | "FULL"
      startTime,
      endTime,
      durationMinutes,
      guests,
      packageSnapshot,
      foodSnapshot,
      pricingSnapshot,)
    // ----------------------------
    // Basic validation
    // ----------------------------
    if (
      !paymentType ||
      !startTime ||
      !endTime ||
      !durationMinutes ||
      !guests ||
      !packageSnapshot ||
      !foodSnapshot ||
      !pricingSnapshot
    ) {
      return NextResponse.json(
        { message: "Incomplete booking data" },
        { status: 400 }
      )
    }

    if (guests.total < 30) {
      return NextResponse.json(
        { message: "Minimum 30 guests required" },
        { status: 400 }
      )
    }   
    
    // ----------------------------
    // Slot overlap check (CRITICAL)
    // ----------------------------
    const overlap = await prisma.minyMoePartyBooking.findFirst({
      where: {
        status: { not: "CANCELLED" },
        startTime: { lt: new Date(endTime) },
        endTime: { gt: new Date(startTime) },
      },
    })

    if (overlap) {
      return NextResponse.json(
        { message: "Selected slot is already booked" },
        { status: 409 }
      )
    }

    // ----------------------------
    // Determine payable amount
    // ----------------------------
    const payableAmount =
      paymentType === "ADVANCE" ? 10000 : pricingSnapshot.totalAmount

    // ----------------------------
    // Create booking + payment atomically
    // ----------------------------
    

    // 1️⃣ Create booking
const booking = await prisma.minyMoePartyBooking.create({
  data: {
    userId: session.user.id,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    durationMinutes,

    kids: guests.kids,
    adults: guests.adults,
    totalGuests: guests.total,

    baseAmount: pricingSnapshot.baseAmount,
    extrasAmount: pricingSnapshot.extrasAmount,
    totalAmount: pricingSnapshot.totalAmount,

    packageSnapshot,
    foodSnapshot,
    pricingSnapshot,
  },
})

// 2️⃣ Create payment
const payment = await prisma.payment.create({
  data: {
    merchantTxnNo: generateMerchantTxnNo(),
    minyMoePartyBookingId: booking.id,
    userId: session.user.id,
    amount: payableAmount,
    paymentType,
  },
})


    // ----------------------------
    // ICICI payment payload
    // ----------------------------
    const returnURL = `${process.env.NEXT_APP_URL}/api/icici/minymoe/partybooking/callback`

    let payload: any = {
      merchantId: process.env.ICICI_MID!,
      aggregatorID: process.env.ICICI_AGG_ID!,
      merchantTxnNo: payment.merchantTxnNo,
      amount: payableAmount.toString(),
      currencyCode: "356",
      payType: "0",
      customerEmailID: session.user.email!,
      transactionType: "SALE",
      returnURL,
      txnDate: generateTxnDate(),
      customerMobileNo: session.user.phone!,
      customerName: session.user.name!,
      secureHash: "",
    }

    const { status, message } = IciciHash(payload)
    if (!status) {
      return NextResponse.json(
        { message: "Payment hash generation failed" },
        { status: 500 }
      )
    }

    payload.secureHash = message

    const iciciRes = await fetch(process.env.ICICI_INITIATE_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const iciciResult = await iciciRes.json()
    const redirectUrl = `${iciciResult.redirectURI}?tranCtx=${iciciResult.tranCtx}`

    return NextResponse.json({ status: 200, url: redirectUrl })
  } catch (error) {
    console.error("MinyMoe Booking Error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
