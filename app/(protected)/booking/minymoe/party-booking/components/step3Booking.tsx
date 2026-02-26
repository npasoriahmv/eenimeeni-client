"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { MinyMoePartyDateAndTimeSelector } from "./MinyMoePartyDateandTimeSelector"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type AddonItem = {
    item:string
    price: number
}


type FoodCardProps = {
    name: string
    selected: boolean
    onToggle: () => void
    priceLabel?: string
}

interface Step3Props {
    pkg: any
    adults: number
    kids: number
    setAdults: (n: number) => void
    setKids: (n: number) => void
    onBack: () => void,
    totalCapacity: number
}

export default function Step3Booking({
    pkg,
    adults,
    kids,
    setAdults,
    setKids,
    onBack,
    totalCapacity
}: Step3Props) {
    const totalGuests = adults + kids
    const [selectedStarters, setSelectedStarters] = useState<string[]>([])
    const [selectedMains, setSelectedMains] = useState<string[]>([])
    const [selectedDesserts, setselectedDesserts] = useState<string[]>([])
    const [selectedAddons, setSelectedAddons] = useState<AddonItem[]>([])

    const router = useRouter()
    const [isPaying, setIsPaying] = useState(false)

    const addonsTotal = selectedAddons.reduce(
        (sum, item) => sum + item.price,
        0
    )


    const toggleItem = (
        item: string,
        setter: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        setter((prev) =>
            prev.includes(item)
                ? prev.filter((i) => i !== item)
                : [...prev, item]
        )
    }

    const toggleAddon = (item: AddonItem) => {
        setSelectedAddons((prev) =>
            prev.find((a) => a.item === item.item)
                ? prev.filter((a) => a.item !== item.item)
                : [...prev, item]
        )
    }

    const handlePrepareBooking = async (
        paymentType: "ADVANCE" | "FULL"
    ) => {
        if (isPaying) return
        if (!date || !startTime) return

        setIsPaying(true)

        const start = new Date(
            `${date.toISOString().split("T")[0]}T${startTime}`
        )

        const end = new Date(
            start.getTime() + pkg.durationMinutes * 60 * 1000
        )

        const bookingPayload = {
            paymentType,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            durationMinutes: pkg.durationMinutes,

            guests: {
                adults,
                kids,
                total: totalGuests,
            },

            packageSnapshot: {
                id: pkg.id,
                name: pkg.name,
                pricePerPerson: pkg.pricePerPerson,
                starterCount: pkg.starterCount,
                mainCount: pkg.mainCount,
                dessertCount:pkg.dessertCount,
                durationMinutes: pkg.durationMinutes,
            },

            foodSnapshot: {
                starters: selectedStarters,
                mains: selectedMains,
                Desserts: selectedDesserts,
                addOns:selectedAddons
            },

            pricingSnapshot: {
                baseAmount: basePrice,
                extrasAmount:
                    startersExtraCost + mainsExtraCost + addonsTotal + extraDessertsCost,
                totalAmount: total,
                breakdown: {
                    startersExtraCost,
                    mainsExtraCost,
                    extraDessertsCost,
                    addonsTotal,
                },
            },
        }

        try {
            const initiatePayment = await fetch("/api/icici/minymoe/partybooking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingPayload),
            })

            const data = await initiatePayment.json()

            if (data?.status === 200 && data?.url) {
                router.push(data.url)
                return // do NOT reset isPaying (user leaves page)
            } else {
                toast.error(data?.message || "Something went wrong")
            }
        } catch {
            toast.error("Payment initiation failed")
        } finally {
            setIsPaying(false)
        }
    }

    const [date, setDate] = useState<Date>()
    const [startTime, setStartTime] = useState<string | null>(null)
    const freeStarters = pkg.starterCount
    const freeMains = pkg.mainCount
    const freeDesserts = pkg.dessertCount

    const extraStarters = Math.max(0, selectedStarters.length - freeStarters)
    const extraMains = Math.max(0, selectedMains.length - freeMains)
    const extraDesserts = Math.max(0, selectedDesserts.length - freeDesserts)

    const startersExtraCost =
        extraStarters * pkg.starterAddonPrice * (kids + adults)

    const mainsExtraCost =
        extraMains * pkg.mainAddonPrice * (kids + adults)
    
    const extraDessertsCost = 
        extraDesserts * pkg.dessertAddonPrice * (kids + adults)

    const basePrice = totalGuests * pkg.pricePerPerson

    const total =
        basePrice +
        startersExtraCost +
        mainsExtraCost
        + extraDessertsCost
        + addonsTotal


    const canProceed =
        selectedStarters.length >= freeStarters &&
        selectedMains.length >= freeMains && (adults + kids) >= 30 && date && startTime

    const WarningType = () => {
        if (!(selectedStarters.length >= freeStarters) || !(selectedMains.length >= freeMains)) {
            return `Please select at least ${freeStarters} starters and ${freeMains} mains to continue.`
        }
        else if ((adults + kids) < 30) {
            return "A minimum total headcount of 30 guests is required to proceed with the booking."
        } else if (!date || !startTime) {
            return "Please select date and time"
        }
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <div className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">

                {/* LEFT SIDE */}
                <div className="space-y-8">

                    <Button variant="ghost" onClick={onBack}>
                        ← Back
                    </Button>


                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Customize Your Party
                        </h1>
                        <p className="text-muted-foreground">
                            Select food, addons and finalize your booking
                        </p>
                    </div>

                    {/* Date & Time Placeholder (we’ll plug your component here in Part 2) */}
                    <MinyMoePartyDateAndTimeSelector
                        date={date}
                        startTime={startTime}
                        duration={pkg.durationMinutes / 60}
                        minDuration={pkg.durationMinutes / 60}
                        maxDuration={pkg.durationMinutes / 60}
                        onDateChange={setDate}
                        onStartTimeChange={setStartTime}
                        onDurationChange={() => { }}
                    />


                    {/* Food Selection */}
                    <Card className="p-6 rounded-2xl">
                        <Tabs defaultValue="starters" className="w-full">
                            <TabsList className="grid grid-cols-4 mb-6">
                                <TabsTrigger value="starters">Starters</TabsTrigger>
                                <TabsTrigger value="mains">Mains</TabsTrigger>
                                <TabsTrigger value="desserts">Desserts</TabsTrigger>
                                <TabsTrigger value="addons">Add-ons</TabsTrigger>
                            </TabsList>

                            {/* Starters */}
                            <TabsContent value="starters">
                                <SectionHeader
                                    title="Starters"
                                    subtitle={`Choose at least ${pkg.starterCount}`}
                                />

                                <ScrollableGrid
                                    items={pkg.starterItems}
                                    selected={selectedStarters}
                                    onToggle={(item) => toggleItem(item, setSelectedStarters)}
                                />
                            </TabsContent>



                            {/* Mains */}
                            <TabsContent value="mains">
                                <SectionHeader
                                    title="Mains"
                                    subtitle={`Choose at least ${pkg.mainCount}`}
                                />

                                <ScrollableGrid
                                    items={pkg.mainItems}
                                    selected={selectedMains}
                                    onToggle={(item) => toggleItem(item, setSelectedMains)}
                                />
                            </TabsContent>



                            {/* Add-ons */}
                            <TabsContent value="addons">
                                <SectionHeader
                                    title="Add-ons"
                                    subtitle="Paid extras"
                                />

                                <ScrollArea className="h-[420px] pr-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {pkg.AddonItems.map((item: AddonItem) => {
                                            const isSelected = selectedAddons.some(
                                                (a) => a.item === item.item
                                            )

                                            return (
                                                <FoodCard
                                                    key={item.item}
                                                    name={item.item}
                                                    selected={isSelected}
                                                    onToggle={() => toggleAddon(item)}
                                                    priceLabel={`₹${item.price.toLocaleString()}`}
                                                />
                                            )
                                        })}
                                    </div>
                                </ScrollArea>
                            </TabsContent>


                            {/* Desserts*/}
                            <TabsContent value="desserts">
                                <SectionHeader
                                    title="Desserts"
                                    subtitle={`Choose at least ${pkg.dessertCount}`}
                                />

                                <ScrollableGrid
                                    items={pkg.dessertItems}   // ✅ string[]
                                    selected={selectedDesserts}
                                    onToggle={(item) => toggleItem(item, setselectedDesserts)}
                                    showPrice={`₹${pkg.dessertAddonPrice} / head`}
                                />
                            </TabsContent>


                        </Tabs>
                    </Card>

                    <Card className="p-6 rounded-2xl">
                        <h3 className="font-medium mb-4">Guests</h3>

                        <div className="flex justify-between">
                            <div>
                                <p className="font-medium">Adults</p>
                                <p className="text-sm text-muted-foreground">Age 10+</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button size="icon" variant="outline" onClick={() => setAdults(Math.max(0, adults - 1))}>−</Button>
                                <span className="w-6 text-center">{adults}</span>
                                <Button size="icon" variant="outline" onClick={() => {
                                    if ((adults + kids) < 100) {
                                        setAdults(adults + 1)
                                    } else {
                                        toast.info("The total capacity cannot be greater than 100")
                                    }
                                }}>+</Button>
                            </div>
                        </div>

                        <div className="flex justify-between mt-4">
                            <div>
                                <p className="font-medium">Kids</p>
                                <p className="text-sm text-muted-foreground">Below 10</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button size="icon" variant="outline" onClick={() => setKids(Math.max(0, kids - 1))}>−</Button>
                                <span className="w-6 text-center">{kids}</span>
                                <Button size="icon" variant="outline" onClick={() => {
                                    if ((adults + kids) < 100) {
                                        setKids(kids + 1)
                                    } else {
                                        toast.info("The total capacity cannot be greater than 100")
                                    }
                                }}>+</Button>
                            </div>
                        </div>
                    </Card>


                    {/* Policies Placeholder */}
                    {/* Important Information */}
                    <Card className="p-6 rounded-2xl space-y-4 bg-muted/30 border">
                        <h3 className="text-sm font-semibold uppercase tracking-wide">
                            Important Information
                        </h3>

                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                                Food and beverages are permitted to be consumed only within the designated café area.
                            </li>

                            <li className="flex gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                                All bookings are confirmed only upon receipt of the required advance payment.
                            </li>

                            <li className="flex gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                                A minimum advance payment of ₹10,000 is mandatory to secure the booking.
                            </li>

                            <li className="flex gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                                The booking advance is strictly non-refundable under any circumstances.
                            </li>

                            <li className="flex gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                                Final charges will be calculated based on the confirmed headcount.
                            </li>

                            <li className="flex gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                                A minimum total headcount of 30 guests is required to proceed with the booking.
                            </li>
                        </ul>
                    </Card>

                </div>

                {/* RIGHT SIDE — SUMMARY (Shell only, real content in Part 3) */}
                <div className="relative">
                    <div className="sticky top-24">
                        <Card className="p-6 rounded-2xl space-y-6 shadow-xl bg-background">

                            {/* Header */}
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Booking Summary
                                </p>
                                <h2 className="text-xl font-semibold">{pkg.name}</h2>
                            </div>

                            {/* Guest & Menu Info */}
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Guests</span>
                                    <span className="font-medium">{totalGuests}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Starters</span>
                                    <span className="font-medium">
                                        {selectedStarters.length}/{freeStarters}
                                        {extraStarters > 0 && (
                                            <span className="text-muted-foreground">
                                                {" "} (+{extraStarters})
                                            </span>
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Mains</span>
                                    <span className="font-medium">
                                        {selectedMains.length}/{freeMains}
                                        {extraMains > 0 && (
                                            <span className="text-muted-foreground">
                                                {" "} (+{extraMains})
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="h-px bg-border" />

                            {/* Pricing */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Base Price</span>
                                    <span>₹{basePrice.toLocaleString()}</span>
                                </div>

                                {extraStarters > 0 && (
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Extra Starters</span>
                                        <span>₹{startersExtraCost.toLocaleString()}</span>
                                    </div>
                                )}

                                {extraMains > 0 && (
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Extra Mains</span>
                                        <span>₹{mainsExtraCost.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            {/* Desserts*/}
                            {selectedDesserts.length > 0 && (
                                <>
                                    <div className="h-px bg-border" />
                                    <div className="space-y-2 text-sm">
                                        <p className="font-medium">Add-ons</p>

                                        {selectedDesserts.map((item) => (
                                            <div
                                                key={item}
                                                className="flex justify-between text-muted-foreground"
                                            >
                                                <span>{item}</span>
                                                <span>
                                                    ₹{(pkg.dessertAddonPrice * totalGuests).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            {/* Add On*/}
                            {selectedAddons.length > 0 && (
                                <>
                                    <div className="h-px bg-border" />
                                    <div className="space-y-2 text-sm">
                                        <p className="font-medium">Add-ons</p>

                                        {selectedAddons.map((item) => (
                                            <div
                                                key={item.item}
                                                className="flex justify-between text-muted-foreground"
                                            >
                                                <span>{item.item}</span>
                                                <span>₹{item.price.toLocaleString()}</span>
                                            </div>
                                        ))}

                                    </div>
                                </>
                            )}




                            <div className="h-px bg-border" />

                            {/* Total */}
                            <div className="flex justify-between text-lg font-semibold">
                                <span>Total Amount</span>
                                <span>₹{total.toLocaleString()}</span>
                            </div>

                            {/* Validation */}
                            {!canProceed && (
                                <div className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg">
                                    {WarningType()}
                                </div>
                            )}

                            {/* Payment Options */}
                            <div className="space-y-3">
                                <p className="text-sm font-medium">Payment Options</p>

                                <Button
                                    size="lg"
                                    variant="outline"
                                    disabled={!canProceed || isPaying}
                                    className="w-full rounded-xl h-12 text-base"
                                    onClick={() => handlePrepareBooking("ADVANCE")}
                                >
                                    {isPaying ? "Redirecting…" : "Pay ₹10,000 Advance"}
                                </Button>

                                <Button
                                    size="lg"
                                    disabled={!canProceed || isPaying}
                                    className="w-full rounded-xl h-12 text-base"
                                    onClick={() => handlePrepareBooking("FULL")}
                                >
                                    {isPaying ? "Redirecting…" : `Pay Full ₹${total.toLocaleString()}`}
                                </Button>


                                <p className="text-xs text-muted-foreground text-center">
                                    Remaining amount (if any) can be paid before the event.
                                </p>
                            </div>

                        </Card>
                    </div>
                </div>


            </div>
        </div>
    )
}


function SectionHeader({
    title,
    subtitle,
}: {
    title: string
    subtitle: string
}) {
    return (
        <div className="mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
    )
}


function ScrollableGrid({
    items,
    selected,
    onToggle,
    showPrice,
}: {
    items: string[]
    selected: string[]
    onToggle: (item: string) => void
    showPrice?: string
}) {
    return (
        <ScrollArea className="h-[420px] pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item) => (
                    <FoodCard
                        key={item}
                        name={item}
                        selected={selected.includes(item)}
                        onToggle={() => onToggle(item)}
                    // priceLabel={showPrice}
                    />
                ))}
            </div>
        </ScrollArea>
    )
}



export function FoodCard({
    name,
    selected,
    onToggle,
    priceLabel,
}: FoodCardProps) {
    return (
        <div
            onClick={onToggle}
            className={cn(
                "relative cursor-pointer rounded-xl border p-4 transition-all duration-200",
                "hover:shadow-md hover:border-primary/40",
                "hover:scale-[1.01] active:scale-[0.99]",
                selected
                    ? "border-primary bg-primary/5 shadow-md"
                    : "bg-background"
            )}
        >
            <div className="flex items-start gap-3">
                <Checkbox checked={selected} />
                <div className="flex-1">
                    <p className="font-medium leading-tight">{name}</p>
                </div>
            </div>

            {selected && (
                <div className="absolute top-3 right-3 text-primary">
                    <Check className="h-4 w-4" />
                </div>
            )}
            {priceLabel && (
                <p className="text-xs text-muted-foreground mt-1">
                    {priceLabel}
                </p>
            )}

        </div>
    )
}

