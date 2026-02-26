import Image from "next/image"
import { MapPin, Phone, Mail } from "lucide-react"
import ContactForm from "./ContactForm"

export default function ContactPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-orange-50">
      <div className="container mx-auto max-w-6xl px-6 py-12">

        {/* -------- HEADER ---------- */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900">
          LUMIRO ENTERPRISES
        </h2>

        {/* -------- CONTACT INFO STRIP ---------- */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Address */}
          <div className="flex items-start gap-3 bg-white shadow-lg rounded-2xl p-5 border">
            <MapPin className="text-orange-500 h-7 w-7 shrink-0" />
            <p className="text-gray-700 leading-relaxed">
              2nd Floor, EuroKids Preschool,<br />
              Nirvana Country, Sector 50,<br />
              chandigarh, Haryana 122018
            </p>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3 bg-white shadow-lg rounded-2xl p-5 border">
            <Phone className="text-orange-500 h-7 w-7" />
            <p className="text-gray-700 font-medium">+91 9191919191</p>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 bg-white shadow-lg rounded-2xl p-5 border">
            <Mail className="text-orange-500 h-7 w-7" />
            <p className="text-gray-700 font-medium">lumiroenterprises@gmail.com</p>
          </div>

        </div>

        {/* -------- MAIN CONTENT SECTION ---------- */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* LEFT IMAGE */}
          <div className="
            w-full
            max-w-[520px]
            mx-auto
            aspect-[4/4.5]
            rounded-3xl
            overflow-hidden
            shadow-2xl
            border
          ">
            <Image
              src="/kids.png"
              alt="Kids Play Area"
              width={800}
              height={800}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          {/* RIGHT FORM */}
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Drop Us A Message
            </h3>

            <p className="text-gray-600 mb-4">
              Have a question, want to book an event or need more details?
              Send us a message and we’ll reach back soon.
            </p>

            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
