

import Link from "next/link"
import { formatISTDate, formatISTTime } from "@/lib/IST"

export default function SuccessPlayzoneBooking({ payment }: any) {
  const booking = payment.booking

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 border rounded-xl shadow-sm bg-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600">
          Booking Confirmed 🎉
        </h1>

        <div className="mt-6 space-y-3 text-left text-sm">
          <div><strong>Payment Ref:</strong> {payment.merchantTxnNo}</div>
          <div><strong>Transaction ID:</strong> {payment.transactionId || "N/A"}</div>
          <div><strong>Amount Paid:</strong> ₹{payment.amount.toString()}</div>

          <div><strong>Booking ID:</strong> {booking.bookingId}</div>
          <div><strong>Package:</strong> {booking.type}</div>
          <div><strong>Date:</strong> {formatISTDate(booking.date)}</div>
          <div>
            <strong>Time:</strong>{" "}
            {formatISTTime(booking.startTime)} - {formatISTTime(booking.endTime)}
          </div>

          <div><strong>Children:</strong> {booking.children?.map((c: any) => c.name).join(", ") || "N/A"}</div>
          <div><strong>Guest Children:</strong> {booking.guestChildren}</div>
          <div><strong>Guardians:</strong> {booking.guardians}</div>
        </div>

        <div className="mt-8 space-x-4">
          <Link href="/bookings" className="px-4 py-2 bg-green-600 text-white rounded">
            View Bookings
          </Link>
          <Link href="/" className="px-4 py-2 bg-gray-200 rounded">
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
