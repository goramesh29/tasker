'use client';

import { useStore } from '@/store/useStore';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/LoginPage';
import Sidebar from '@/components/Sidebar';
import TaskView from '@/components/TaskView';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import TaskCard from '@/components/TaskCard';

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { lists, tasks, loadFromFirestore, addList, updateTask, addGroup, addTask, setUserId } = useStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [hoverListId, setHoverListId] = useState<string | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      
      // Find which list button is under the cursor
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const listButton = elements.find(el => 
        el.hasAttribute('data-list-drop-id')
      ) as HTMLElement;
      
      if (listButton) {
        const listId = listButton.getAttribute('data-list-drop-id');
        setHoverListId(listId);
      } else {
        setHoverListId(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (user) {
      setUserId(user.uid);
      loadFromFirestore();
      setIsLoaded(true);
    }
  }, [user, setUserId, loadFromFirestore]);

  useEffect(() => {
    if (lists.length > 0 && !selectedListId) {
      setSelectedListId(lists[0].id);
    }
  }, [lists, selectedListId]);

  const handleAddList = useCallback(async () => {
    const newList = {
      name: 'New List',
    };
    const listId = await addList(newList);
    if (listId) {
      setSelectedListId(listId);
    }
  }, [addList]);

  const handleAddGroup = useCallback(() => {
    addGroup({
      name: 'New Group',
    });
  }, [addGroup]);

  const handleAddTask = useCallback(() => {
    if (!selectedListId) return;
    addTask({
      title: '',
      listId: selectedListId,
      completed: false,
    });
  }, [selectedListId, addTask]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+G - New Group
      if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        handleAddGroup();
      }
      // Ctrl+L - New List
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        handleAddList();
      }
      // Ctrl+Enter - New Task
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (selectedListId) {
          handleAddTask();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedListId, handleAddGroup, handleAddList, handleAddTask]);

  const handleDragStart = (event: any) => {
    const task = tasks.find((t: any) => t.id === event.active.id);
    setActiveTask(task);
    isDraggingRef.current = true;
  };

  const handleDragEnd = (event: any) => {
    const { active } = event;
    setActiveTask(null);
    isDraggingRef.current = false;

    // Use the hover list ID from our pointer tracking
    if (hoverListId) {
      const task = tasks.find((t: any) => t.id === active.id);
      if (task && task.listId !== hoverListId) {
        updateTask(active.id, { listId: hoverListId });
      }
    }
    
    setHoverListId(null);
  };

  const handleDragCancel = () => {
    setActiveTask(null);
    isDraggingRef.current = false;
    setHoverListId(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading your tasks...</div>
      </div>
    );
  }

  const selectedList = lists.find((list: any) => list.id === selectedListId);

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          lists={lists}
          selectedListId={selectedListId}
          onSelectList={setSelectedListId}
          onAddList={handleAddList}
          hoverListId={hoverListId}
          user={user}
          onSignOut={signOut}
        />
        <main className="flex-1 overflow-hidden">
            {selectedList ? (
              <TaskView list={selectedList} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">No Lists Yet</h2>
                  <p className="text-gray-600 mb-6">Create your first list to get started</p>
                  <button
                    onClick={handleAddList}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Create List
                  </button>
                </div>
              </div>
            )}
        </main>
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
