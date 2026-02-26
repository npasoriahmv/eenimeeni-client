import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { options } from "./Constants"
import { ArrowLeft } from "lucide-react"

export default function ServicesPage() {
  return (
    <section className="min-h-screen w-full bg-linear-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] py-28">
      <div className="container mx-auto max-w-6xl px-4">

        {/* Back Button */}
        <div className="mb-10">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Packages
          </Link>
        </div>

        {/* Header */}
        <div className="mb-24 text-center">
          <h1 className="text-5xl font-semibold tracking-tight text-slate-900">
            Choose Your Experience
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
            Premium spaces and experiences crafted for quality, comfort, and creativity.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {options.map((item) => (
            <Link key={item.title} href={item.href}>
              <Card className="group h-full cursor-pointer rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-medium text-slate-900">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-8 h-0.5 w-0 bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-300 group-hover:w-full" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
