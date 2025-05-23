import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Todo, Priority, Subtask, InsertTodo, UpdateTodo } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { generateUniqueId } from "@/lib/utils";

export type SortOption = "custom" | "dateAsc" | "dateDesc" | "priorityAsc" | "priorityDesc";

export function useTodo() {
  const [activeList, setActiveList] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("custom");
  const { toast } = useToast();

  // Get all todos
  const {
    data: todos = [],
    isLoading,
    isError,
    error,
  } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
  });

  // Get todos by list
  const getTodosByList = useCallback(() => {
    console.log("Filtering by active list:", activeList);
    let filteredTodos = [...todos];
    
    if (activeList === "high-priority") {
      console.log("Filtering by high priority");
      filteredTodos = filteredTodos.filter(todo => todo.priority === "high");
    } else if (activeList === "today") {
      console.log("Filtering by today");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      filteredTodos = filteredTodos.filter(todo => {
        if (!todo.dueDate) return false;
        const dueDate = new Date(todo.dueDate);
        return dueDate >= today && dueDate < tomorrow;
      });
    } else if (activeList === "this-week") {
      console.log("Filtering by this week");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      filteredTodos = filteredTodos.filter(todo => {
        if (!todo.dueDate) return false;
        const dueDate = new Date(todo.dueDate);
        return dueDate >= today && dueDate < nextWeek;
      });
    } else if (activeList !== "all") {
      console.log("Filtering by list name:", activeList);
      filteredTodos = filteredTodos.filter(todo => todo.listName === activeList);
    }
    
    // Apply sorting
    switch (sortOption) {
      case "dateAsc":
        filteredTodos.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        break;
      case "dateDesc":
        filteredTodos.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        });
        break;
      case "priorityDesc": // High to Low
        return filteredTodos.sort((a, b) => {
          const priorityMap: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
          return priorityMap[b.priority as Priority] - priorityMap[a.priority as Priority];
        });
      case "priorityAsc": // Low to High
        return filteredTodos.sort((a, b) => {
          const priorityMap: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
          return priorityMap[a.priority as Priority] - priorityMap[b.priority as Priority];
        });
      default: // Custom (use order)
        filteredTodos.sort((a, b) => a.order - b.order);
    }
    
    return filteredTodos;
  }, [todos, activeList, sortOption]);

  // Create todo
  const createTodoMutation = useMutation({
    mutationFn: async (todoData: InsertTodo) => {
      const res = await apiRequest('POST', '/api/todos', todoData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos'] });
      toast({
        title: "Success",
        description: "Todo created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create todo",
        variant: "destructive",
      });
    }
  });

  // Update todo
  const updateTodoMutation = useMutation({
    mutationFn: async (todoData: UpdateTodo) => {
      const res = await apiRequest('PATCH', `/api/todos/${todoData.id}`, todoData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos'] });
      toast({
        title: "Success",
        description: "Todo updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive",
      });
    }
  });

  // Delete todo
  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/todos/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos'] });
      toast({
        title: "Success",
        description: "Todo deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive",
      });
    }
  });

  // Toggle todo completion
  const toggleTodoCompletionMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const res = await apiRequest('PATCH', `/api/todos/${id}`, { completed });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update todo status",
        variant: "destructive",
      });
    }
  });

  // Toggle subtask completion
  const toggleSubtaskCompletionMutation = useMutation({
    mutationFn: async ({ 
      todoId, 
      subtaskId, 
      completed 
    }: { 
      todoId: number; 
      subtaskId: string; 
      completed: boolean 
    }) => {
      const todo = todos.find(t => t.id === todoId);
      if (!todo) throw new Error("Todo not found");

      const subtasks = [...(todo.subtasks as Subtask[])];
      const subtaskIndex = subtasks.findIndex(s => s.id === subtaskId);
      
      if (subtaskIndex === -1) throw new Error("Subtask not found");
      
      subtasks[subtaskIndex] = { 
        ...subtasks[subtaskIndex], 
        completed 
      };
      
      const res = await apiRequest('PATCH', `/api/todos/${todoId}`, { 
        subtasks 
      });
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update subtask",
        variant: "destructive",
      });
    }
  });

  // Update todo order
  const updateTodoOrderMutation = useMutation({
    mutationFn: async (todoIds: number[]) => {
      const res = await apiRequest('POST', '/api/todos/reorder', { ids: todoIds });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reorder todos",
        variant: "destructive",
      });
    }
  });

  // Get all lists
  const {
    data: lists = [],
    isLoading: listsLoading,
  } = useQuery({
    queryKey: ["/api/lists"],
  });

  // Create a new list
  const createListMutation = useMutation({
    mutationFn: async (listData: { name: string; color: string }) => {
      const res = await apiRequest('POST', '/api/lists', listData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lists'] });
      toast({
        title: "Success",
        description: "List created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create list",
        variant: "destructive",
      });
    }
  });

  // Prepare initial form state for new todo
  const getInitialTodoState = (): InsertTodo => ({
    title: "",
    description: "",
    priority: "medium",
    listName: activeList === "all" || 
              activeList === "today" || 
              activeList === "this-week" || 
              activeList === "high-priority" 
      ? "personal" 
      : activeList,
    completed: false,
    order: 0,
    subtasks: [],
    dueDate: null,
  });

  // Count todos by list
  const countTodosByList = useCallback((listName: string): number => {
    if (listName === "all") {
      return todos.length;
    } else if (listName === "high-priority") {
      return todos.filter(todo => todo.priority === "high").length;
    } else if (listName === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return todos.filter(todo => {
        if (!todo.dueDate) return false;
        const dueDate = new Date(todo.dueDate);
        return dueDate >= today && dueDate < tomorrow;
      }).length;
    } else if (listName === "this-week") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      return todos.filter(todo => {
        if (!todo.dueDate) return false;
        const dueDate = new Date(todo.dueDate);
        return dueDate >= today && dueDate < nextWeek;
      }).length;
    } else {
      return todos.filter(todo => todo.listName === listName).length;
    }
  }, [todos]);

  // Create memoized filtered todos based on activeList and sortOption
  const filteredTodos = getTodosByList();

  return {
    todos,
    filteredTodos,
    isLoading,
    isError,
    error,
    activeList,
    setActiveList,
    sortOption,
    setSortOption,
    createTodo: createTodoMutation.mutate,
    updateTodo: updateTodoMutation.mutate,
    deleteTodo: deleteTodoMutation.mutate,
    toggleTodoCompletion: toggleTodoCompletionMutation.mutate,
    toggleSubtaskCompletion: toggleSubtaskCompletionMutation.mutate,
    updateTodoOrder: updateTodoOrderMutation.mutate,
    lists,
    listsLoading,
    createList: createListMutation.mutate,
    getInitialTodoState,
    countTodosByList,
  };
}
