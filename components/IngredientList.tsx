import React from 'react';

interface IngredientStatus {
  name: string;
  status: 'Approved' | 'Not Approved' | 'Not Safe';
}

interface IngredientListProps {
  ingredients: IngredientStatus[];
}

const IngredientList: React.FC<IngredientListProps> = ({ ingredients }) => {
  const getIngredientClass = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'text-green-600';
      case 'Not Approved':
        return 'text-yellow-600';
      case 'Not Safe':
        return 'text-red-600 font-bold';
      default:
        return '';
    }
  };

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
