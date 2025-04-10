export default function IngredientSearchBar({ 
    value, 
    onChange, 
    placeholder = "Search...", 
    icon,
    className = ""
  }) {
    return (
      <div className={`relative ${className}`}>
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm py-2 ${
            icon ? 'pl-10' : 'pl-3'
          }`}
          placeholder={placeholder}
        />
        {value && (
          <button
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => onChange('')}
          >
            <span className="text-gray-400 hover:text-gray-500">×</span>
          </button>
        )}
      </div>
    );
  }