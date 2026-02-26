"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useState } from "react"
import clsx from "clsx"
import { PartyPackage } from "@/generated/prisma/client"

type Props = {
  adultSelected: boolean
  childSelected: boolean
  adultCount: number
  childCount: number
  packages: PartyPackage[]
  onBack: () => void
  onNext: (pkg: PartyPackage) => void
}

export default function PackageSelection({
  adultSelected,
  childSelected,
  adultCount,
  childCount,
  packages,
  onBack,
  onNext,
}: Props) {
  const [selectedPackage, setSelectedPackage] =
    useState<PartyPackage | null>(null)

  const totalGuests =
    (adultSelected ? adultCount : 0) +
    (childSelected ? childCount : 0)

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-4">
      <div className="w-full max-w-6xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold">Choose Your Package</h1>
          <p className="text-muted-foreground">
            For {totalGuests} guests
          </p>
        </div>

        {/* Packages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              selected={selectedPackage?.id === pkg.id}
              onClick={() => setSelectedPackage(pkg)}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>

          <Button
            disabled={!selectedPackage}
            onClick={() =>
              selectedPackage && onNext(selectedPackage)
            }
          >
            Continue →
          </Button>
        </div>
      </div>
    </div>
  )
}

function PackageCard({
  pkg,
  selected,
  onClick,
}: {
  pkg: PartyPackage
  selected: boolean
  onClick: () => void
}) {
  const hours = pkg.durationMinutes / 60

  return (
    <Card
      onClick={onClick}
      className={clsx(
        "cursor-pointer rounded-2xl border-2 transition-all p-6 relative bg-white h-full",
        selected
          ? "border-black shadow-lg scale-[1.03]"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm",
        pkg.badge === "Premium" && "lg:scale-[1.02]"
      )}
    >
      <CardContent className="p-0 space-y-5 flex flex-col h-full">
        {/* Badge */}
        <div
          className={clsx(
            "absolute top-4 right-4 text-xs px-3 py-1 rounded-full font-medium",
            pkg.badge === "Popular" &&
              "bg-black text-white",
            pkg.badge === "Best Value" &&
              "bg-gray-900 text-white",
            pkg.badge === "Premium" &&
              "bg-gradient-to-r from-amber-400 to-yellow-500 text-black"
          )}
        >
          {pkg.badge}
        </div>

        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">
            {pkg.name}
          </h2>
          <p className="text-muted-foreground text-sm">
            {pkg.shortDesc}
          </p>
        </div>

        {/* Rules */}
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>🍽 Choose {pkg.starterCount} Starters</p>
          <p>🍛 Choose {pkg.mainCount} Mains</p>
          <p>🍨 Choose {pkg.dessertCount} Desserts</p>
          <p>⏱ {hours} Hours</p>
        </div>

        {/* Add-on Info */}
        <div className="text-xs text-muted-foreground italic">
          You can add more starters or mains later as
          add-ons at extra cost.
        </div>

        {/* Footer */}
        <div className="mt-auto flex justify-between items-center pt-4">
          <p className="text-lg font-semibold">
            ₹{pkg.pricePerPerson} / person
          </p>

          {selected && (
            <div className="flex items-center gap-1 text-sm font-medium">
              <Check size={16} />
              Selected
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
