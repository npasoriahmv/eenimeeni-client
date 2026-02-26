import {prisma} from "@/lib/prisma"
import { getCurrentFinancialYear } from "./getCurrentFY"

export async function generateAndAssignInvoice(paymentId:string){
    const fy = getCurrentFinancialYear();
    console.log("This is the FY", fy)
    return await prisma.$transaction(async(tx)=>{
        let counter = await tx.invoiceCounter.findUnique({
            where:{financialYear:fy}
        });

        if(!counter){
            counter = await tx.invoiceCounter.create({
                data:{financialYear:fy, lastSerial:0}
            });
        }

        const updated = await tx.invoiceCounter.update({
            where:{financialYear:fy},
            data:{lastSerial:{increment:1}},
        });

        const serial = updated.lastSerial;
        const paddedSerial = String(serial).padStart(6,"0");
        const invoiceNumber = `LUMIRO/${fy}/${paddedSerial}`;

        const updatedPayment = await tx.payment.update({
            where:{id:paymentId},
            data:{
                invoiceFY:fy,
                invoiceSerial:serial,
                invoiceNumber,
            }
        });

        return updatedPayment
    });
}