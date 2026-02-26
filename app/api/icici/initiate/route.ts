import { generateMerchantTxnNo, generateTxnDate, IciciHash } from "@/lib/iciciHash"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { verifyBookingPayload } from "@/lib/verifyBooking"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    const {
      type,
      date,
      startDateTime,
      endDateTime,
      childrenIds = [],
      guestChilderns = 0,
      guardians = 0,
      redeemPoints = 0,
      duration,
      cafeSnapshot,
      cafeSubtotal
    } = body

    /* ---------- VERIFY & CALCULATE ---------- */

    const {
      serverTotal,
      currentPoints,
    } = await verifyBookingPayload({
      userId: session.user.id,
      startDateTime,
      childrenIds,
      guestChilderns,
      guardians,
      redeemPoints,
      duration,
    })

    /* ---------- ZERO PAYMENT ---------- */

    if (serverTotal === 0) {
      const booking = await prisma.booking.create({
        data: {
          userId: session.user.id,
          type,
          date: new Date(date),
          startTime: new Date(startDateTime),
          endTime: new Date(endDateTime),
          guestChildren: guestChilderns,
          guardians,
          amount: 0,
          points_spent: redeemPoints,
          points_earned: 0,
          status: "CONFIRMED",
          cafeSnapshot,
          cafeSubtotal,
          children: {
            connect: childrenIds.map((id: string) => ({ id })),
          },
          createdAt: new Date(),
        },
      })

      const payment = await prisma.payment.create({
        data: {
          merchantTxnNo: generateMerchantTxnNo(),
          bookingId: booking.id,
          userId: session.user.id,
          amount: 0,
          status: "SUCCESS",
        },
      })

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          loyaltyPoints: currentPoints - redeemPoints,
        },
      })

      return NextResponse.json({
        status: 200,
        url: `${process.env.NEXT_APP_URL}/payment/status?status=true&merchantTxnNo=${payment.merchantTxnNo}`,
      })
    }

    /* ---------- CREATE BOOKING ---------- */

    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        type,
        date: new Date(date),
        startTime: new Date(startDateTime),
        endTime: new Date(endDateTime),
        guestChildren: guestChilderns,
        guardians,
        amount: serverTotal + cafeSubtotal,
        cafeSubtotal,
        cafeSnapshot,
        points_spent: redeemPoints,
        children: {
          connect: childrenIds.map((id: string) => ({ id })),
        },
        createdAt: new Date(),
      },
    })

    const payment = await prisma.payment.create({
      data: {
        merchantTxnNo: generateMerchantTxnNo(),
        bookingId: booking.id,
        userId: session.user.id,
        amount: serverTotal,
      },
    })

    /* ---------- ICICI ---------- */
    
    const payload = {
      merchantId: process.env.ICICI_MID!,
      aggregatorID: process.env.ICICI_AGG_ID!,
      merchantTxnNo: payment.merchantTxnNo,
      amount: booking.amount.toString(),
      currencyCode: "356",
      payType: "0",
      customerEmailID: session.user.email!,
      transactionType: "SALE",
      returnURL: process.env.ICICI_RETURN_URL!,
      txnDate: generateTxnDate(),
      customerMobileNo: session.user.phone!,
      customerName: session.user.name!,
      secureHash: "",
    }

    const { status, message } = IciciHash(payload)
    if (!status) throw new Error("Hash generation failed")

    payload.secureHash = message

    const iciciRes = await fetch(
      process.env.ICICI_INITIATE_URL!,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    )

    const result = await iciciRes.json()
    console.log("Result",result)
    const redirectUrl = `${result.redirectURI}?tranCtx=${result.tranCtx}`

    return NextResponse.json({ status: 200, url: redirectUrl })
  } catch (err: any) {
    console.error("Initiate payment error:", err)
    return NextResponse.json(
      { error: err.message || "Payment failed" },
      { status: 400 }
    )
  }
}
