import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, PartyPopper, Palette, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function MainBookingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Choose Your Experience
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Click a package below to continue with your booking
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          
          {/* Playzone */}
          <Link href="/booking/playzone" className="h-full">
            <Card className="h-full flex flex-col relative overflow-hidden border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-blue-400">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-bl-full" />

              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Sparkles className="w-8 h-8 text-blue-500" />
                  <Badge variant="secondary">Popular</Badge>
                </div>

                <div className="flex flex-col">
                  <span className="text-2xl font-bold">Eeni Meeni</span>
                  <span className="text-sm text-muted-foreground -mt-1">
                    Soft Play Area
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mt-2">
                  Individual play sessions
                </p>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                {[
                  "Multiple time slots",
                  "Age-appropriate activities",
                  "Safe & supervised",
                  "Guardian entry included",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>

              {/* CTA */}
              <div className="mt-auto p-4">
                <Button className="w-full">
                  Select Package <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </Card>
          </Link>

          {/* Combo */}
          <Link href="/booking/combo" className="h-full">
            <Card className="h-full flex flex-col relative overflow-hidden border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute top-0 right-0">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-bl-lg rounded-tr-lg px-3 py-1">
                  Best Value
                </Badge>
              </div>

              <CardHeader className="pt-8">
                <Palette className="w-8 h-8 text-amber-500 mb-2" />

                <div className="flex flex-col">
                  <span className="text-2xl font-bold">
                    Eeni Meeni Miny Moe
                  </span>
                  <span className="text-sm text-muted-foreground -mt-1">
                    Kids Party
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mt-2">
                  Party + Playzone combo
                </p>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                {[
                  "Both spaces included",
                  "Unlimited play access",
                  "Premium party features",
                  "Maximum fun guaranteed",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>

              <div className="mt-auto p-4">
                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90">
                  Select Best Value <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </Card>
          </Link>

          {/* Party */}
          <Link href="/booking/minymoe" className="h-full">
            <Card className="h-full flex flex-col relative overflow-hidden border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-purple-400">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-bl-full" />

              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <PartyPopper className="w-8 h-8 text-purple-500" />
                  <Badge className="bg-purple-100 text-purple-700">
                    Premium
                  </Badge>
                </div>

                <div className="flex flex-col">
                  <span className="text-2xl font-bold">Miny Moe</span>
                  <span className="text-sm text-muted-foreground -mt-1">
                    Experience Space
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mt-2">
                  Birthday & celebration packages
                </p>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                {[
                  "Dedicated party space",
                  "Food & beverage included",
                  "Customizable add-ons",
                  "Professional hosting",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>

              <div className="mt-auto p-4">
                <Button
                  variant="outline"
                  className="w-full border-purple-400 text-purple-600 hover:bg-purple-50"
                >
                  Select Premium <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </Card>
          </Link>

        </div>
      </div>
    </div>
  )
}
