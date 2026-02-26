import Link from "next/link"

export default function PendingPayment({ payment }: any) {
  return (
    <div className="max-w-xl mx-auto mt-12 p-6 border rounded-xl shadow-sm bg-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-yellow-600">
          Payment Processing ⏳
        </h1>

        <p className="text-gray-600 mt-4">
          Your payment is currently being processed by the bank.
        </p>

        <p className="text-sm text-gray-500 mt-2">
          If money was deducted, don’t worry — this page will update automatically
          within 15–20 minutes. You can also check your booking history later.
        </p>

        <div className="mt-6 space-y-2 text-sm">
          <div><strong>Reference:</strong> {payment.merchantTxnNo}</div>
          <div><strong>Amount:</strong> ₹{payment.amount.toString()}</div>
        </div>

        <div className="mt-8 space-x-4">
          <Link href="/bookings" className="px-4 py-2 bg-yellow-600 text-white rounded">
            View My Bookings
          </Link>
          <Link href="/" className="px-4 py-2 bg-gray-200 rounded">
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
