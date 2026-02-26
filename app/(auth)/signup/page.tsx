"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CheckCircle2, MapPin, Mail, User } from "lucide-react"
import { toast } from "sonner"

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [phoneNumber, setPhoneNumber] = useState("")
  const [isValidToken, setIsValidToken] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)

  const [formData, setFormData] = useState({
    parentName: "",
    email: "",
    address: "",
  })

  const [loading, setLoading] = useState(false)

  // -------------------------
  // VERIFY TOKEN
  // -------------------------
  useEffect(() => {
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const decoded = JSON.parse(
        Buffer.from(token, "base64").toString("utf-8")
      )

      if (Date.now() > decoded.expiresAt) throw new Error()

      setPhoneNumber(decoded.phone)
      setIsValidToken(true)
    } catch {
      toast.error("Invalid or expired verification link")
      router.push("/login")
    } finally {
      setIsVerifying(false)
    }
  }, [token, router])

  // -------------------------
  // SUBMIT
  // -------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.parentName.trim()) {
      toast.error("Parent name is required")
      return
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        toast.error("Invalid email address")
        return
      }
    }

    if (formData.address && formData.address.trim().length < 10) {
      toast.error("Address must be at least 10 characters")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber,
          parentName: formData.parentName.trim(),
          email: formData.email || null,
          address: formData.address || null,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        toast.error(data.message || "Signup failed")
        return
      }

      await signIn("credentials", {
        phone: phoneNumber,
        redirect: false,
      })

      toast.success("Account created successfully")
      router.push("/packages")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full" />
      </div>
    )
  }

  if (!isValidToken) return null

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted to-background flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">
            Complete Your Profile
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Just a few details to get started
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Verified Phone */}
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Phone verified
                </p>
                <p className="text-xs text-green-700">+91 {phoneNumber}</p>
              </div>
            </div>

            {/* Parent Name */}
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Parent Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Enter parent name"
                value={formData.parentName}
                onChange={(e) =>
                  setFormData({ ...formData, parentName: e.target.value })
                }
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email (Optional)
              </Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            {/* Address */}
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address (Optional)
              </Label>
              <Input
                placeholder="House no, street, city"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Used for invoices & communication
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
