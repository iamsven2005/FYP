import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

interface Props{
params:{
  id: string
}
}

const Page = async({params}: Props) => {
  const items = await db.images.findMany({
    where:{
      companyId: params.id
    }
  })
  return ( 
    <div>
      {items.map((items)=>(
        <Card key={items.id}>
          <CardContent>

            <img src={items.imageurl} className="w-full p-5 rounded-lg"/>
            <CardTitle>
              {items.name}
            </CardTitle>
            <CardDescription>
              {items.retrived}
            </CardDescription>
            <CardFooter>
              {items.approved}
            </CardFooter>
          </CardContent>
        </Card>
      ))}
    </div>
   );
}
 
export default Page;