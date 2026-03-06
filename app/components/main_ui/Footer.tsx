"use client"

import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export const Footer = () => {
  const pathname = usePathname()

  if (pathname === "/userform") return null

  return (
    <footer className="w-full mt-16">
      <Card className="border-none bg-gradient-to-b from-black via-gray-950 to-black rounded-none py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-6">

          {/* Logo + Gradient Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>

            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 bg-clip-text text-transparent tracking-tight">
              Eeni Meeni Miny Moe
            </h2>
          </div>

          {/* Premium Tagline */}
          <p className="text-sm text-gray-400 text-center max-w-sm leading-relaxed">
            Curating joyful childhood experiences — moments that stay forever.
          </p>

          {/* Quick Links */}
          <div className="flex gap-6 text-sm">
            <Link 
            href={"/contact"}
            className="text-gray-300 hover:text-white">
              Contact
            </Link>
            <Link 
            href={"/"}
            className="text-gray-300 hover:text-white">
              About
            </Link><Link 
            href={"#spaces"}
            className="text-gray-300 hover:text-white">
              Spaces
            </Link>
          </div>

          <Separator className="bg-white/10 w-full max-w-5xl" />

          {/* Bottom Bar */}
          <p className="text-xs text-gray-500 tracking-wide">
            © {new Date().getFullYear()} Eeni Meeni Miny Moe — All Rights Reserved
          </p>
        </div>
      </Card>
    </footer>
  )
}
