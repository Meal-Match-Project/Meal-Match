import { useState } from 'react';

export default function useTabs(initialTab = 'thisWeek') {
  const [activeTab, setActiveTab] = useState(initialTab);

  const isThisWeekActive = activeTab === 'thisWeek';
  const isAllActive = activeTab === 'all';

  const switchToThisWeek = () => setActiveTab('thisWeek');
  const switchToAll = () => setActiveTab('all');

  return {
    activeTab,
    setActiveTab,
    isThisWeekActive,
    isAllActive,
    switchToThisWeek,
    switchToAll
  };
}