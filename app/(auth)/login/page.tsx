"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ContactFormCompact } from "@/app/components/booking_ui/ContactForm"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  /* ------------------ OTP STATE ------------------ */
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [sendingOTP, setSendingOTP] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)

  /* ------------------ OTP ACTIONS ------------------ */

  const sendOTP = async () => {
    try {
      toast.loading("Sending OTP...", { id: "otp-send" })

      const res = await fetch("/api/sendotp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      })

      const data = await res.json()

      if (data.status === "success") {
        toast.success("OTP sent", { id: "otp-send" })
        setSendingOTP(true)
        setResendTimer(30)
      } else {
        toast.error(data.message || "Failed to send OTP", {
          id: "otp-send",
        })
      }
    } catch {
      toast.error("Failed to send OTP", { id: "otp-send" })
    }
  }

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Enter valid OTP")
      return
    }

    try {
      setIsVerifying(true)
      toast.loading("Verifying OTP...", { id: "otp-verify" })

      const res = await fetch("/api/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, code: otp }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success("Phone verified", { id: "otp-verify" })
        setIsVerified(true)
        setSendingOTP(false)
      } else {
        toast.error(data.message || "Invalid OTP", {
          id: "otp-verify",
        })
        setOtp("")
      }
    } catch {
      toast.error("OTP verification failed", {
        id: "otp-verify",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const resendOTP = async () => {
    if (resendTimer > 0) return
    setOtp("")
    await sendOTP()
  }

  const changePhoneNumber = () => {
    setSendingOTP(false)
    setIsVerified(false)
    setOtp("")
    setResendTimer(0)
  }

  /* ------------------ LOGIN ------------------ */

  const handleLogin = async () => {
    if (!isVerified) {
      toast.error("Please verify your phone number")
      return
    }

    setIsLoading(true)

    try {
      const checkResponse = await fetch("/api/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      })

      const { exists, verificationToken } = await checkResponse.json()

      if (exists) {
        const result = await signIn("credentials", {
          phone: phoneNumber,
          redirect: false,
        })

        if (result?.error) {
          toast.error("Login failed")
        } else {
          toast.success("Login successful")
          router.push("/dashboard")
          router.refresh()
        }
      } else {
        if (!verificationToken) {
          toast.error("Signup token generation failed")
          return
        }
        router.push(`/signup?token=${verificationToken}`)
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  /* ------------------ UI ------------------ */

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Sign in to continue booking
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <ContactFormCompact
              phoneNumber={phoneNumber}
              sendingOTP={sendingOTP}
              otp={otp}
              isVerified={isVerified}
              resendTimer={resendTimer}
              isVerifying={isVerifying}
              onPhoneChange={setPhoneNumber}
              onOtpChange={setOtp}
              onSendOTP={sendOTP}
              onVerifyOTP={verifyOTP}
              onResendOTP={resendOTP}
              onChangePhone={changePhoneNumber}
            />

            <Button
              className="w-full"
              size="lg"
              disabled={!isVerified || isLoading}
              onClick={handleLogin}
            >
              {isLoading ? "Processing..." : "Continue"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
