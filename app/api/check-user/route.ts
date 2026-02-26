import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json()

    console.log("Check user for phone:", phoneNumber)

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      )
      
    }

    const user = await prisma.user.findUnique({
      where: { phone: phoneNumber },
    })

    console.log("User found:", !!user)

    if (!user) {
      // Create a simple token with timestamp
      const tokenData = {
        phone: phoneNumber,
        verified: true,
        timestamp: Date.now(),
        expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
      }
      
      const token = Buffer.from(JSON.stringify(tokenData)).toString('base64')

      console.log("Generated token:", token)

      return NextResponse.json({
        exists: false,
        verificationToken: token,
      })
    }

    return NextResponse.json({
      exists: true,
      userId: user.id,
    })
  } catch (error) {
    console.error("Check user error:", error)
    return NextResponse.json(
      { error: "Failed to check user", details: String(error) },
      { status: 500 }
    )
  }
}