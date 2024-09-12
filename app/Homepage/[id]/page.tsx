import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

interface Props {
  params: {
    id: string;
  };
}

const Page = async ({ params }: Props) => {
  const images = await db.images.findMany({
    where: {
      companyId: params.id,
    },
  });

  return (
    <div>
      {images.length > 0 ? (
        images.map((image) => (
          <Card key={image.id}>
            <CardContent>
            <img src={image.imageurl} />
            <CardTitle>
            {image.name}
            </CardTitle>
            <CardDescription>
            Retrived: {image.retrived}
            </CardDescription>
            <CardDescription>
            AI Advisory: {image.AI}
            </CardDescription>
            <CardDescription>
            Status: {image.status} {/* Show the status of the image */}
            </CardDescription>
            </CardContent>
          </Card>
        ))
      ) : (
        <p>No images found.</p>
      )}
    </div>
  );
};

export default Page;
