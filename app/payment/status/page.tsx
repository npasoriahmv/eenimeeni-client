import { prisma } from "@/lib/prisma"

import SuccessVenueBooking from "./components/SuccessVenueBooking"
import SuccessWorkshopBooking from "./components/SuccessWorkShopBooking"
import SuccessPlayzoneBooking from "./components/SuccessPlayzoneBooking"
import SuccessMinyMoePartyBooking from "./components/SuccessMinyMoePartyBooking"

import FailedPayment from "./components/FailedPayment"
import PaymentError from "./components/PaymentError"
import PendingPayment from "./components/PendingPayment"

type PaymentStatusSearchParams = {
  merchantTxnNo?: string
  status?: string
}

export default async function PaymentStatusPage({
  searchParams,
}: {
  searchParams: Promise<PaymentStatusSearchParams>
}) {
  // ✅ UNWRAP searchParams (Next.js 14+ requirement)
  const params = await searchParams

  const merchantTxnNo = params.merchantTxnNo
  const rawStatus = params.status

  // -----------------------------
  // HARD GUARD: missing txn ref
  // -----------------------------
  if (!merchantTxnNo) {
    return <PaymentError />
  }

  // -----------------------------
  // FETCH PAYMENT + RELATIONS
  // -----------------------------
  const payment = await prisma.payment.findUnique({
    where: { merchantTxnNo },
    include: {
      booking: {
        include: {
          children: true,
          user: true,
        },
      },
      workShopBooking: {
        include: {
          user: true,
          workshop: true,
        },
      },
      venueBooking: {
        include: {
          user: true,
        },
      },
      MinyMoePartyBooking: {
        include: {
          user: true,
        },
      },
      emmmPartyBooking:{
        include:{
          user:true,
        },
      },
      user: true,
    },
  })

  // -----------------------------
  // PAYMENT NOT FOUND
  // -----------------------------
  if (!payment) {
    return <PaymentError />
  }

  // Normalize URL status (defensive)
  const status = String(rawStatus || "").toLowerCase()

  // -----------------------------
  // PENDING
  // -----------------------------
  if (status === "pending" && payment.status === "PENDING") {
    return <PendingPayment payment={payment} />
  }

  // -----------------------------
  // FAILED
  // -----------------------------
  if (status === "false" || payment.status === "FAILED") {
    return <FailedPayment payment={payment} />
  }

  // -----------------------------
  // SUCCESS (URL OR DB)
  // -----------------------------
  if (status === "true" || payment.status === "SUCCESS") {
    // Venue Booking
    if (payment.venueBooking) {
      return <SuccessVenueBooking payment={payment} />
    }

    // Workshop Booking
    if (payment.workShopBooking) {
      return <SuccessWorkshopBooking payment={payment} />
    }

    // MinyMoe Party Booking
    if (payment.MinyMoePartyBooking || payment.emmmPartyBooking) {
      return <SuccessMinyMoePartyBooking payment={payment} />
    }
    // Playzone Booking
    if (payment.booking) {
      return <SuccessPlayzoneBooking payment={payment} />
    }
  }

  // -----------------------------
  // FALLBACK ERROR
  // -----------------------------
  return <PaymentError />
}
