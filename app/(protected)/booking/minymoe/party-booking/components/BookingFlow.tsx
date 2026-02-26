"use client"

import { useState } from "react"
import GuestSelection from "./GuestSelectionPage"
import PackageSelection from "./PackageSelection"
import Step3Booking from "./step3Booking"


const TOTAL_CAPACITY = 100
const TOTAL_MIN = 30
const SPLIT_MIN = 15

export default function BookingFlow({ data, packages }: any) {
  const [step, setStep] = useState(1)

  const [adultSelected, setAdultSelected] = useState(false)
  const [childSelected, setChildSelected] = useState(false)

  const [adultCount, setAdultCount] = useState(0)
  const [childCount, setChildCount] = useState(0)

  // =========================
  // TOGGLE LOGIC (FIXED)
  // =========================

  const toggleAdults = (checked: boolean) => {
    setAdultSelected(checked)

    if (!checked) {
      setAdultCount(0)
      return
    }

    // If children already selected
    if (childSelected) {
      if (adultCount === 0) {
        setAdultCount(SPLIT_MIN)
      }
      if (adultCount + childCount < TOTAL_MIN) {
        setChildCount(Math.max(SPLIT_MIN, TOTAL_MIN - adultCount))
      }
      return
    }

    // Adults only
    setAdultCount(Math.max(adultCount, TOTAL_MIN))
  }

  const toggleChildren = (checked: boolean) => {
    setChildSelected(checked)

    if (!checked) {
      setChildCount(0)
      return
    }

    // If adults already selected
    if (adultSelected) {
      if (childCount === 0) {
        setChildCount(SPLIT_MIN)
      }
      if (adultCount + childCount < TOTAL_MIN) {
        setAdultCount(Math.max(SPLIT_MIN, TOTAL_MIN - childCount))
      }
      return
    }

    // Children only
    setChildCount(Math.max(childCount, TOTAL_MIN))
  }

  // =========================
  // INCREMENT / DECREMENT
  // =========================

  const incrementAdults = () => {
    if (!adultSelected) return

    if (adultCount + childCount >= TOTAL_CAPACITY) {
      if (childSelected && childCount > SPLIT_MIN) {
        setChildCount(childCount - 1)
        setAdultCount(adultCount + 1)
      }
      return
    }

    setAdultCount(adultCount + 1)
  }

  const decrementAdults = () => {
    if (adultCount <= 0) return
    if (adultSelected && childSelected && adultCount + childCount <= TOTAL_MIN) return
    setAdultCount(adultCount - 1)
  }

  const incrementChildren = () => {
    if (!childSelected) return

    if (adultCount + childCount >= TOTAL_CAPACITY) {
      if (adultSelected && adultCount > SPLIT_MIN) {
        setAdultCount(adultCount - 1)
        setChildCount(childCount + 1)
      }
      return
    }

    setChildCount(childCount + 1)
  }

  const decrementChildren = () => {
    if (childCount <= 0) return
    if (adultSelected && childSelected && adultCount + childCount <= TOTAL_MIN) return
    setChildCount(childCount - 1)
  }

  const [selectedPackage, setSelectedPackage] = useState<any>(null)

  return (
    <>
      {step === 1 && (
        <GuestSelection
          adultSelected={adultSelected}
          childSelected={childSelected}
          adultCount={adultCount}
          childCount={childCount}
          onToggleAdults={toggleAdults}
          onToggleChildren={toggleChildren}
          onAdultPlus={incrementAdults}
          onAdultMinus={decrementAdults}
          onChildPlus={incrementChildren}
          onChildMinus={decrementChildren}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <PackageSelection
          adultSelected={adultSelected}
          childSelected={childSelected}
          adultCount={adultCount}
          childCount={childCount}
          packages={packages}
          onBack={() => setStep(1)}
          onNext={(pkg) => {
            setSelectedPackage(pkg)
            setStep(3)
          }}
        />
      )}

      {step === 3 && selectedPackage && (
        <Step3Booking
          pkg={selectedPackage}
          adults={adultCount}
          kids={childCount}
          setAdults={setAdultCount}
          setKids={setChildCount}
          onBack={() => setStep(2)}
          totalCapacity={TOTAL_CAPACITY}
        />
      )}
    </>
  )
}

