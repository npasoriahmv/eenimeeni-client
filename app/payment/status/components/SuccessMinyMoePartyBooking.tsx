import Link from "next/link"
import { formatISTDate, formatISTTime } from "@/lib/IST"

export default function SuccessMinyMoePartyBooking({ payment }: any) {
  const booking = payment.MinyMoePartyBooking || payment.emmmPartyBooking

  const pkg = booking.packageSnapshot
  const food = booking.foodSnapshot
  const pricing = booking.pricingSnapshot

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 border rounded-xl shadow-sm bg-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600">
          MinyMoe Party Booked 🎉
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Your party has been successfully booked!
        </p>

        <div className="mt-6 space-y-3 text-left text-sm">
          <div>
            <strong>Payment Ref:</strong> {payment.merchantTxnNo}
          </div>

          <div>
            <strong>Transaction ID:</strong>{" "}
            {payment.transactionId || "N/A"}
          </div>

          <div>
            <strong>Amount Paid:</strong> ₹{payment.amount.toString()}
          </div>

          <div>
            <strong>Party Date:</strong>{" "}
            {formatISTDate(booking.startTime)}
          </div>

          <div>
            <strong>Time:</strong>{" "}
            {formatISTTime(booking.startTime)} –{" "}
            {formatISTTime(booking.endTime)}
          </div>

          <div>
            <strong>Guests:</strong>{" "}
            {booking.totalGuests} (
            {booking.kids} kids, {booking.adults} adults)
          </div>

          <div>
            <strong>Package:</strong> {pkg.name}
          </div>

          <div>
            <strong>Duration:</strong>{" "}
            {booking.durationMinutes} minutes
          </div>

          <div>
            <strong>Total Amount:</strong> ₹
            {pricing.totalAmount.toString()}
          </div>

          <hr className="my-3" />

          <div>
            <strong>Starters:</strong>{" "}
            {food.starters.join(", ")}
          </div>

          <div>
            <strong>Mains:</strong>{" "}
            {food.mains.join(", ")}
          </div>

          {food.addOns?.length > 0 && (
            <div>
              <strong>Add-ons:</strong>{" "}
              {food.addOns
                .map((addon: any) => `${addon.item} (₹${addon.price})`)
                .join(", ")}
            </div>
          )}
        </div>

        <div className="mt-8 space-x-4">
          <Link
            href="/bookings"
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            View Bookings
          </Link>

          <Link
            href="/"
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
