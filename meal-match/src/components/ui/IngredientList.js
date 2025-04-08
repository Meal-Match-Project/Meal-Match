import IngredientItem from './IngredientItem';

export default function IngredientList({ 
  ingredients, 
  activeTab, 
  onItemClick, 
  onPurchase, 
  onOutOfStock, 
  onAddToList, 
  onDelete 
}) {
  return (
    <div className="divide-y">
      {ingredients.map((ingredient) => (
        <IngredientItem
          key={ingredient._id || ingredient.name}
          ingredient={ingredient}
          activeTab={activeTab}
          onClick={() => onItemClick(ingredient)}
          onPurchase={() => onPurchase(ingredient)}
          onOutOfStock={() => onOutOfStock(ingredient)}
          onAddToList={() => onAddToList(ingredient)}
          onDelete={() => onDelete(ingredient._id)}
        />
      ))}
    </div>
  );
}