import BookingForm from "../../../components/booking_ui/BookingForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"


interface PlayzoneBookingProps{
    initialUserData:any
}

export function PlayzoneBooking({initialUserData}:PlayzoneBookingProps) {
    return (
        <>
            <div className="max-w-7xl mx-auto px-4 pt-6">
                <Link
                    href="/packages"
                    className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Packages
                </Link>
            </div>
            <BookingForm initialUserData={initialUserData}/>
        </>
    )
}