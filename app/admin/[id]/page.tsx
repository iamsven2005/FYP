import { toast } from "sonner";  // Import the toast methods
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

interface Props {
  params: {
    id: string;
  };
}

const Page = async ({ params }: Props) => {
  try {
    const items = await db.images.findMany({
      where: {
        companyId: params.id,
      },
    });

    if (items.length > 0) {
      toast.success("Images loaded successfully!");
    } else {
      toast.error("No images found for this company.");
    }

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
  } catch (error) {
    toast.error("Failed to load images. Please try again later.");
    return <p>Error loading images</p>;
  }
};

export default Page;
