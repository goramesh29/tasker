export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  listId: string;
  createdAt: number;
  updatedAt: number;
  color?: string;
  position: number;
}

export interface TaskList {
  id: string;
  name: string;
  description?: string;
  groupId?: string;
  createdAt: number;
  updatedAt: number;
  color?: string;
  position: number;
}

export interface ListGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  color?: string;
  position: number;
}

export interface AppData {
  tasks: Task[];
  lists: TaskList[];
  groups: ListGroup[];
}
