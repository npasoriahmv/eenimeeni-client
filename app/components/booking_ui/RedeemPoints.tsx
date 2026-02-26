import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useEffect, useState } from "react"

interface PlayzoneBookingProps {
  CurrentPoints: number
  maxRedeemablePoints: number
  redeemPoints: number
  setredeemPoints: (pointstoredeem: number) => void
}

export default function RedeemPoints({ 
  CurrentPoints, 
  maxRedeemablePoints,
  redeemPoints,
  setredeemPoints 
}: PlayzoneBookingProps) {
  const [isChecked, setIsChecked] = useState(false)
  
  // User must have at least 1000 points AND the booking amount must be at least 1000
  const isAccessible = CurrentPoints >= 1000 && maxRedeemablePoints >= 1000
  
  // Calculate actual redeemable amount (minimum of user points and max redeemable)
  const actualRedeemable = Math.min(
    Math.floor(CurrentPoints / 1000) * 1000,
    maxRedeemablePoints
  )

  // Reset checkbox when conditions change
  useEffect(() => {
    if (!isAccessible || actualRedeemable === 0) {
      setIsChecked(false)
      setredeemPoints(0)
    } else if (isChecked && redeemPoints !== actualRedeemable) {
      // If checkbox is checked but amount changed, update the amount
      setredeemPoints(actualRedeemable)
    }
  }, [isAccessible, actualRedeemable])

  // Sync checkbox state with redeemPoints from parent
  useEffect(() => {
    setIsChecked(redeemPoints > 0)
  }, [redeemPoints])

  const onChangeHandle = (checked: boolean) => {
    setIsChecked(checked)
    if (checked && isAccessible) {
      setredeemPoints(actualRedeemable)
    } else {
      setredeemPoints(0)
    }
  }

  const getTooltipMessage = () => {
    if (CurrentPoints < 1000) {
      return "You need at least 1000 points to redeem"
    }
    if (maxRedeemablePoints < 1000) {
      return "Booking amount must be at least ₹1000 to redeem points"
    }
    return `Redeem ${actualRedeemable} points (₹${actualRedeemable}). Points can only be redeemed in multiples of 1000 and cannot exceed booking amount.`
  }

  return (
    <div className="p-6 rounded-lg border bg-white shadow-sm">
      <h3 className="font-semibold text-lg mb-4">Loyalty Points</h3>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-4 p-4 rounded-lg border 
            ${isAccessible ? "cursor-pointer hover:bg-gray-50" : "bg-gray-100 opacity-60 cursor-not-allowed"}`}
          >
            <Checkbox 
              id="points" 
              checked={isChecked}
              disabled={!isAccessible}
              onCheckedChange={onChangeHandle}
            />

            <div className="flex-1">
              <Label 
                htmlFor="points" 
                className={`font-medium text-sm block ${!isAccessible ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                Redeem Points
              </Label>
              <div className="text-xs text-gray-600 mt-1">
                <span className="font-semibold text-blue-600">{CurrentPoints} points available</span>
                {isAccessible && (
                  <span className="ml-2">• Redeem {actualRedeemable} points (₹{actualRedeemable})</span>
                )}
              </div>
            </div>
          </div>
        </TooltipTrigger>

        <TooltipContent className="max-w-xs">
          <p>{getTooltipMessage()}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}