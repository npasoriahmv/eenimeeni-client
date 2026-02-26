"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Minus, Plus } from "lucide-react"
import Link from "next/link"

export default function GuestSelection({
  adultSelected,
  childSelected,
  adultCount,
  childCount,
  onToggleAdults,
  onToggleChildren,
  onAdultPlus,
  onAdultMinus,
  onChildPlus,
  onChildMinus,
  onNext,
}: any) {
  const total = adultCount + childCount
  const canContinue = total >= 30 && total <= 100

  return (
    <div className="min-h-screen bg-[#f7f8fa] px-4 py-6">
      {/* ✅ BACK BUTTON – SIMPLE */}
      <div className="mx-auto mb-4 max-w-2xl">
        <Link href="/booking/minymoe">
          <Button variant="ghost" className="flex items-center gap-2 px-0">
            <ArrowLeft size={18} />
            Back
          </Button>
        </Link>
      </div>

      {/* CARD */}
      <div className="flex justify-center">
        <Card className="w-full max-w-2xl rounded-2xl shadow-xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-semibold">
              Who’s Attending the Party?
            </CardTitle>
            <CardDescription>
              Total guests must be between 30 and 100
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <GuestRow
              label="Adults"
              selected={adultSelected}
              count={adultCount}
              onToggle={onToggleAdults}
              onIncrement={onAdultPlus}
              onDecrement={onAdultMinus}
            />

            <GuestRow
              label="Children"
              selected={childSelected}
              count={childCount}
              onToggle={onToggleChildren}
              onIncrement={onChildPlus}
              onDecrement={onChildMinus}
            />

            <div className="text-center text-sm text-gray-500">
              Total Guests: <b>{total}</b> / 100
            </div>

            <Button
              className="w-full h-12 text-lg rounded-xl"
              disabled={!canContinue}
              onClick={onNext}
            >
              Continue →
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function GuestRow({
  label,
  selected,
  count,
  onToggle,
  onIncrement,
  onDecrement,
}: any) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-white p-4">
      <div className="flex items-center gap-3">
        <Checkbox checked={selected} onCheckedChange={(v: boolean) => onToggle(v)} />
        <span className="text-lg font-medium">{label}</span>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" disabled={!selected} onClick={onDecrement}>
          <Minus size={16} />
        </Button>

        <span className="w-10 text-center font-semibold">{count}</span>

        <Button variant="outline" size="icon" disabled={!selected} onClick={onIncrement}>
          <Plus size={16} />
        </Button>
      </div>
    </div>
  )
}
