import React from 'react';

interface IngredientStatus {
  name: string;
  status: 'Approved' | 'Not Approved' | 'Not Safe';
}

interface IngredientListProps {
  ingredients: IngredientStatus[];
}

interface GroupedIngredients {
  Approved: IngredientStatus[];
  'Not Approved': IngredientStatus[];
  'Not Safe': IngredientStatus[];
}

const IngredientList: React.FC<IngredientListProps> = ({ ingredients }) => {
  // Log the ingredients being passed
  console.log('Rendering ingredients in IngredientList:', ingredients);

  // Function to return the appropriate CSS class based on ingredient status
  const getIngredientClass = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'text-green-600'; // Green for Approved ingredients
      case 'Not Approved':
        return 'text-yellow-600'; // Yellow for Not Approved ingredients
      case 'Not Safe':
        return 'text-red-600 font-bold'; // Red and bold for Not Safe ingredients
      default:
        return '';
    }
  };

  // Render a fallback message if the ingredients array is empty or null
  if (!ingredients || ingredients.length === 0) {
    console.log('No ingredients available.');
    return <p>Loading ...</p>;
  }

  // Group ingredients by their status
  const groupedIngredients: GroupedIngredients = ingredients.reduce(
    (groups: GroupedIngredients, ingredient: IngredientStatus) => {
      groups[ingredient.status].push(ingredient);
      return groups;
    },
    { Approved: [], 'Not Approved': [], 'Not Safe': [] }
  );

  // Format the ingredient name to capitalize the first letter of each word and remove unnecessary brackets
  const formatIngredientName = (name: string) => {
    // Remove content within square brackets or parentheses, including the brackets/parentheses themselves
    const cleanedName = name.replace(/\[.*?\]|\(.*?\)/g, '').replace(/[\[\]()]/g, '').trim();

    // Capitalize the first letter of each word
    return cleanedName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div>
      {Object.keys(groupedIngredients).map((status) => (
        <div key={status} className="mb-4">
          <h3 className="font-bold mt-4">
            {status} ({groupedIngredients[status as keyof GroupedIngredients].length})
          </h3>
          <ul className="list-disc pl-5">
            {groupedIngredients[status as keyof GroupedIngredients].map((ingredient: IngredientStatus, index: number) => (
              <li key={index} className={getIngredientClass(ingredient.status)}>
                {formatIngredientName(ingredient.name)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default IngredientList;