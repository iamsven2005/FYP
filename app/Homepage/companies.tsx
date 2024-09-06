"use server"

import { db } from "@/lib/db";
interface Props{
    user: string
}
const Company = async({user}: Props) => {
    const list = await db.company.findMany({
        where:{
            staff: user
        }
    })
    return ( 
        <div>
            
        </div>
     );
}
 
export default Company;