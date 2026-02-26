import Link from "next/link"
import { formatISTDate, formatISTTime } from "@/lib/IST"

export default function SuccessWorkshopBooking({ payment }: any) {
  const booking = payment.workShopBooking

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 border rounded-xl shadow-sm bg-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600">
          Workshop Booking Confirmed 🎉
        </h1>

        <div className="mt-6 space-y-3 text-left text-sm">
          <div><strong>Payment Ref:</strong> {payment.merchantTxnNo}</div>
          <div><strong>Transaction ID:</strong> {payment.transactionId || "N/A"}</div>
          <div><strong>Amount Paid:</strong> ₹{payment.amount.toString()}</div>

          <div><strong>Workshop:</strong> {booking.workshop?.title}</div>
          <div><strong>Date:</strong> {formatISTDate(booking.workshop.startAt)}</div>
          <div>
            <strong>Time:</strong>{" "}
            {formatISTTime(booking.workshop.startAt)} - {formatISTTime(booking.workshop.endAt)}
          </div>
          <div><strong>Participants:</strong> {booking.participants}</div>
        </div>

        <div className="mt-8 space-x-4">
          <Link href="/workshops" className="px-4 py-2 bg-green-600 text-white rounded">
            View Workshops
          </Link>
          <Link href="/" className="px-4 py-2 bg-gray-200 rounded">
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
