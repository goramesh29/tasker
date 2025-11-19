import { create } from 'zustand';
import { Task, TaskList, ListGroup, AppData } from '@/types';
import { firestoreService } from '@/lib/firestore';

interface AppStore extends AppData {
  userId: string | null;
  setUserId: (userId: string | null) => void;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  
  // List actions
  addList: (list: Omit<TaskList, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => Promise<string>;
  updateList: (id: string, updates: Partial<TaskList>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  
  // Group actions
  addGroup: (group: Omit<ListGroup, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => Promise<void>;
  updateGroup: (id: string, updates: Partial<ListGroup>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  
  // Utility
  loadFromFirestore: () => Promise<void>;
  clearAll: () => void;
}

export const useStore = create<AppStore>((set, get) => ({
  tasks: [],
  lists: [],
  groups: [],
  userId: null,

  setUserId: (userId) => set({ userId }),

  // Task actions
  addTask: async (taskData) => {
    const { userId } = get();
    if (!userId) return;

    const position = get().tasks.filter(t => t.listId === taskData.listId).length;
    const taskId = await firestoreService.addTask(userId, { ...taskData, position });
    
    const newTask: Task = {
      ...taskData,
      id: taskId,
      position,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },

  updateTask: async (id, updates) => {
    const { userId } = get();
    if (!userId) return;

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates, updatedAt: Date.now() } : task
      ),
    }));

    await firestoreService.updateTask(userId, id, updates);
  },

  deleteTask: async (id) => {
    const { userId } = get();
    if (!userId) return;

    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
    await firestoreService.deleteTask(userId, id);
  },

  toggleTaskComplete: async (id) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task) return;
    await get().updateTask(id, { completed: !task.completed });
  },

  // List actions
  addList: async (listData) => {
    const { userId } = get();
    if (!userId) return '';

    const position = get().lists.filter(l => l.groupId === listData.groupId).length;
    const listId = await firestoreService.addList(userId, { ...listData, position });
    
    const newList: TaskList = {
      ...listData,
      id: listId,
      position,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => ({ lists: [...state.lists, newList] }));
    return listId;
  },

  updateList: async (id, updates) => {
    const { userId} = get();
    if (!userId) return;

    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === id ? { ...list, ...updates, updatedAt: Date.now() } : list
      ),
    }));

    await firestoreService.updateList(userId, id, updates);
  },

  deleteList: async (id) => {
    const { userId } = get();
    if (!userId) return;

    set((state) => ({
      lists: state.lists.filter((list) => list.id !== id),
      tasks: state.tasks.filter((task) => task.listId !== id),
    }));

    await firestoreService.deleteList(userId, id);
  },

  // Group actions
  addGroup: async (groupData) => {
    const { userId } = get();
    if (!userId) return;

    const position = get().groups.length;
    const groupId = await firestoreService.addGroup(userId, { ...groupData, position });
    
    const newGroup: ListGroup = {
      ...groupData,
      id: groupId,
      position,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => ({ groups: [...state.groups, newGroup] }));
  },

  updateGroup: async (id, updates) => {
    const { userId } = get();
    if (!userId) return;

    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === id ? { ...group, ...updates, updatedAt: Date.now() } : group
      ),
    }));

    await firestoreService.updateGroup(userId, id, updates);
  },

  deleteGroup: async (id) => {
    const { userId } = get();
    if (!userId) return;

    set((state) => ({
      groups: state.groups.filter((group) => group.id !== id),
      lists: state.lists.map(list => 
        list.groupId === id ? { ...list, groupId: undefined } : list
      ),
    }));

    await firestoreService.deleteGroup(userId, id);
  },

  // Utility
  loadFromFirestore: async () => {
    const { userId } = get();
    if (!userId) return;

    const [groups, lists, tasks] = await Promise.all([
      firestoreService.getGroups(userId),
      firestoreService.getLists(userId),
      firestoreService.getTasks(userId),
    ]);

    set({ groups, lists, tasks });
  },

  clearAll: () => {
    set({ tasks: [], lists: [], groups: [] });
  },
}));
