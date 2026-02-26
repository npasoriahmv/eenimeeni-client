import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import {
  Gift,
  Users,
  Phone,
  Mail,
  History,
  User,
  Pencil,
} from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { children: true },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">

        {/* ---------------- HEADER ---------------- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back, {user?.parentName} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your account, children & bookings
            </p>
          </div>

          {/* EDIT PROFILE CTA */}
          <Button asChild size="lg" className="rounded-2xl gap-2">
            <Link href="/update-profile">
              <Pencil className="w-4 h-4" />
              Edit Profile
            </Link>
          </Button>
        </div>

        {/* ---------------- MAIN GRID ---------------- */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* PROFILE OVERVIEW */}
          <Card className="bg-white/70 backdrop-blur-lg border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-primary" />
                Profile Overview
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" /> Phone
                </p>
                <p className="font-semibold">{user?.phone}</p>
              </div>

              {user?.email && (
                <div>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" /> Email
                  </p>
                  <p className="font-semibold">{user.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* LOYALTY */}
          <Card className="border-none shadow-xl bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-amber-900">
                <Gift className="w-5 h-5" />
                Loyalty Points
              </CardTitle>
              <CardDescription className="text-amber-800">
                Use points for bookings
              </CardDescription>
            </CardHeader>

            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-extrabold text-amber-900">
                  {user?.loyaltyPoints || 0}
                </p>
                <p className="text-sm text-amber-800">Available points</p>
              </div>

              <Button
                asChild
                className="rounded-xl bg-amber-700 hover:bg-amber-800"
              >
                <Link href="/packages">Redeem</Link>
              </Button>
            </CardContent>
          </Card>

          {/* HISTORY */}
          <Card className="bg-white/70 backdrop-blur-lg border-none shadow-xl hover:shadow-2xl transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="w-5 h-5 text-primary" />
                Booking History
              </CardTitle>
              <CardDescription>
                Past visits & payments
              </CardDescription>
            </CardHeader>

            <CardContent className="flex justify-end">
              <Button variant="outline" asChild>
                <Link href="/bookings">View History</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ---------------- CHILDREN ---------------- */}
        <Card className="bg-white/70 backdrop-blur-lg border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-5 h-5 text-primary" />
              Your Children
            </CardTitle>
            <CardDescription>
              Registered child profiles
            </CardDescription>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            {user?.children.length === 0 ? (
              <p className="text-muted-foreground">
                No children added yet. Add them from your profile.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {user?.children.map((child) => (
                  <Card
                    key={child.id}
                    className="rounded-2xl border bg-background p-5 shadow-sm hover:shadow-md transition"
                  >
                    {/* HEADER */}
                    <div className="space-y-1">
                      <p className="font-semibold text-lg truncate">
                        {child.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        DOB:{" "}
                        {new Date(child.dob).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* FOOTER META */}
                    {child.allergy && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <Info className="w-4 h-4 shrink-0" />

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="max-w-[180px] truncate cursor-help">
                              Allergy: {child.allergy}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            {child.allergy}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>


        {/* ---------------- SIGN OUT ---------------- */}
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}
          className="flex justify-center"
        >
          <Button variant="destructive" size="lg" className="rounded-xl">
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  )
}
