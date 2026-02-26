import { ArrowRight } from "lucide-react"
import Link from "next/link"
export const BookingButton = () => {
    return (
        <Link 
        href="/packages"
        className="fixed bottom-8 right-8 z-40 bg-linear-to-r from-purple-600 via-pink-500 to-orange-400 text-white px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 flex items-center space-x-2 font-bold text-lg group">
            <span>Book Now</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
    )
}