import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    )
  }

  const { children } = await req.json()
  const now = new Date()

  for (const child of children) {
    const dob = new Date(child.dob)
    const ageInMs = now.getTime() - dob.getTime()
    const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365)

    if (ageInYears < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Child must be at least 1 year old",
        },
        { status: 400 }
      )
    }
  }

  const created = await prisma.$transaction(
    children.map((c: any) =>
      prisma.child.create({
        data: {
          name: c.name.trim(),
          dob: new Date(c.dob),
          allergy: c.allergy || null,
          userId: session.user.id,
        },
      })
    )
  )

  return NextResponse.json({
    success: true,
    children: created,
  })
}
