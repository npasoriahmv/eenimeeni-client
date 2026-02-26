import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import {
  generateMerchantTxnNo,
  generateTxnDate,
  IciciHash,
} from "@/lib/iciciHash"

const BUFFER_MINUTES = 45

export async function POST(request: Request) {
  try {

    // ----------------------------
    // AUTH CHECK
    // ----------------------------

    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // ----------------------------
    // PARSE BODY
    // ----------------------------

    const body = await request.json()

    const {
      paymentType,
      startTime,
      endTime,
      durationMinutes,
      guests,
      packageSnapshot,
      foodSnapshot,
      pricingSnapshot,
    } = body

    // ----------------------------
    // VALIDATION
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

    const start = new Date(startTime)
    const end = new Date(endTime)

    if (start >= end) {
      return NextResponse.json(
        { message: "Invalid time range" },
        { status: 400 }
      )
    }

    // ----------------------------
    // BUFFER CONFLICT CHECK
    // ----------------------------

    const bufferedStart = new Date(
      start.getTime() - BUFFER_MINUTES * 60000
    )

    const bufferedEnd = new Date(
      end.getTime() + BUFFER_MINUTES * 60000
    )

    // Check Playzone Booking
    // const playzoneConflict = await prisma.booking.findFirst({
    //   where: {
    //     status: { not: "CANCELLED" },

    //     startTime: {
    //       lt: bufferedEnd,
    //     },

    //     endTime: {
    //       gt: bufferedStart,
    //     },
    //   },
    //   select: { id: true },
    // })

    // Check MinyMoe
    const minyMoeConflict =
      await prisma.minyMoePartyBooking.findFirst({
        where: {
          status: { not: "CANCELLED" },

          startTime: {
            lt: bufferedEnd,
          },

          endTime: {
            gt: bufferedStart,
          },
        },
        select: { id: true },
      })

    // Check Venue
    const venueConflict =
      await prisma.venueBooking.findFirst({
        where: {
          status: { not: "CANCELLED" },

          startTime: {
            lt: bufferedEnd,
          },

          endTime: {
            gt: bufferedStart,
          },
        },
        select: { id: true },
      })

    // Check Combined (emmmPartyBooking)
    const combinedConflict =
      await prisma.emmmPartyBooking.findFirst({
        where: {
          status: { not: "CANCELLED" },

          startTime: {
            lt: bufferedEnd,
          },

          endTime: {
            gt: bufferedStart,
          },
        },
        select: { id: true },
      })

    if (
      // playzoneConflict ||
      minyMoeConflict ||
      venueConflict ||
      combinedConflict
    ) {
      return NextResponse.json(
        {
          message:
            "Selected slot unavailable. Please Select another slot.",
        },
        { status: 409 }
      )
    }

    // ----------------------------
    // DETERMINE PAYABLE AMOUNT
    // ----------------------------

    const payableAmount =
      paymentType === "ADVANCE"
        ? 10000
        : Number(pricingSnapshot.totalAmount)

    // ----------------------------
    // CREATE BOOKING
    // ----------------------------

    const booking =
      await prisma.emmmPartyBooking.create({
        data: {

          userId: session.user.id,

          startTime: start,
          endTime: end,

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

    // ----------------------------
    // CREATE PAYMENT
    // ----------------------------

    const payment = await prisma.payment.create({
      data: {

        merchantTxnNo: generateMerchantTxnNo(),

        emmmPartyBookingId: booking.id,

        userId: session.user.id,

        amount: payableAmount,

        paymentType,
      },
    })

    // ----------------------------
    // ICICI PAYMENT PAYLOAD
    // ----------------------------

    const returnURL =
      `${process.env.NEXT_APP_URL}/api/icici/eenimeeniminymoe/callback`

    let payload: any = {

      merchantId: process.env.ICICI_MID!,
      aggregatorID: process.env.ICICI_AGG_ID!,

      merchantTxnNo: payment.merchantTxnNo,

      amount: payableAmount.toString(),

      currencyCode: "356",

      payType: "0",

      customerEmailID: session.user.email!,

      customerMobileNo: session.user.phone!,

      customerName: session.user.name!,

      transactionType: "SALE",

      txnDate: generateTxnDate(),

      returnURL,

      secureHash: "",
    }

    const { status, message } =
      IciciHash(payload)

    if (!status) {
      return NextResponse.json(
        { message: "Payment hash failed" },
        { status: 500 }
      )
    }

    payload.secureHash = message

    // ----------------------------
    // INITIATE ICICI PAYMENT
    // ----------------------------

    const iciciRes = await fetch(
      process.env.ICICI_INITIATE_URL!,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    )

    const iciciResult = await iciciRes.json()

    const redirectUrl =
      `${iciciResult.redirectURI}?tranCtx=${iciciResult.tranCtx}`

    // ----------------------------
    // SUCCESS RESPONSE
    // ----------------------------

    return NextResponse.json({
      status: 200,
      url: redirectUrl,
    })

  } catch (error) {

    console.error(
      "EENIMEENI_MINYMOE INITIATE ERROR:",
      error
    )

    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      }
    )
  }
}
