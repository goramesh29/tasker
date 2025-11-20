'use client';

import { TaskList } from '@/types';
import { useStore } from '@/store/useStore';
import TaskCard from './TaskCard';
import { Plus, Folder, Eye, EyeOff, LayoutGrid, List, LogOut, User as UserIcon, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { User as FirebaseUser } from 'firebase/auth';

interface TaskViewProps {
  list: TaskList;
  user: FirebaseUser | null;
  onSignOut: () => void;
  onOpenMobileSidebar: () => void;
}

const COLORS = ['yellow', 'pink', 'blue', 'green', 'purple', 'orange'];

export default function TaskView({ list, user, onSignOut, onOpenMobileSidebar }: TaskViewProps) {
  const { tasks, addTask, updateList, groups } = useStore();
  const [newTaskId, setNewTaskId] = useState<string | null>(null);
  
  // Detect if mobile on mount
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [showCompleted, setShowCompleted] = useState(() => !isMobile);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => isMobile ? 'list' : 'grid');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: `list-${list.id}`,
  });

  // Update defaults when mobile state changes
  useEffect(() => {
    setShowCompleted(!isMobile);
    setViewMode(isMobile ? 'list' : 'grid');
  }, [isMobile]);

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
      <div className="border-b border-gray-200 bg-white px-4 md:px-8 py-4 md:py-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              onClick={onOpenMobileSidebar}
              className="md:hidden hover:bg-gray-100 rounded p-2 transition-colors flex-shrink-0"
              title="Open menu"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <input
              type="text"
              value={list.name}
              onChange={(e) => updateList(list.id, { name: e.target.value })}
              className="text-xl md:text-3xl font-bold text-gray-800 bg-transparent border-none outline-none min-w-0 flex-1"
              placeholder="List name..."
            />
          </div>
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={showCompleted ? 'Hide completed tasks' : 'Show completed tasks'}
            >
              {showCompleted ? (
                <><EyeOff className="w-4 h-4" /><span className="text-xs md:text-sm hidden sm:inline">Hide Done</span></>
              ) : (
                <><Eye className="w-4 h-4" /><span className="text-xs md:text-sm hidden sm:inline">Show Done</span></>
              )}
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Toggle View"
            >
              {viewMode === 'grid' ? (
                <><List className="w-4 h-4" /><span className="text-xs md:text-sm hidden sm:inline">List View</span></>
              ) : (
                <><LayoutGrid className="w-4 h-4" /><span className="text-xs md:text-sm hidden sm:inline">Grid View</span></>
              )}
            </button>
            <button
              onClick={handleAddTask}
              className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 md:w-5 h-4 md:h-5" />
              <span className="hidden sm:inline">Add Task</span>
            </button>
            <div className="relative ml-2">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
                title={user?.displayName || 'User'}
              >
                <UserIcon className="w-5 h-5" />
              </button>
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20 min-w-[200px]">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <UserIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{user?.displayName}</span>
                      </div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Folder className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={list.groupId || ''}
            onChange={handleGroupChange}
            className="text-xs md:text-sm text-gray-600 bg-transparent border border-gray-300 rounded-full px-2 md:px-3 py-1 outline-none focus:border-blue-500"
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

      <div ref={setNodeRef} className={`flex-1 overflow-y-auto p-4 md:p-8 transition-colors ${
        isOver ? 'bg-blue-50' : ''
      }`}>
        {listTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-base md:text-lg mb-4">No tasks yet</p>
            <button
              onClick={handleAddTask}
              className="px-4 md:px-6 py-2 md:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm md:text-base"
            >
              Add your first task
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4'
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
