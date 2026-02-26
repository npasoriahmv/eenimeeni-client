import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id)
    return NextResponse.json({ success: false })

  const { name, dob, allergy } = await req.json()

  await prisma.child.create({
    data: {
      name,
      dob,
      allergy,
      userId: session.user.id,
    },
  })

  return NextResponse.json({ success: true })
}
