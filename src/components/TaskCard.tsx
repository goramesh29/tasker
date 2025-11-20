'use client';

import { Task } from '@/types';
import { Circle, CheckCircle2, Trash2, Palette, Maximize2, ExternalLink, Calendar } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useEffect, useRef, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';

interface TaskCardProps {
  task: Task;
  autoFocus?: boolean;
  viewMode?: 'grid' | 'list';
  showListName?: boolean;
  onNavigateToList?: (listId: string) => void;
}

const COLORS = {
  white: 'bg-white hover:bg-gray-50',
  yellow: 'bg-yellow-50 hover:bg-yellow-100',
  pink: 'bg-pink-50 hover:bg-pink-100',
  blue: 'bg-blue-50 hover:bg-blue-100',
  green: 'bg-green-50 hover:bg-green-100',
  purple: 'bg-purple-50 hover:bg-purple-100',
  orange: 'bg-orange-50 hover:bg-orange-100',
  gray: 'bg-gray-100 hover:bg-gray-200',
};

export default function TaskCard({ task, autoFocus = false, viewMode = 'grid', showListName = false, onNavigateToList }: TaskCardProps) {
  const { toggleTaskComplete, updateTask, deleteTask, lists } = useStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showExpandedView, setShowExpandedView] = useState(false);
  const [colorPickerPosition, setColorPickerPosition] = useState({ top: 0, left: 0 });
  const [datePickerPosition, setDatePickerPosition] = useState({ top: 0, left: 0 });

  const cardHeight = viewMode === 'grid' ? '120px' : '70px';
  const lineClamp = viewMode === 'grid' ? 2 : 1;

  const colors = [
    { name: 'Gray', class: 'bg-gray-100', value: 'gray' },
    { name: 'White', class: 'bg-white', value: 'white' },
    { name: 'Sky Blue', class: 'bg-sky-100', value: 'sky' },
    { name: 'Yellow', class: 'bg-yellow-100', value: 'yellow' },
    { name: 'Pink', class: 'bg-pink-100', value: 'pink' },
    { name: 'Green', class: 'bg-green-100', value: 'green' },
    { name: 'Purple', class: 'bg-purple-100', value: 'purple' },
    { name: 'Orange', class: 'bg-orange-100', value: 'orange' },
  ];
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });
  
  const colorClass = task.color && task.color in COLORS 
    ? COLORS[task.color as keyof typeof COLORS] 
    : 'bg-blue-50 hover:bg-blue-100';

  const formatDueDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const isDueDatePast = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      // Delay focus slightly for mobile to ensure keyboard opens
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // For mobile devices, explicitly trigger keyboard
          if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            inputRef.current.click();
          }
        }
      }, 100);
    }
    // Auto-adjust height on mount and when title changes
    if (inputRef.current && viewMode === 'grid') {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 48) + 'px';
    }
  }, [autoFocus, task.title, viewMode]);

  useEffect(() => {
    if (showDatePicker && dateInputRef.current) {
      setTimeout(() => {
        dateInputRef.current?.focus();
        dateInputRef.current?.showPicker?.();
      }, 50);
    }
  }, [showDatePicker]);

  const style = transform && !isDragging ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <>
    <div
      ref={setNodeRef}
      style={{ ...style, height: cardHeight, overflow: 'hidden' }}
      {...listeners}
      {...attributes}
      className={`${task.completed ? 'bg-gray-200' : colorClass} rounded-2xl p-4 shadow-sm transition-all duration-200 group flex ${viewMode === 'list' ? 'flex-row items-center' : 'flex-col'} ${
        isDragging ? 'opacity-30' : 'cursor-grab hover:shadow-md active:cursor-grabbing'
      }`}
    >
      <div className="flex items-start justify-between gap-2 flex-1 min-w-0">
        <div className="flex-1 overflow-hidden min-w-0">
          <textarea
            ref={inputRef}
            value={task.title}
            onChange={(e) => updateTask(task.id, { title: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            onBlur={(e) => {
              // Reset scroll position when losing focus
              e.currentTarget.scrollTop = 0;
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus={autoFocus}
            inputMode="text"
            enterKeyHint="done"
            className={`bg-transparent border-none outline-none w-full font-normal cursor-text resize-none ${
              task.completed ? 'line-through text-gray-500' : 'text-gray-800'
            }`}
            placeholder="New task"
            rows={viewMode === 'list' ? 1 : 2}
            style={{ 
              WebkitAppearance: 'none', 
              MozAppearance: 'none', 
              appearance: 'none',
              lineHeight: '1.5',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: viewMode === 'list' ? 'nowrap' : 'normal',
              display: viewMode === 'list' ? 'block' : '-webkit-box',
              WebkitLineClamp: viewMode === 'grid' ? 2 : undefined,
              WebkitBoxOrient: viewMode === 'grid' ? 'vertical' : undefined,
              maxHeight: viewMode === 'list' ? '24px' : '48px',
            }}
          />
          {task.dueDate && viewMode === 'grid' && (
            <div className={`text-xs mt-1 ${isDueDatePast(task.dueDate) && !task.completed ? 'text-red-500 font-medium' : 'text-gray-500'} opacity-70`}>
              📅 {formatDueDate(task.dueDate)}
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleTaskComplete(task.id);
          }}
          className={`flex-shrink-0 hover:scale-110 transition-transform ${viewMode === 'list' ? 'ml-4' : 'mt-0.5'}`}
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-gray-600" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>
      
      <div className={`flex items-center gap-2 flex-shrink-0 ${viewMode === 'list' ? 'ml-4' : 'justify-between pt-2'}`} style={{ height: viewMode === 'list' ? 'auto' : '32px' }}>
        {showListName && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onNavigateToList) {
                onNavigateToList(task.listId);
              }
            }}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
            title="Go to list"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="truncate max-w-[80px]">{lists.find(l => l.id === task.listId)?.name || 'Unknown'}</span>
          </button>
        )}
        <div className="flex items-center gap-2">
          <button
            ref={dateButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              if (dateButtonRef.current) {
                const rect = dateButtonRef.current.getBoundingClientRect();
                setDatePickerPosition({
                  top: rect.bottom + 5,
                  left: rect.left - 100
                });
              }
              setShowDatePicker(!showDatePicker);
            }}
            className="opacity-30 hover:opacity-100 transition-opacity flex-shrink-0 p-1 touch-manipulation"
            title="Set due date"
          >
            <Calendar className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowExpandedView(true);
            }}
          className="opacity-30 hover:opacity-100 transition-opacity flex-shrink-0 p-1 touch-manipulation"
          title="Expand card"
        >
          <Maximize2 className="w-4 h-4 text-gray-600" />
        </button>
        <button
          ref={colorButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            if (!showColorPicker && colorButtonRef.current) {
              const rect = colorButtonRef.current.getBoundingClientRect();
              setColorPickerPosition({
                top: rect.top - 50,
                left: rect.left - 200
              });
            }
            setShowColorPicker(!showColorPicker);
          }}
          className="opacity-30 hover:opacity-100 transition-opacity flex-shrink-0 relative p-1 touch-manipulation"
          title="Change color"
        >
          <Palette className="w-4 h-4 text-gray-600" />
          {showColorPicker && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowColorPicker(false)}
              />
              <div 
                className="fixed bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-20 flex gap-1.5"
                style={{
                  top: `${colorPickerPosition.top}px`,
                  left: `${colorPickerPosition.left}px`
                }}
              >
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTask(task.id, { color: color.value });
                      setShowColorPicker(false);
                    }}
                    className={`w-8 h-8 rounded-full ${color.class} border-2 border-gray-300 hover:border-gray-500 transition-all touch-manipulation`}
                    title={color.name}
                  />
                ))}
              </div>
            </>
          )}
        </button>
        
        {/* Date Picker */}
        {showDatePicker && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowDatePicker(false)}
            />
            <div 
              className="fixed bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-20 w-64"
              style={{
                top: `${datePickerPosition.top}px`,
                left: `${datePickerPosition.left}px`
              }}
            >
              <div className="mb-2 text-sm font-medium text-gray-700">Due Date</div>
              <input
                ref={dateInputRef}
                type="date"
                value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const [year, month, day] = e.target.value.split('-').map(Number);
                    const dateValue = new Date(year, month - 1, day).getTime();
                    updateTask(task.id, { dueDate: dateValue });
                  } else {
                    updateTask(task.id, { dueDate: undefined });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
              {task.dueDate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTask(task.id, { dueDate: undefined });
                    setShowDatePicker(false);
                  }}
                  className="mt-2 w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Clear Date
                </button>
              )}
            </div>
          </>
        )}
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteTask(task.id);
          }}
          className="opacity-30 hover:opacity-100 transition-opacity flex-shrink-0 p-1 touch-manipulation"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4 text-gray-600" />
        </button>
        </div>
      </div>
    </div>

      {/* Expanded View Modal */}
      {showExpandedView && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50" 
            onClick={() => setShowExpandedView(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl md:rounded-2xl shadow-2xl z-50 max-w-3xl w-full mx-4 max-h-[90vh] md:max-h-[85vh] overflow-y-auto">
            <div className={`${task.completed ? 'bg-gray-200' : colorClass} p-4 md:p-8 rounded-xl md:rounded-2xl`}>
              <div className="flex items-start justify-between mb-4 md:mb-6">
                <textarea
                  value={task.title}
                  onChange={(e) => updateTask(task.id, { title: e.target.value })}
                  className={`bg-transparent border-none outline-none w-full text-xl md:text-2xl font-bold cursor-text resize-none ${
                    task.completed ? 'line-through text-gray-500' : 'text-gray-800'
                  }`}
                  placeholder="Task title"
                  rows={3}
                  style={{ lineHeight: '1.3' }}
                />
                <button
                  onClick={() => toggleTaskComplete(task.id)}
                  className="ml-2 md:ml-4 flex-shrink-0 p-1 touch-manipulation"
                  title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-7 md:w-8 h-7 md:h-8 text-green-600" />
                  ) : (
                    <Circle className="w-7 md:w-8 h-7 md:h-8 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              
              <div className="mb-4 md:mb-6">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={task.notes || ''}
                  onChange={(e) => updateTask(task.id, { notes: e.target.value })}
                  className="w-full p-2 md:p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  placeholder="Add notes..."
                  rows={4}
                />
              </div>

              <div className="mb-4 md:mb-6">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [year, month, day] = e.target.value.split('-').map(Number);
                        const dateValue = new Date(year, month - 1, day).getTime();
                        updateTask(task.id, { dueDate: dateValue });
                      } else {
                        updateTask(task.id, { dueDate: undefined });
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                  {task.dueDate && (
                    <button
                      onClick={() => updateTask(task.id, { dueDate: undefined })}
                      className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-1.5 md:gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateTask(task.id, { color: color.value })}
                      className={`w-7 h-7 md:w-8 md:h-8 rounded-full ${color.class} border-2 ${
                        task.color === color.value ? 'border-gray-800' : 'border-gray-300'
                      } hover:border-gray-500 transition-all touch-manipulation`}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      deleteTask(task.id);
                      setShowExpandedView(false);
                    }}
                    className="flex-1 sm:flex-none px-4 md:px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm md:text-base touch-manipulation"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowExpandedView(false)}
                    className="flex-1 sm:flex-none px-4 md:px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm md:text-base touch-manipulation"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}