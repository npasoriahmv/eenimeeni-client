"use client"

import { useState, useMemo, useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const OPENING_TIME_MINUTES = 11 * 60 + 30 // 690
const CLOSING_TIME_MINUTES = 20 * 60 + 30 // 1230

const MAX_DURATION_MINUTES = 300
const MAX_COMPANIONS = 2
const MAX_CHILDREN = 5
const RESEND_COOLDOWN = 30

export enum Type {
  EENIMEENI,
  EENIMEENI_MINYMOE,
  MINYMOE,
}

interface CafeItem {
  item: string
  price: number
  category: string
}

interface SelectedCafeItem extends CafeItem {
  quantity: number
}


interface paymentProps {
  type: Type
  extraDetails: {}
}

interface Child {
  id: string
  name: string
  dob: string
  allergy: string | null
}

interface ResponseMessage {
  success: boolean
  message: string
}

/* ---------------- PRICING TYPE ---------------- */

interface Pricing {
  price30: number
  price60: number
  extendPrice: number
}

export function useBooking() {
  const router = useRouter()

  /* ---------------- BASIC STATE ---------------- */

  const [date, setDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [duration, setDuration] = useState(30)
  const [children, setChildren] = useState(0)
  const [companions, setCompanions] = useState(0)

  /* ---------------- CAFE STATE ---------------- */
  const [beverages, setBeverages] = useState<CafeItem[]>([])
  const [menuItems, setMenuItems] = useState<CafeItem[]>([])
  const [selectedCafeItems, setSelectedCafeItems] = useState<SelectedCafeItem[]>([])
  const [cafeLoading, setCafeLoading] = useState(true)


  const [redeemPoints, setredeemPoints] = useState(0)
  const [acceptedDisclaimers, setAcceptedDisclaimers] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  /* ---------------- PRICING STATE ---------------- */

  const [pricing, setPricing] = useState<Pricing | null>(null)
  const [pricingLoading, setPricingLoading] = useState(true)

  /* ---------------- CHILD SELECTION ---------------- */

  const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>([])
  const [selectedChildrenDetails, setSelectedChildrenDetails] = useState<Child[]>([])

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    setDate(new Date())
    setSelectedTime(null)
  }, [])


  const updateCafeItem = (item: CafeItem, quantity: number) => {
    setSelectedCafeItems(prev => {
      const existing = prev.find(i => i.item === item.item)

      if (quantity === 0) {
        return prev.filter(i => i.item !== item.item)
      }

      if (existing) {
        return prev.map(i =>
          i.item === item.item ? { ...i, quantity } : i
        )
      }

      return [...prev, { ...item, quantity }]
    })
  }



  useEffect(() => {
    const fetchCafe = async () => {
      try {
        setCafeLoading(true)

        const res = await fetch("/api/cafe-config")
        const data = await res.json()

        if (!data.success) {
          toast.error("Failed to load cafe menu")
          return
        }

        setBeverages(data.beverages || [])
        setMenuItems(data.menuItems || [])

      } catch {
        toast.error("Cafe unavailable")
      } finally {
        setCafeLoading(false)
      }
    }

    fetchCafe()
  }, [])


  /* ---------------- FETCH PRICING ---------------- */

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setPricingLoading(true)
        const res = await fetch("/api/pricing?area=EENIMEENI")
        const data = await res.json()

        if (!data.success) {
          toast.error("Failed to load pricing")
          return
        }

        setPricing(data.prices)
      } catch {
        toast.error("Pricing service unavailable")
      } finally {
        setPricingLoading(false)
      }
    }

    fetchPricing()
  }, [])

  /* ---------------- TIME LOGIC ---------------- */

  const maxDuration = useMemo(() => {
    if (!selectedTime) return MAX_DURATION_MINUTES

    const [h, m] = selectedTime.split(":").map(Number)
    const selectedMinutes = h * 60 + m

    const effectiveStart = Math.max(selectedMinutes, OPENING_TIME_MINUTES)
    const remaining = CLOSING_TIME_MINUTES - effectiveStart

    return Math.max(30, Math.min(remaining, MAX_DURATION_MINUTES))
  }, [selectedTime])

  const cafeSubtotal = useMemo(() => {
    return selectedCafeItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
  }, [selectedCafeItems])



  const endTime = useMemo(() => {
    if (!selectedTime) return ""
    const [h, m] = selectedTime.split(":").map(Number)
    const total = h * 60 + m + duration
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
      total % 60
    ).padStart(2, "0")}`
  }, [selectedTime, duration])

  /* ---------------- PRICING LOGIC ---------------- */

  const pricePerChild = useMemo(() => {
    if (!pricing) return 0

    if (duration <= 30) return pricing.price30
    if (duration <= 60) return pricing.price60

    const extraSlots = Math.ceil((duration - 60) / 30)
    return pricing.price60 + extraSlots * pricing.extendPrice
  }, [pricing, duration])

  const subtotal = useMemo(() => {
    const totalChildren = selectedChildrenDetails.length + children
    if (totalChildren === 0) return 0
    return totalChildren * pricePerChild
  }, [selectedChildrenDetails, children, pricePerChild])

  const maxRedeemablePoints = useMemo(() => {
    return Math.floor(subtotal / 1000) * 1000
  }, [subtotal])

  useEffect(() => {
    if (redeemPoints > maxRedeemablePoints) {
      setredeemPoints(maxRedeemablePoints)
    }
  }, [redeemPoints, maxRedeemablePoints])

  const total = useMemo(() => {
    return Math.max(0, subtotal + cafeSubtotal - redeemPoints)
  }, [subtotal, cafeSubtotal, redeemPoints])


  /* ---------------- VALIDATION ---------------- */

  const isValid = useMemo(() => {
    const totalChildren = selectedChildrenDetails.length + children
    return Boolean(
      date &&
      selectedTime &&
      totalChildren >= 1 &&
      acceptedDisclaimers &&
      pricing &&
      !pricingLoading
    )
  }, [
    date,
    selectedTime,
    selectedChildrenDetails,
    children,
    acceptedDisclaimers,
    pricing,
    pricingLoading,
  ])

  /* ---------------- HELPERS ---------------- */

  const handleTimeChange = (time: string) => {
    setSelectedTime(time)
    setDuration(30)
  }

  const handleChildrenSelection = (ids: string[], details: Child[]) => {
    setSelectedChildrenIds(ids)
    setSelectedChildrenDetails(details)
  }

  /* ---------------- PAYMENT ---------------- */

  const handlePayment = async ({ type, extraDetails }: paymentProps) => {
    try {
      setIsLoading(true)

      const start = new Date(date!)
      if (selectedTime) {
        const [h, m] = selectedTime.split(":").map(Number)
        start.setHours(h, m, 0, 0)
      }

      // ✅ CALCULATE endDateTime HERE
      const end = new Date(start.getTime() + duration * 60 * 1000)

      const bookingDetails = {
        type: "EENIMEENI",
        date,
        startDateTime: start,
        endDateTime: end,
        duration,
        childrenIds: selectedChildrenIds,
        guestChilderns: children,
        guardians: companions,
        redeemPoints,
        cafeSubtotal,
        cafeSnapshot: selectedCafeItems,
        extraDetails,
      }


      const res = await fetch("/api/icici/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingDetails),
      })

      const data = await res.json()

      if (data.status === 200) {
        router.push(data.url)
      } else {
        toast.error(data.error || "Payment failed")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }


  /* ---------------- EXPORT ---------------- */

  return {
  date,
  selectedTime,
  duration,
  children,
  companions,

  pricing,
  pricingLoading,

  subtotal,
  total,
  redeemPoints,
  maxRedeemablePoints,

  acceptedDisclaimers,
  setAcceptedDisclaimers,

  maxDuration,
  endTime,
  isValid,
  isLoading,

  selectedChildrenIds,
  selectedChildrenDetails,

  setDate,
  setSelectedTime,
  setDuration,
  setChildren,
  setCompanions,
  setredeemPoints,

  handleTimeChange,
  handleChildrenSelection,
  handlePayment,

  /* ADD THESE */
  beverages,
  menuItems,
  selectedCafeItems,
  updateCafeItem,
  cafeSubtotal,
  cafeLoading,

  constants: {
    MAX_DURATION_MINUTES,
    MAX_COMPANIONS,
    MAX_CHILDREN,
  },
}

}
