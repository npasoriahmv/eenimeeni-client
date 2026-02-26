import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {

    const config = await prisma.cafeConfig.findFirst({
      orderBy: {
        createdAt: "desc"
      }
    })

    if (!config) {
      return NextResponse.json({
        success: true,
        beverages: [],
        menuItems: []
      })
    }

    return NextResponse.json({
      success: true,
      beverages: config.BeverageItems,
      menuItems: config.MenuItems
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch cafe config"
      },
      { status: 500 }
    )
  }
}
