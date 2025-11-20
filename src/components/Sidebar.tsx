'use client';

import { TaskList } from '@/types';
import { useStore } from '@/store/useStore';
import { Menu, Plus, ChevronRight, ChevronDown, FolderPlus, LogOut, User, Trash2, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { User as FirebaseUser } from 'firebase/auth';

interface SidebarProps {
  lists: TaskList[];
  selectedListId: string | null;
  onSelectList: (id: string) => void;
  onAddList: () => void;
  hoverListId: string | null;
  user: FirebaseUser | null;
  onSignOut: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function DroppableListItem({ list, isSelected, isHovered, onSelect, onDelete }: { list: TaskList; isSelected: boolean; isHovered: boolean; onSelect: () => void; onDelete: () => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `list-${list.id}`,
  });

  return (
    <div
      ref={setNodeRef}
      data-list-drop-id={list.id}
      className={`w-full px-4 py-2 rounded-lg mb-1 transition-all group flex items-center justify-between ${
        isSelected
          ? 'bg-blue-50 text-blue-600 font-medium'
          : isHovered
          ? 'bg-green-100 text-gray-700 ring-2 ring-green-400'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <button
        onClick={onSelect}
        className="flex-1 text-left truncate overflow-hidden whitespace-nowrap"
        title={list.name}
      >
        {list.name}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-30 hover:!opacity-100 transition-opacity flex-shrink-0"
        title="Delete list"
      >
        <Trash2 className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}

export default function Sidebar({ lists, selectedListId, onSelectList, onAddList, hoverListId, user, onSignOut, collapsed, onToggleCollapse, mobileOpen, onMobileClose }: SidebarProps) {
  const { groups, addGroup, deleteList } = useStore();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [listToDelete, setListToDelete] = useState<string | null>(null);

  const handleDeleteList = (listId: string) => {
    setListToDelete(listId);
  };

  const confirmDeleteList = async () => {
    if (listToDelete) {
      await deleteList(listToDelete);
      if (selectedListId === listToDelete) {
        onSelectList(lists[0]?.id || '');
      }
      setListToDelete(null);
    }
  };

  const cancelDeleteList = () => {
    setListToDelete(null);
  };

  const toggleGroup = (groupId: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupId)) {
      newCollapsed.delete(groupId);
    } else {
      newCollapsed.add(groupId);
    }
    setCollapsedGroups(newCollapsed);
  };

  const handleAddGroup = () => {
    addGroup({
      name: 'New Group',
    });
  };

  const ungroupedLists = lists.filter(list => !list.groupId);
  const sortedGroups = [...groups].sort((a, b) => a.position - b.position);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 flex flex-col h-screen transition-all duration-300 ease-in-out flex-shrink-0 overflow-x-hidden
        ${collapsed ? 'w-16' : 'w-64'}
        fixed md:relative z-50 md:z-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
      <div className="p-4 border-b border-gray-200 flex items-center gap-3 relative">
        <button
          onClick={onToggleCollapse}
          className="hover:bg-gray-100 rounded p-1 transition-colors hidden md:block"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
        </button>
        <button
          onClick={onMobileClose}
          className="hover:bg-gray-100 rounded p-1 transition-colors md:hidden"
          title="Close menu"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        {!collapsed && <h1 className="text-xl font-bold text-gray-800">Tasker</h1>}
      </div>

      {!collapsed && (
        <>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3">
        {/* Ungrouped Lists */}
        {ungroupedLists.map((list) => (
          <DroppableListItem
            key={list.id}
            list={list}
            isSelected={selectedListId === list.id}
            isHovered={hoverListId === list.id}
            onSelect={() => onSelectList(list.id)}
            onDelete={() => handleDeleteList(list.id)}
          />
        ))}

        {/* Groups */}
        {sortedGroups.map((group) => {
          const groupLists = lists.filter(list => list.groupId === group.id);
          const isCollapsed = collapsedGroups.has(group.id);

          return (
            <div key={group.id} className="mb-2">
              <div className="flex items-center gap-1 px-2 py-1">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="hover:bg-gray-100 rounded p-0.5"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                <input
                  type="text"
                  value={group.name}
                  onChange={(e) => useStore.getState().updateGroup(group.id, { name: e.target.value })}
                  className="flex-1 text-sm font-medium text-gray-700 bg-transparent border-none outline-none px-1 py-0.5 rounded hover:bg-gray-50 focus:bg-gray-50"
                  placeholder="Group name..."
                />
              </div>
              {!isCollapsed && groupLists.length > 0 && (
                <div className="relative ml-3 pl-3 border-l-2 border-gray-200">
                  {groupLists.map((list) => (
                    <DroppableListItem
                      key={list.id}
                      list={list}
                      isSelected={selectedListId === list.id}
                      isHovered={hoverListId === list.id}
                      onSelect={() => onSelectList(list.id)}
                      onDelete={() => handleDeleteList(list.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-gray-200 space-y-2">
        <button
          onClick={handleAddGroup}
          className="w-full flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors whitespace-nowrap"
        >
          <FolderPlus className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">New Group</span>
        </button>
        <button
          onClick={onAddList}
          className="w-full flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">New List</span>
        </button>
      </div>
      </>
      )}

      {/* Delete Confirmation Dialog */}
      {listToDelete && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={cancelDeleteList}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl p-6 z-50 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete List?</h3>
            <p className="text-gray-600 mb-6">
              Deleting this list will delete all tasks within it. Do you want to continue?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDeleteList}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteList}
                className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
      </div>
    </>
  );
}
