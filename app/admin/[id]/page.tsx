import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

// Import the IngredientList component
import IngredientList from '@/components/IngredientList';

// Import the Badge component
import { Badge } from "@/components/ui/badge";

// Define the IngredientStatus interface
interface IngredientStatus {
  name: string;
  status: 'Approved' | 'Not Approved' | 'Not Safe';
}

interface Props {
  params: {
    id: string;
  };
}

// Define the Item interface
interface Item {
  id: string;
  imageurl: string;
  name: string;
  retrived: string;
  status: string;
  ingredients: IngredientStatus[] | null; // Adjusted type to match expected structure
}

const Page = async ({ params }: Props) => {
  const itemsData = await db.images.findMany({
    where: {
      companyId: params.id,
    },
    select: {
      id: true,
      imageurl: true,
      name: true,
      retrived: true,
      status: true,
      ingredients: true, // Include the ingredients field
    },
  });

  // Map the itemsData to match the Item interface
  const items: Item[] = itemsData.map((item) => ({
    ...item,
    ingredients: item.ingredients as IngredientStatus[] | null, // Type assertion
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      {items.map((item) => (
        <Card key={item.id} className="mb-6">
          <CardContent>
            <img src={item.imageurl} alt={item.name} className="w-full p-5 rounded-lg" />
            <CardTitle className="text-2xl font-bold">{item.name}</CardTitle>
            <CardDescription className="mt-2">
              <strong>Extracted Text:</strong> {item.retrived}
            </CardDescription>

            {/* Display Ingredients with Highlights */}
            {item.ingredients && Array.isArray(item.ingredients) && item.ingredients.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Ingredients:</h4>
                <IngredientList ingredients={item.ingredients} />
              </div>
            )}

            <CardFooter className="mt-4">
              <Badge variant="outline">{item.status}</Badge>
            </CardFooter>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Page;
