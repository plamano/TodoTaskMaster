import { useState, useRef } from "react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus } from "lucide-react";
import TodoItem from "./todo-item";
import AddTodoModal from "./add-todo-modal";
import EditTodoModal from "./edit-todo-modal";
import { useTodo, SortOption } from "@/hooks/use-todo";
import { Todo } from "@shared/schema";

interface SortableItemProps {
  id: number;
  todo: Todo;
  onToggleComplete: (id: number, completed: boolean) => void;
  onToggleSubtaskComplete: (todoId: number, subtaskId: string, completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

const SortableItem = ({ 
  id, 
  todo, 
  onToggleComplete, 
  onToggleSubtaskComplete, 
  onEdit, 
  onDelete 
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TodoItem
        todo={todo}
        onToggleComplete={onToggleComplete}
        onToggleSubtaskComplete={onToggleSubtaskComplete}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

const TodoList = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState<Todo | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<number | null>(null);
  const deleteDialogTriggerRef = useRef<HTMLButtonElement>(null);
  
  const { 
    filteredTodos, 
    activeList, 
    sortOption, 
    setSortOption, 
    toggleTodoCompletion, 
    toggleSubtaskCompletion, 
    updateTodo, 
    deleteTodo, 
    updateTodoOrder 
  } = useTodo();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = filteredTodos.findIndex((todo) => todo.id === active.id);
      const newIndex = filteredTodos.findIndex((todo) => todo.id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        // Create a new array with reordered todos
        const newTodos = [...filteredTodos];
        const [removed] = newTodos.splice(oldIndex, 1);
        newTodos.splice(newIndex, 0, removed);
        
        // Update the order in the backend
        updateTodoOrder(newTodos.map((todo) => todo.id));
      }
    }
  };

  const handleSortChange = (value: string) => {
    setSortOption(value as SortOption);
  };

  const handleToggleComplete = (id: number, completed: boolean) => {
    toggleTodoCompletion({ id, completed });
  };

  const handleToggleSubtaskComplete = (
    todoId: number,
    subtaskId: string,
    completed: boolean
  ) => {
    toggleSubtaskCompletion({ todoId, subtaskId, completed });
  };

  const handleEditTodo = (todo: Todo) => {
    setTodoToEdit(todo);
    setEditModalOpen(true);
  };

  const handleDeleteTodo = () => {
    if (todoToDelete !== null) {
      deleteTodo(todoToDelete);
      setTodoToDelete(null);
    }
  };

  const confirmDelete = (id: number) => {
    setTodoToDelete(id);
    if (deleteDialogTriggerRef.current) {
      deleteDialogTriggerRef.current.click();
    }
  };

  const getActiveListTitle = () => {
    switch (activeList) {
      case "all":
        return "All Tasks";
      case "today":
        return "Today";
      case "this-week":
        return "This Week";
      case "high-priority":
        return "High Priority";
      default:
        return activeList.charAt(0).toUpperCase() + activeList.slice(1);
    }
  };

  return (
    <div className="p-4 flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getActiveListTitle()}</h1>
            <p className="text-gray-500">{filteredTodos.length} tasks</p>
          </div>

          {/* Sort options */}
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger className="bg-white border border-gray-300 rounded-md text-sm">
                <SelectValue placeholder="Sort: Custom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Sort: Custom</SelectItem>
                <SelectItem value="dateAsc">Sort: Date (Ascending)</SelectItem>
                <SelectItem value="dateDesc">Sort: Date (Descending)</SelectItem>
                <SelectItem value="priorityDesc">Sort: Priority (High-Low)</SelectItem>
                <SelectItem value="priorityAsc">Sort: Priority (Low-High)</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              className="bg-primary hover:bg-primary-hover text-white"
              onClick={() => setAddModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> <span>Add Task</span>
            </Button>
          </div>
        </div>

        {/* Todo items container */}
        <div id="todo-container" className="space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTodos.map((todo) => todo.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredTodos.map((todo) => (
                <SortableItem
                  key={todo.id}
                  id={todo.id}
                  todo={todo}
                  onToggleComplete={handleToggleComplete}
                  onToggleSubtaskComplete={handleToggleSubtaskComplete}
                  onEdit={handleEditTodo}
                  onDelete={confirmDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Add Todo Modal */}
      <AddTodoModal 
        isOpen={addModalOpen} 
        onClose={() => setAddModalOpen(false)} 
      />

      {/* Edit Todo Modal */}
      {todoToEdit && (
        <EditTodoModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setTodoToEdit(null);
          }}
          todo={todoToEdit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog>
        <AlertDialogTrigger ref={deleteDialogTriggerRef} className="hidden">
          Open
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              todo item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTodoToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTodo}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TodoList;
