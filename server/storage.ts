import { 
  todos, 
  lists, 
  type Todo, 
  type InsertTodo, 
  type UpdateTodo, 
  type List, 
  type InsertList,
  type User, 
  type InsertUser, 
  users
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Todo methods
  getAllTodos(): Promise<Todo[]>;
  getTodoById(id: number): Promise<Todo | undefined>;
  getTodosByList(listName: string): Promise<Todo[]>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(todo: UpdateTodo): Promise<Todo | undefined>;
  deleteTodo(id: number): Promise<boolean>;
  getTodosByPriority(priority: string): Promise<Todo[]>;
  getTodosByDate(startDate: Date, endDate?: Date): Promise<Todo[]>;
  updateTodoOrder(ids: number[]): Promise<boolean>;
  
  // List methods
  getAllLists(): Promise<List[]>;
  createList(list: InsertList): Promise<List>;
  deleteList(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private todos: Map<number, Todo>;
  private lists: Map<number, List>;
  private userCurrentId: number;
  private todoCurrentId: number;
  private listCurrentId: number;

  constructor() {
    this.users = new Map();
    this.todos = new Map();
    this.lists = new Map();
    this.userCurrentId = 1;
    this.todoCurrentId = 1;
    this.listCurrentId = 1;
    
    // Initialize with default lists
    this.setupDefaultLists();
    this.setupSampleTodos();
  }

  private setupDefaultLists() {
    const defaultLists = [
      { name: "personal", color: "blue-500" },
      { name: "work", color: "green-500" },
      { name: "shopping", color: "purple-500" }
    ];
    
    defaultLists.forEach(list => {
      this.createList(list);
    });
  }
  
  private setupSampleTodos() {
    // No sample data as per requirements
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Todo methods
  async getAllTodos(): Promise<Todo[]> {
    return Array.from(this.todos.values()).sort((a, b) => a.order - b.order);
  }

  async getTodoById(id: number): Promise<Todo | undefined> {
    return this.todos.get(id);
  }

  async getTodosByList(listName: string): Promise<Todo[]> {
    if (listName === 'all') {
      return this.getAllTodos();
    }
    return Array.from(this.todos.values())
      .filter(todo => todo.listName === listName)
      .sort((a, b) => a.order - b.order);
  }

  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const id = this.todoCurrentId++;
    // Get max order and increment by 1
    const todos = await this.getAllTodos();
    const maxOrder = todos.length > 0 
      ? Math.max(...todos.map(t => t.order)) 
      : 0;

    const todo: Todo = {
      ...insertTodo,
      id,
      order: maxOrder + 1,
      createdAt: new Date(),
      completed: false
    };
    
    this.todos.set(id, todo);
    return todo;
  }

  async updateTodo(updateTodo: UpdateTodo): Promise<Todo | undefined> {
    const existingTodo = this.todos.get(updateTodo.id);
    if (!existingTodo) return undefined;
    
    const updatedTodo: Todo = {
      ...existingTodo,
      ...updateTodo,
    };

    this.todos.set(updateTodo.id, updatedTodo);
    return updatedTodo;
  }

  async deleteTodo(id: number): Promise<boolean> {
    return this.todos.delete(id);
  }

  async getTodosByPriority(priority: string): Promise<Todo[]> {
    return Array.from(this.todos.values())
      .filter(todo => todo.priority === priority)
      .sort((a, b) => a.order - b.order);
  }

  async getTodosByDate(startDate: Date, endDate?: Date): Promise<Todo[]> {
    return Array.from(this.todos.values())
      .filter(todo => {
        if (!todo.dueDate) return false;
        const todoDate = new Date(todo.dueDate);
        if (endDate) {
          return todoDate >= startDate && todoDate <= endDate;
        }
        // If comparing just a single date, compare just the date part
        return todoDate.toDateString() === startDate.toDateString();
      })
      .sort((a, b) => a.order - b.order);
  }

  async updateTodoOrder(ids: number[]): Promise<boolean> {
    try {
      ids.forEach((id, index) => {
        const todo = this.todos.get(id);
        if (todo) {
          todo.order = index;
          this.todos.set(id, todo);
        }
      });
      return true;
    } catch (error) {
      console.error("Error updating todo order:", error);
      return false;
    }
  }

  // List methods
  async getAllLists(): Promise<List[]> {
    return Array.from(this.lists.values());
  }

  async createList(insertList: InsertList): Promise<List> {
    const id = this.listCurrentId++;
    const list: List = { ...insertList, id };
    this.lists.set(id, list);
    return list;
  }

  async deleteList(id: number): Promise<boolean> {
    return this.lists.delete(id);
  }
}

export const storage = new MemStorage();
