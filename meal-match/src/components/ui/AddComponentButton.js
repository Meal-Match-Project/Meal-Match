import { Plus } from 'lucide-react';

export default function AddComponentButton({ onClick }) {
  return (
    <div className="p-3 border-t">
      <button 
        onClick={onClick}
        className="w-full py-2 flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white rounded-md transition"
      >
        <Plus size={16} className="mr-1" />
        Add Component
      </button>
    </div>
  );
}