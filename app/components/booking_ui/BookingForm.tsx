"use client"
import { DateTimeSelector } from "./DateSelector"
import { BookingDetailsCompact } from "./BookingDetails"
import ChildrenSelector from "./ChildrenSelector"
import { BookingSummaryCompact } from "./BookingSummary"
import { useBooking } from "./useBooking"
import RedeemPoints from "./RedeemPoints"
import BookingDisclaimers from "./BookingDisclaimers"
import CafeSelector from "./CafeSelector"

interface BookingFormProps {
    initialUserData: any
}

export default function BookingForm({ initialUserData }: BookingFormProps) {
    const booking = useBooking()
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
                        Eeni Meeni Playzone Booking
                    </h1>
                    <p className="text-muted-foreground">Book your play session</p>
                </div>

                {/* Two Column Layout */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        <DateTimeSelector
                            date={booking.date}
                            selectedTime={booking.selectedTime}
                            onDateChange={booking.setDate}
                            onTimeChange={booking.handleTimeChange}
                        />

                        <ChildrenSelector
                            selectedChildrenIds={booking.selectedChildrenIds}
                            onSelectionChange={booking.handleChildrenSelection}
                            initialUserData={initialUserData}
                        />

                        <BookingDetailsCompact
                            duration={booking.duration}
                            children={booking.children}
                            companions={booking.companions}
                            maxDuration={booking.maxDuration}
                            selectedTime={booking.selectedTime}
                            endTime={booking.endTime}
                            onDurationChange={booking.setDuration}
                            onChildrenChange={booking.setChildren}
                            onCompanionsChange={booking.setCompanions}
                        />

                        <CafeSelector
                            beverages={booking.beverages}
                            menuItems={booking.menuItems}
                            selectedCafeItems={booking.selectedCafeItems}
                            updateCafeItem={booking.updateCafeItem}
                            subtotal={booking.cafeSubtotal}
                        />

                        <RedeemPoints
                            CurrentPoints={initialUserData.loyaltyPoints}
                            maxRedeemablePoints={booking.maxRedeemablePoints}
                            redeemPoints={booking.redeemPoints}
                            setredeemPoints={booking.setredeemPoints}
                        />



                        <BookingDisclaimers
                            accepted={booking.acceptedDisclaimers}
                            onChange={booking.setAcceptedDisclaimers}
                        />

                    </div>

                    {/* Right Column - Summary (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-6">
                            <BookingSummaryCompact
                                date={booking.date}
                                selectedTime={booking.selectedTime}
                                endTime={booking.endTime}
                                duration={booking.duration}
                                children={booking.children}
                                companions={booking.companions}
                                subtotal={booking.subtotal}
                                redeemPoints={booking.redeemPoints}
                                total={booking.total}
                                isValid={booking.isValid}
                                selectedChildrenDetails={booking.selectedChildrenDetails}
                                handlePayment={booking.handlePayment}
                                isLoading={booking.isLoading}
                                cafeSubtotal={booking.cafeSubtotal}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}