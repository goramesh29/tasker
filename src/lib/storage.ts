import { AppData, Task, TaskList, ListGroup } from '@/types';

const STORAGE_KEY = 'tasker-app-data';

// Storage service with future cloud database migration support
export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Load all data
  loadData(): AppData {
    if (typeof window === 'undefined') {
      return { tasks: [], lists: [], groups: [] };
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }

    return { tasks: [], lists: [], groups: [] };
  }

  // Save all data
  saveData(data: AppData): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }

  // Future cloud database methods (stubs for now)
  async syncToCloud(userId: string, data: AppData): Promise<void> {
    // TODO: Implement cloud sync (Firebase, Supabase, etc.)
    console.log('Cloud sync not yet implemented', userId, data);
  }

  async loadFromCloud(userId: string): Promise<AppData | null> {
    // TODO: Implement cloud load
    console.log('Cloud load not yet implemented', userId);
    return null;
  }

  // Clear all data
  clearData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }

  // Export data as JSON
  exportData(): string {
    const data = this.loadData();
    return JSON.stringify(data, null, 2);
  }

  // Import data from JSON
  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString) as AppData;
      this.saveData(data);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export const storage = StorageService.getInstance();
