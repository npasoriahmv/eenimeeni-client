import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Minus } from "lucide-react"

interface BookingDetailsCompactProps {
    duration: number
    children: number
    companions: number
    maxDuration: number
    selectedTime: string | null
    endTime: string
    onDurationChange: (value: number) => void
    onChildrenChange: (value: number) => void
    onCompanionsChange: (value: number) => void
}

const PRICE_PER_CHILD = 500
const PRICE_PER_COMPANION = 0
const MAX_COMPANIONS = 2
const MAX_CHILDREN = 5

export function BookingDetailsCompact({
    duration,
    children,
    companions,
    maxDuration,
    selectedTime,
    endTime,
    onDurationChange,
    onChildrenChange,
    onCompanionsChange,
}: BookingDetailsCompactProps) {
    const formatDuration = (mins: number) => {
        const hours = Math.floor(mins / 60)
        const minutes = mins % 60
        if (hours === 0) return `${minutes}min`
        if (minutes === 0) return `${hours}hr`
        return `${hours}h ${minutes}m`
    }

    return (
        <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3">Booking Details</h3>
            
            <div className="space-y-2">
                <CompactCounter
                    label="Duration"
                    value={duration}
                    displayValue={formatDuration(duration)}
                    price={null}
                    min={30}
                    max={maxDuration}
                    step={30}
                    onChange={onDurationChange}
                    extra={selectedTime ? `${selectedTime} - ${endTime}` : ""}
                />

                <CompactCounter
                    label="Guest Children"
                    value={children}
                    displayValue={children.toString()}
                    price={children * PRICE_PER_CHILD}
                    min={0}
                    max={MAX_CHILDREN}
                    step={1}
                    onChange={onChildrenChange}
                />

                <CompactCounter
                    label="Guardians"
                    value={companions}
                    displayValue={companions.toString()}
                    price={companions * PRICE_PER_COMPANION}
                    min={0}
                    max={MAX_COMPANIONS}
                    step={1}
                    onChange={onCompanionsChange}
                    extra={companions > 0 ? `₹${PRICE_PER_COMPANION} each` : "Optional"}
                />
            </div>
        </Card>
    )
}

function CompactCounter({
    label,
    value,
    displayValue,
    price,
    min,
    max,
    step,
    onChange,
    extra,
}: {
    label: string
    value: number
    displayValue: string
    price: number | null
    min: number
    max: number
    step: number
    onChange: (value: number) => void
    extra?: string
}) {
    return (
        <div className="flex items-center justify-between py-2 border-b last:border-0">
            <div className="flex-1 min-w-0 pr-2">
                <div className="font-medium text-sm">{label}</div>
                {extra && <div className="text-xs text-muted-foreground truncate">{extra}</div>}
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
                {price !== null && (
                    <span className="text-sm font-semibold text-primary min-w-16 text-right">
                        ₹{price}
                    </span>
                )}
                <div className="flex items-center gap-1.5">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => onChange(Math.max(min, value - step))}
                        disabled={value <= min}
                    >
                        <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <div className="min-w-[60px] text-center font-semibold text-sm px-1">
                        {displayValue}
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => onChange(Math.min(max, value + step))}
                        disabled={value >= max}
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}