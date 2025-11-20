import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  deleteField,
  query, 
  where,
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Task, TaskList, ListGroup } from '@/types';

export const firestoreService = {
  // Groups
  async getGroups(userId: string): Promise<ListGroup[]> {
    const q = query(
      collection(db, `users/${userId}/groups`),
      orderBy('position', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis() || Date.now(),
      updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
    })) as ListGroup[];
  },

  async addGroup(userId: string, group: Omit<ListGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, `users/${userId}/groups`), {
      ...group,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async updateGroup(userId: string, groupId: string, updates: Partial<ListGroup>): Promise<void> {
    const docRef = doc(db, `users/${userId}/groups`, groupId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteGroup(userId: string, groupId: string): Promise<void> {
    await deleteDoc(doc(db, `users/${userId}/groups`, groupId));
  },

  // Lists
  async getLists(userId: string): Promise<TaskList[]> {
    const q = query(
      collection(db, `users/${userId}/lists`),
      orderBy('position', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis() || Date.now(),
      updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
    })) as TaskList[];
  },

  async addList(userId: string, list: Omit<TaskList, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, `users/${userId}/lists`), {
      ...list,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async updateList(userId: string, listId: string, updates: Partial<TaskList>): Promise<void> {
    const docRef = doc(db, `users/${userId}/lists`, listId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteList(userId: string, listId: string): Promise<void> {
    // Delete all tasks in the list first
    const tasksQuery = query(
      collection(db, `users/${userId}/tasks`),
      where('listId', '==', listId)
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    const batch = writeBatch(db);
    tasksSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    
    // Delete the list
    await deleteDoc(doc(db, `users/${userId}/lists`, listId));
  },

  // Tasks
  async getTasks(userId: string): Promise<Task[]> {
    const q = query(
      collection(db, `users/${userId}/tasks`),
      orderBy('position', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis() || Date.now(),
      updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
    })) as Task[];
  },

  async addTask(userId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, `users/${userId}/tasks`), {
      ...task,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<void> {
    const docRef = doc(db, `users/${userId}/tasks`, taskId);
    // Convert undefined values to deleteField() for Firestore
    const cleanUpdates: any = {};
    for (const [key, value] of Object.entries(updates)) {
      cleanUpdates[key] = value === undefined ? deleteField() : value;
    }
    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteTask(userId: string, taskId: string): Promise<void> {
    await deleteDoc(doc(db, `users/${userId}/tasks`, taskId));
  },
};
