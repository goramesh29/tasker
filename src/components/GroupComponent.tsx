'use client';

import { ListGroup } from '@/types';
import { useStore } from '@/store/useStore';
import ListComponent from './ListComponent';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface GroupComponentProps {
  group: ListGroup;
}

export default function GroupComponent({ group }: GroupComponentProps) {
  const { lists, addList, deleteGroup, updateGroup } = useStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const groupLists = lists
    .filter((list) => list.groupId === group.id)
    .sort((a, b) => a.position - b.position);

  const handleAddList = () => {
    addList({
      name: 'New List',
      groupId: group.id,
    });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <input
            type="text"
            value={group.name}
            onChange={(e) => updateGroup(group.id, { name: e.target.value })}
            className="bg-transparent border-none outline-none font-bold text-xl text-gray-800 flex-1"
            placeholder="Group name..."
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddList}
            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add List
          </button>
          <button
            onClick={() => deleteGroup(group.id)}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {group.description && !isCollapsed && (
        <textarea
          value={group.description}
          onChange={(e) => updateGroup(group.id, { description: e.target.value })}
          className="bg-transparent border-none outline-none w-full text-sm text-gray-600 mb-4 resize-none"
          placeholder="Group description..."
          rows={1}
        />
      )}

      {!isCollapsed && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {groupLists.map((list) => (
            <ListComponent key={list.id} list={list} />
          ))}
          {groupLists.length === 0 && (
            <div className="text-gray-400 text-sm italic py-8 text-center w-full">
              No lists in this group yet. Click "Add List" to create one.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
