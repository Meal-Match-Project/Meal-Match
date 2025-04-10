export default function ComponentTabs({ activeTab, onTabChange }) {
  return (
    <div className="flex border-b">
      <button 
        className={`flex-1 py-2 px-4 text-center ${activeTab === 'thisWeek' ? 'bg-orange-100 text-orange-600 font-bold' : 'bg-white'}`}
        onClick={() => onTabChange('thisWeek')}
      >
        This Week
      </button>
      <button 
        className={`flex-1 py-2 px-4 text-center ${activeTab === 'all' ? 'bg-orange-100 text-orange-600 font-bold' : 'bg-white'}`}
        onClick={() => onTabChange('all')}
      >
        All Components
      </button>
    </div>
  );
}