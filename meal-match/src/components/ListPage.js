'use client';

import { useState } from 'react';
import ComponentModal from '@/app/components/modals/ComponentModal';
import DatePickerModal from '@/app/components/modals/DatePickerModal';

export default function ListPage({ pageTitle, items, renderRightSide }) {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">{pageTitle}</h1>
      {Object.keys(items).map((category) => (
        <div key={category} className="mb-6">
          <h2 className="text-lg font-semibold bg-blue-100 p-2">
            {category === 'thisWeek' ? 'THIS WEEK' : 'SAVED'}
          </h2>
          <div className="bg-white shadow-md rounded-md">
            {items[category].map((item) => (
              <div key={item.name} className="flex justify-between p-2 border-b last:border-none">
                <span>{item.name}</span>
                {renderRightSide(item)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}