import { type NextRequest, NextResponse } from "next/server"
import {auth} from "@/auth"

export async function proxy(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}


//Protecting All Routes on this Path
export const config = {
  matcher: [
    "/booking/:path*", 
    "/bookings/:path*", 
    "/dashboard/:path*"
  ]
};
