'use client';

import { Task } from '@/types';
import { Circle, CheckCircle2, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useEffect, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';

interface TaskCardProps {
  task: Task;
  autoFocus?: boolean;
}

const COLORS = {
  yellow: 'bg-yellow-100 hover:bg-yellow-200',
  pink: 'bg-pink-100 hover:bg-pink-200',
  blue: 'bg-blue-100 hover:bg-blue-200',
  green: 'bg-green-100 hover:bg-green-200',
  purple: 'bg-purple-100 hover:bg-purple-200',
  orange: 'bg-orange-100 hover:bg-orange-200',
};

export default function TaskCard({ task, autoFocus = false }: TaskCardProps) {
  const { toggleTaskComplete, updateTask, deleteTask } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });
  
  const colorClass = task.color && task.color in COLORS 
    ? COLORS[task.color as keyof typeof COLORS] 
    : COLORS.blue;

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const style = transform && !isDragging ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${task.completed ? 'bg-gray-200' : colorClass} rounded-2xl p-4 shadow-sm transition-all duration-200 group min-h-[140px] flex flex-col ${
        isDragging ? 'opacity-80' : 'cursor-grab hover:shadow-md active:cursor-grabbing'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <input
          ref={inputRef}
          type="text"
          value={task.title}
          onChange={(e) => updateTask(task.id, { title: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-transparent border-none outline-none w-full font-medium cursor-text ${
            task.completed ? 'line-through text-gray-500' : 'text-gray-800'
          }`}
          placeholder="New task"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleTaskComplete(task.id);
          }}
          className="flex-shrink-0 ml-2 hover:scale-110 transition-transform"
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-gray-600" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>
      
      {task.description && (
        <textarea
          value={task.description}
          onChange={(e) => updateTask(task.id, { description: e.target.value })}
          className="bg-transparent border-none outline-none w-full text-sm text-gray-600 mt-1 resize-none flex-1"
          placeholder="Add description..."
          rows={3}
        />
      )}
      
      <div className="flex justify-end mt-auto pt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteTask(task.id);
          }}
          className="opacity-30 hover:opacity-100 transition-opacity"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
