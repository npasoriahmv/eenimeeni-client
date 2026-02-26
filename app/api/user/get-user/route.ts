import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId } = body;
    
        if (!userId) {
            return NextResponse.json({ error: 'UnAuthorized Request', status: 400 })
        }
    
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { children: true },
        });
    
        if(!user){
            return NextResponse.json({error:'User Not Found', status:400})
        }
        return NextResponse.json({message:'User Info fetched SuccessFully', status:200, user:user})
    } catch (error) {
        console.log(`Error Occurred in fetching User details ${error}`)
        return NextResponse.json({error:'Server Error Occurred', status:501})
    }
}