import Link from "next/link"

export default function PaymentError() {
  return (
    <div className="max-w-xl mx-auto mt-12 p-6 border rounded-xl shadow-sm bg-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600">
          Something Went Wrong ⚠️
        </h1>

        <p className="text-gray-600 mt-4">
          We were unable to verify your payment due to a technical issue.
        </p>

        <p className="text-sm text-gray-500 mt-2">
          If your money was deducted, don’t worry — your payment will be
          reconciled automatically within 15–20 minutes.
        </p>

        <div className="mt-8 space-x-4">
          <Link href="/bookings" className="px-4 py-2 bg-red-600 text-white rounded">
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
