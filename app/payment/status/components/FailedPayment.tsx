import Link from "next/link"

export default function FailedPayment({ payment }: any) {
  return (
    <div className="max-w-xl mx-auto mt-12 p-6 border rounded-xl shadow-sm bg-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600">
          Payment Failed ❌
        </h1>

        <p className="text-gray-600 mt-2">
          Your payment could not be completed.
        </p>

        <div className="mt-6 space-y-3 text-left text-sm">
          <div><strong>Payment Ref:</strong> {payment.merchantTxnNo}</div>
          <div><strong>Reason:</strong> {payment.responseMessage || "Payment Failed"}</div>
          <div><strong>Amount:</strong> ₹{payment.amount.toString()}</div>
        </div>

        <div className="mt-8 space-x-4">
          <Link href="/" className="px-4 py-2 bg-gray-200 rounded">
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
