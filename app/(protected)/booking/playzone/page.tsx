import { PlayzoneBooking } from "./Playzone"
import {auth} from "@/auth"
import {prisma} from "@/lib/prisma"
//This is The PlayZone Component

const Page = async()=> {
    const session = await auth();

    let userWithChildren = null

    if(session?.user.id){
        userWithChildren = await prisma.user.findUnique({
            where:{id:session.user.id},
            include:{children:true}
        })
    }
    return(
        <PlayzoneBooking initialUserData={userWithChildren}/>
    )
}

export default Page;