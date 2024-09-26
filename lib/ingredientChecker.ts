import ingredientsJson from '@/data/ingredients.json';

// Define the interface for the result status
interface IngredientStatus {
  name: string;
  status: 'Approved' | 'Not Approved' | 'Not Safe';
}

// Helper function to get the base URL
function getBaseUrl() {
  return process.env.BASE_URL || 'http://localhost:3000'; // Replace with your actual base URL
}

// Function to check the status of each ingredient (client-side or server-side)
export async function checkIngredients(ingredients: string[]): Promise<IngredientStatus[]> {
  // Build the full URL for the API request
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/approved-ingredients`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch approved ingredients');
  }
  
  const approvedIngredientsFromDb = (await response.json()).data.map((item: any) => item.name.toLowerCase());

  // Get the unsafe ingredients from the JSON file
  const unsafeIngredients = ingredientsJson.unsafeIngredients.map((item) => item.toLowerCase());

  // Check the status of each ingredient
  return ingredients.map((ingredient) => {
    const lowercasedIngredient = ingredient.toLowerCase();

    if (approvedIngredientsFromDb.includes(lowercasedIngredient)) {
      return { name: ingredient, status: 'Approved' }; // Return as Approved
    } else if (unsafeIngredients.includes(lowercasedIngredient)) {
      return { name: ingredient, status: 'Not Safe' }; // Return as Not Safe
    } else {
      return { name: ingredient, status: 'Not Approved' }; // Return as Not Approved
    }
  });
}
