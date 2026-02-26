"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Sparkles, Play } from "lucide-react"
import { stats } from "../../constants/stats"

export const HeroSection = () => {
  return (
    <section
      id="herosection"
      className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 md:pt-28"
    >
      {/* Soft Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-400 to-orange-300" />

      {/* Subtle Glow Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 left-10 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-yellow-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-6">

        {/* Badge */}
        <Badge className="px-4 py-2 text-sm bg-white/90 text-purple-700 shadow">
          Open Daily • 9AM to 9PM
        </Badge>

        {/* Heading */}
        <h1 className="text-white font-black leading-[1.1] tracking-tight text-4xl sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-xl">
          Where <span className="bg-gradient-to-r from-yellow-300 to-orange-300 text-transparent bg-clip-text">Fun</span>
          <br />
          Never Stops 🎉
        </h1>

        {/* SubText */}
        <p className="text-white/90 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed">
          A magical world of Play • Parties • Laughs • Memories
        </p>

        {/* CTA */}
        <div className="flex justify-center gap-4 mt-4">
          <Button
            size="lg"
            asChild
            className="text-lg px-8 shadow-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition"
          >
            <Link href="#spaces">
              <Play className="w-5 h-5 mr-2" /> Let’s Play!
            </Link>
          </Button>

          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8 shadow-lg hover:scale-105 transition"
            asChild
          >
            <Link href="#contact">
              Book a Party 🎂
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-10 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <Card
              key={i}
              className="bg-white/90 backdrop-blur border-white shadow-xl p-5 hover:-translate-y-1 transition"
            >
              <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                {s.number}
              </p>
              <p className="text-gray-600 font-medium text-sm md:text-base">
                {s.label}
              </p>
            </Card>
          ))}
        </div>

        {/* Glow Accent */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-70">
          <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
        </div>

      </div>
    </section>
  )
}
