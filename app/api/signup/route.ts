import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      phone,
      email,
      parentName,
      address, // 👈 NEW
    } = body

    // --------------------
    // BASIC VALIDATION
    // --------------------
    if (!phone || !parentName) {
      return NextResponse.json(
        { success: false, message: "Phone and parent name are required" },
        { status: 400 }
      )
    }

    // Email validation (optional)
    if (email) {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, message: "Invalid email format" },
          { status: 400 }
        )
      }
    }

    // Address validation (optional)
    if (address) {
      if (typeof address !== "string") {
        return NextResponse.json(
          { success: false, message: "Invalid address" },
          { status: 400 }
        )
      }

      const trimmedAddress = address.trim()

      if (trimmedAddress.length < 10 || trimmedAddress.length > 300) {
        return NextResponse.json(
          {
            success: false,
            message: "Address must be between 10 and 300 characters",
          },
          { status: 400 }
        )
      }
    }

    // --------------------
    // CHECK EXISTING USER
    // --------------------
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      )
    }

    // --------------------
    // CREATE USER (NO CHILDREN)
    // --------------------
    const user = await prisma.user.create({
      data: {
        phone,
        email: email || null,
        parentName: parentName.trim(),
        address: address?.trim() || null,
      },
    })

    return NextResponse.json({
      success: true,
      userId: user.id,
    })
  } catch (error) {
    console.error("Signup error:", error)

    return NextResponse.json(
      { success: false, message: "Failed to create user" },
      { status: 500 }
    )
  }
}
