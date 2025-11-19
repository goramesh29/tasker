'use client';

import { TaskList } from '@/types';
import { useStore } from '@/store/useStore';
import TaskCard from './TaskCard';
import { Plus, Trash2, MoreVertical } from 'lucide-react';
import { useState } from 'react';

interface ListComponentProps {
  list: TaskList;
}

const COLORS = ['yellow', 'pink', 'blue', 'green', 'purple', 'orange'];

export default function ListComponent({ list }: ListComponentProps) {
  const { tasks, addTask, deleteList, updateList } = useStore();
  const [isAddingTask, setIsAddingTask] = useState(false);
  
  const listTasks = tasks
    .filter((task) => task.listId === list.id)
    .sort((a, b) => a.position - b.position);

  const handleAddTask = () => {
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    addTask({
      title: '',
      completed: false,
      listId: list.id,
      color: randomColor,
    });
    setIsAddingTask(false);
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 min-w-[300px] max-w-[350px] shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          value={list.name}
          onChange={(e) => updateList(list.id, { name: e.target.value })}
          className="bg-transparent border-none outline-none font-bold text-lg text-gray-800 flex-1"
          placeholder="List name..."
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => deleteList(list.id)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {list.description && (
        <textarea
          value={list.description}
          onChange={(e) => updateList(list.id, { description: e.target.value })}
          className="bg-transparent border-none outline-none w-full text-sm text-gray-600 mb-3 resize-none"
          placeholder="List description..."
          rows={1}
        />
      )}

      <div className="space-y-3 mb-3 max-h-[600px] overflow-y-auto">
        {listTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      <button
        onClick={handleAddTask}
        className="w-full py-2 px-4 bg-white border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Task
      </button>
    </div>
  );
}
