import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, User } from "lucide-react"
import { Type } from "./useBooking"

interface Child {
    id: string
    name: string
    dob: string
    allergy: string | null
}

interface BookingSummaryCompactProps {
    date: Date | undefined
    selectedTime: string | null
    endTime: string
    duration: number
    children: number
    companions: number
    subtotal: number
    redeemPoints: number
    total: number
    isValid: boolean
    selectedChildrenDetails: Child[]
    handlePayment: any
    isLoading: boolean
    cafeSubtotal: number
}

export function BookingSummaryCompact({
    date,
    selectedTime,
    endTime,
    duration,
    children,
    companions,
    subtotal,
    redeemPoints,
    total,
    isValid,
    selectedChildrenDetails,
    handlePayment,
    isLoading,
    cafeSubtotal
}: BookingSummaryCompactProps) {
    const formatDuration = (mins: number) => {
        const hours = Math.floor(mins / 60)
        const minutes = mins % 60
        if (hours === 0) return `${minutes}min`
        if (minutes === 0) return `${hours}h`
        return `${hours}h ${minutes}m`
    }

    const totalChildren = selectedChildrenDetails.length + children
    const hasAtLeastOneChild = totalChildren >= 1

    return (
        <Card className="p-4 bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="space-y-3">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-bold text-lg">Booking Summary</h3>
                        {date && selectedTime && (
                            <p className="text-xs text-muted-foreground">
                                {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} • {selectedTime} - {endTime} ({formatDuration(duration)})
                            </p>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-muted-foreground mb-1">
                            {totalChildren} total {totalChildren === 1 ? "child" : "children"}
                            {companions > 0 && ` + ${companions} guardian${companions > 1 ? 's' : ''}`}
                        </div>
                    </div>
                </div>

                {/* Selected Children Details */}
                {selectedChildrenDetails.length > 0 && (
                    <div className="pt-3 border-t space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Your Registered Children
                        </p>
                        <div className="space-y-1.5">
                            {selectedChildrenDetails.map((child) => (
                                <div key={child.id} className="flex items-start gap-2 text-sm bg-white/50 p-2 rounded">
                                    <User className="w-4 h-4 text-primary mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium">{child.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Guest Children */}
                {children > 0 && (
                    <div className="pt-3 border-t">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            Guest Children
                        </p>
                        <p className="text-sm">
                            {children} {children === 1 ? "child" : "children"}
                        </p>
                    </div>
                )}

                {/* Price Breakdown */}
                <div className="pt-3 border-t space-y-2">

                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Playzone</span>
                        <span className="font-medium">₹{subtotal}</span>
                    </div>

                    {cafeSubtotal > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Cafe</span>
                            <span className="font-medium">₹{cafeSubtotal}</span>
                        </div>
                    )}

                    {redeemPoints > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-green-600 font-medium">Points Redeemed</span>
                            <span className="text-green-600 font-semibold">-₹{redeemPoints}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-bold text-base">Total Amount</span>
                        <span className="text-2xl font-bold text-primary">₹{total}</span>
                    </div>

                </div>


                {/* Validation Warning */}
                {!hasAtLeastOneChild && (
                    <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                        <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>Please select at least one child (registered or guest)</span>
                    </div>
                )}

                {!isValid && hasAtLeastOneChild && (
                    <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded">
                        <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>Please complete all fields</span>
                    </div>
                )}

                <Button
                    className="w-full font-semibold"
                    size="lg"
                    disabled={!isValid || !hasAtLeastOneChild || isLoading}
                    onClick={() => handlePayment({ type: Type.EENIMEENI, extraDetails: {} })}
                >
                    {isLoading ? 'Processing...' : `Pay ₹${total}`}
                </Button>

                {redeemPoints > 0 && (
                    <p className="text-xs text-center text-green-600 font-medium">
                        🎉 You're saving ₹{redeemPoints} with loyalty points!
                    </p>
                )}
            </div>
        </Card>
    )
}