import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import IngredientList from "@/components/IngredientList"; // Import IngredientList
import { Badge } from "@/components/ui/badge";

interface Props {
  params: {
    id: string;
  };
}

interface IngredientStatus {
  name: string;
  status: "Approved" | "Not Approved" | "Not Safe";
}

interface Image {
  id: string;
  imageurl: string;
  name: string;
  retrived: string;
  AI: string;
  status: string;
  ingredients: IngredientStatus[] | null; // Adjusted to include ingredient statuses
}

export default async function Page({ params }: Props) {
  try {
    const images = (await db.images.findMany({
      where: {
        companyId: params.id,
      },
      select: {
        id: true,
        imageurl: true,
        name: true,
        retrived: true,
        AI: true,
        status: true,
        ingredients: true, // Include ingredients in the query
      },
    })) as Image[];

    return (
      <div className="container mx-auto py-8">
        {images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <img src={image.imageurl} alt={image.name} className="w-full h-48 object-cover" />
                  <div className="p-4 space-y-2">
                    <CardTitle className="text-lg font-semibold">{image.name}</CardTitle>
                    <CardDescription>
                      <span className="font-medium">Retrieved:</span> {image.retrived}
                    </CardDescription>
                    <CardDescription>
                      <span className="font-medium">AI Advisory:</span> {image.AI}
                    </CardDescription>
                    {/* Display Ingredients with Highlights */}
                    {image.ingredients && image.ingredients.length > 0 ? (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Ingredients:</h4>
                        <IngredientList ingredients={image.ingredients} />
                      </div>
                    ) : (
                      <p className="text-gray-500">No ingredients available.</p>
                    )}
                    <CardDescription>
                      <span className="font-medium">Status:</span> <Badge> {image.status} </Badge>
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No images found.</p>
        )}
      </div>
    );
  } catch (error) {
    return <p className="text-center text-red-500">Failed to load images.</p>;
  }
}
