import { prisma } from "@/lib/prisma"

const OPENING_TIME_MINUTES = 11 * 60 + 30 // 11:30 AM
const CLOSING_TIME_MINUTES = 20 * 60 + 30 // 8:30 PM
const MAX_DURATION = 300
const MAX_CHILDREN = 5
const MAX_COMPANIONS = 2

export async function verifyBookingPayload(payload: {
  userId: string
  startDateTime: string
  childrenIds: string[]
  guestChilderns: number
  guardians: number
  redeemPoints: number
  duration: number
}) {
  const {
    userId,
    startDateTime,
    childrenIds,
    guestChilderns,
    guardians,
    redeemPoints,
    duration,
  } = payload

  /* ---------------- USER ---------------- */

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { children: true },
  })

  if (!user) throw new Error("User not found")

  /* ---------------- CHILD VALIDATION ---------------- */

  const ownedIds = user.children.map((c) => c.id)
  if (childrenIds.some((id) => !ownedIds.includes(id))) {
    throw new Error("Invalid child selection")
  }

  if (guestChilderns < 0 || guestChilderns > MAX_CHILDREN) {
    throw new Error("Invalid guest children count")
  }

  if (guardians < 0 || guardians > MAX_COMPANIONS) {
    throw new Error("Invalid guardians count")
  }

  const totalChildren = childrenIds.length + guestChilderns
  if (totalChildren < 1) {
    throw new Error("At least one child required")
  }

  /* ---------------- TIME VALIDATION ---------------- */

  const [h, m] = startDateTime.split(":").map(Number)
  const startMinutes = h * 60 + m

  if (
    startMinutes < OPENING_TIME_MINUTES ||
    startMinutes >= CLOSING_TIME_MINUTES
  ) {
    throw new Error("Outside business hours (11:30 – 8:30)")
  }

  if (duration <= 0 || duration > MAX_DURATION || duration % 30 !== 0) {
    throw new Error("Invalid duration")
  }

  if (startMinutes + duration > CLOSING_TIME_MINUTES) {
    throw new Error("End time exceeds closing time")
  }

  /* ---------------- PRICING (DB ONLY) ---------------- */

  const pricingRows = await prisma.pricing.findMany({
    where: { area: "EENIMEENI" },
  })

  if (!pricingRows.length) {
    throw new Error("Pricing not configured")
  }

  const price30 = pricingRows.find((p) => p.id === "em_30")?.price
  const price60 = pricingRows.find((p) => p.id === "em_60")?.price
  const extendPrice = pricingRows.find(
    (p) => p.id === "em_extend"
  )?.price

  if (!price30 || !price60 || !extendPrice) {
    throw new Error("Incomplete pricing configuration")
  }

  let pricePerChild = 0

  if (duration <= 30) {
    pricePerChild = Number(price30)
  } else if (duration <= 60) {
    pricePerChild = Number(price60)
  } else {
    const extraSlots = Math.ceil((duration - 60) / 30)
    pricePerChild =
      Number(price60) + extraSlots * Number(extendPrice)
  }

  const serverSubtotal = Math.round(
    totalChildren * pricePerChild
  )

  /* ---------------- LOYALTY ---------------- */

  const maxRedeemable =
    Math.floor(serverSubtotal / 1000) * 1000

  if (
    redeemPoints < 0 ||
    redeemPoints > maxRedeemable ||
    redeemPoints > user.loyaltyPoints
  ) {
    throw new Error("Invalid redeem points")
  }

  const serverTotal = Math.max(
    0,
    serverSubtotal - redeemPoints
  )

  return {
    serverSubtotal,
    serverTotal,
    currentPoints: user.loyaltyPoints,
  }
}
