'use client';

import { TaskList } from '@/types';
import { useStore } from '@/store/useStore';
import TaskCard from './TaskCard';
import { Plus, Folder, Eye, EyeOff, LayoutGrid, List } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';

interface TaskViewProps {
  list: TaskList;
}

const COLORS = ['yellow', 'pink', 'blue', 'green', 'purple', 'orange'];

export default function TaskView({ list }: TaskViewProps) {
  const { tasks, addTask, updateList, groups } = useStore();
  const [newTaskId, setNewTaskId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { setNodeRef, isOver } = useDroppable({
    id: `list-${list.id}`,
  });

  const listTasks = tasks
    .filter((task) => task.listId === list.id)
    .filter((task) => showCompleted || !task.completed)
    .sort((a, b) => a.position - b.position);

  useEffect(() => {
    if (newTaskId) {
      const timer = setTimeout(() => setNewTaskId(null), 100);
      return () => clearTimeout(timer);
    }
  }, [newTaskId]);

  const handleAddTask = () => {
    const tempId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setNewTaskId(tempId);
    addTask({
      title: '',
      completed: false,
      listId: list.id,
      color: 'sky',
    });
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value || undefined;
    updateList(list.id, { groupId });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-8 py-6">
        <div className="flex items-center justify-between mb-3">
          <input
            type="text"
            value={list.name}
            onChange={(e) => updateList(list.id, { name: e.target.value })}
            className="text-3xl font-bold text-gray-800 bg-transparent border-none outline-none"
            placeholder="List name..."
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={showCompleted ? 'Hide completed tasks' : 'Show completed tasks'}
            >
              {showCompleted ? (
                <><EyeOff className="w-4 h-4" /><span className="text-sm">Hide Done</span></>
              ) : (
                <><Eye className="w-4 h-4" /><span className="text-sm">Show Done</span></>
              )}
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Toggle View"
            >
              {viewMode === 'grid' ? (
                <><List className="w-4 h-4" /><span className="text-sm">List View</span></>
              ) : (
                <><LayoutGrid className="w-4 h-4" /><span className="text-sm">Grid View</span></>
              )}
            </button>
            <button
              onClick={handleAddTask}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Task
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-gray-400" />
          <select
            value={list.groupId || ''}
            onChange={handleGroupChange}
            className="text-sm text-gray-600 bg-transparent border border-gray-300 rounded-full px-3 py-1 outline-none focus:border-blue-500"
          >
            <option value="">Uncategorized</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div ref={setNodeRef} className={`flex-1 overflow-y-auto p-8 transition-colors ${
        isOver ? 'bg-blue-50' : ''
      }`}>
        {listTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No tasks yet</p>
            <button
              onClick={handleAddTask}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add your first task
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'flex flex-col gap-2'
          }>
            {listTasks.map((task, index) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                autoFocus={index === listTasks.length - 1 && task.title === ''}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
