export const runtime = "nodejs";

import { generateAndAssignInvoice } from "@/lib/invoice";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Booking_Prefix } from "@/lib/Booking_Prefix";

const calculatePoints = (amount: number) => {
    const gstAmount = amount * 0.18;
    const amountWithoutGST = amount - gstAmount;
    const points = amountWithoutGST * 0.05;
    return Math.round(points);
};

export async function POST(request: NextRequest) {

    try {
        const body = await request.json();
        const { merchantTxnNo, transactionId, responseMessage, rawResponse, isSuccess, amount, paymentMode, responseCode } = body;
    
        if (isSuccess) {
            const payment = await prisma.payment.update({
                where: { merchantTxnNo },
                data: {
                    transactionId,
                    responseMessage,
                    rawResponse,
                    status: "SUCCESS",
                    amount: amount,
                    transaction_method: paymentMode,
                    responseCode
                }
            });
    
            const paymentwithInvoice = await generateAndAssignInvoice(payment.id);
            if (!paymentwithInvoice.invoiceNumber) {
                await generateAndAssignInvoice(payment.id)
            }

            if (payment.bookingId) {
                const booking = await prisma.booking.update({
                    where: { id: payment.bookingId },
                    data: {
                        status: 'CONFIRMED',
                    }
                });

                await prisma.booking.update({
                    where:{bookingId:booking.id},
                    data:{
                        points_earned: calculatePoints(amount-booking.cafeSubtotal!),
                        bookingId:`${Booking_Prefix.eenimeeni}${booking.bookingNumber}`
                    }
                })

                const user = await prisma.user.findUnique({
                    where: { id: booking.userId }
                });
    
                await prisma.user.update({
                    where: { id: user?.id },
                    data: {
                        loyaltyPoints: (user?.loyaltyPoints! - booking.points_spent!) + calculatePoints(amount)
                    }
                })
            }else if(payment.workShopBookingId){
                const workShop = await prisma.workShopBooking.update({
                    where:{id:payment.workShopBookingId},
                    data:{
                        status:"CONFIRMED",
                    }
                });
                await prisma.workShopBooking.update({
                    where:{id:workShop.id},
                    data:{
                        bookingId:`${Booking_Prefix.workshop}${workShop.bookingNumber}`
                    }
                })
    
            }
        }
        else {
            const payment = await prisma.payment.update({
                where: { merchantTxnNo },
                data: {
                    transactionId,
                    responseMessage,
                    rawResponse,
                    status: "FAILED",
                    amount: amount,
                    responseCode
                }
            });
            if(payment.bookingId){
                await prisma.booking.update({
                where: { id: payment.bookingId },
                data: {
                    status: "CANCELLED",
                    points_earned: 0,
                    points_spent: 0,
                }
            });
            } else if(payment.workShopBookingId){
                await prisma.workShopBooking.update({
                    where:{id:payment.workShopBookingId},
                    data:{
                        status:"CANCELLED"
                    }
                })
            }
        }
        return NextResponse.json({ status: 200, message: 'Tables Updated SuccessFully' })
    } catch (error) {
        console.log(`Error Occured in the updation of tables route ${error}`)
        return NextResponse.json({status:501, message:'Internal Server Error Occurred'})
    }
}