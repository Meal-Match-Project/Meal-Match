export default function ComponentList({ components, activeTab, onComponentClick }) {
  if (!components || components.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No components found. Add a new component to get started.
      </div>
    );
  }

  return (
    <div className="divide-y">
      {components.map((component) => (
        <div 
          key={component._id || component.name} 
          className="p-3 hover:bg-gray-50 cursor-pointer flex items-center"
          onClick={() => onComponentClick(component)}
        >
          <div className="flex-1">
            <div className="font-medium">{component.name}</div>
            {activeTab === 'thisWeek' && 
              <div className="text-sm text-gray-500">Servings: {component.servings}</div>
            }
            {activeTab === 'all' && component.servings === 0 && 
              <div className="text-xs text-orange-600">Saved for later</div>
            }
            {activeTab === 'all' && component.servings > 0 && 
              <div className="text-xs text-green-600">In use this week ({component.servings} servings)</div>
            }
          </div>
        </div>
      ))}
    </div>
  );
}