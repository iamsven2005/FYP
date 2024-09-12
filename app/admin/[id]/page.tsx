import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

interface Props {
  params: {
    id: string;
  };
}

const Page = async ({ params }: Props) => {
  const items = await db.images.findMany({
    where: {
      companyId: params.id,
    },
  });
  return (
    <div>
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent>
            <img src={item.imageurl} className="w-full p-5 rounded-lg" />
            <CardTitle>{item.name}</CardTitle>
            <CardDescription>{item.retrived}</CardDescription>
            <CardFooter>{item.status}</CardFooter> {/* Changed from approved to status */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Page;
