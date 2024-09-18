import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(res: NextResponse, {params }:{params:{id: string}}){
    try{
        const messages  = await db.notification.findMany({
            where:{
                user_to: params.id
            }
        })
        return NextResponse.json(messages, { status: 200 });

    }catch(error){
        console.log(error)
        return NextResponse.json({ message: error }, { status: 500 });
    }
}

export async function POST(res: NextResponse, {params}:{params:{id: string}}){
    try{
        const messages  = await db.notification.update({
            where:{
                id: params.id
            },data:{
                read: "Read"
            }
        })
        return NextResponse.json(messages, { status: 200 });

    }catch(error){
        console.log(error)
        return NextResponse.json({ message: error }, { status: 500 });
    }
}