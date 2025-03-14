'use client';

import { useDraggable } from '@dnd-kit/core';

export default function ComponentsSidebar({ componentNames, componentCounts }) {
  return (
    <div className="w-1/4 bg-orange-600 p-4">
      <h2 className="text-xl text-white font-bold mb-2">Components</h2>
      <div className="space-y-2">
        {componentNames.map((name, index) => (
          <DraggableComponent
            key={name}
            id={name}
            count={componentCounts[index]}
          />
        ))}
      </div>
    </div>
  );
}

function DraggableComponent({ id, count }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id });
  const isDepleted = count === 0;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-2 rounded shadow-md cursor-grab ${
        isDepleted ? 'bg-orange-300 cursor-not-allowed' : 'bg-white'
      }`}
    >
      <div className="flex justify-between items-center">
        <span>{id}</span>
        <span className="text-sm font-bold">{count}</span>
      </div>
    </div>
  );
}
