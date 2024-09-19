import React from 'react';

interface IngredientStatus {
  name: string;
  status: 'Approved' | 'Not Approved' | 'Not Safe';
}

interface IngredientListProps {
  ingredients: IngredientStatus[];
}

const IngredientList: React.FC<IngredientListProps> = ({ ingredients }) => {
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
    return <p>No ingredients available.</p>;
  }

  return (
    <ul className="list-disc pl-5">
      {ingredients.map((ingredient, index) => (
        <li key={index} className={getIngredientClass(ingredient.status)}>
          {ingredient.name} <span>({ingredient.status})</span>
        </li>
      ))}
    </ul>
  );
};

export default IngredientList;
