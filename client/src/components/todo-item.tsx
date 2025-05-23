import { useState } from "react";
import { Grip, Pencil, Trash, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { cn, formatDate, getPriorityColor } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Todo, Subtask } from "@shared/schema";
import SubtaskItem from "./subtask-item";

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: number, completed: boolean) => void;
  onToggleSubtaskComplete: (
    todoId: number,
    subtaskId: string,
    completed: boolean
  ) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  dragHandleProps?: any;
}

const TodoItem = ({
  todo,
  onToggleComplete,
  onToggleSubtaskComplete,
  onEdit,
  onDelete,
  dragHandleProps,
}: TodoItemProps) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const { borderColor } = getPriorityColor(todo.priority);
  const subtasks = todo.subtasks as Subtask[] || [];

  const handleToggleComplete = (checked: boolean) => {
    onToggleComplete(todo.id, checked);
  };

  const toggleSubtasks = () => {
    setShowSubtasks(!showSubtasks);
  };

  const getPriorityBadge = () => {
    const { textColor, bgColor } = getPriorityColor(todo.priority);
    return (
      <span
        className={cn(
          "text-xs font-medium px-2.5 py-0.5 rounded-full",
          bgColor,
          textColor
        )}
      >
        {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
      </span>
    );
  };

  return (
    <div
      className={cn(
        "todo-item bg-white rounded-lg border-l-4 shadow",
        borderColor,
        todo.completed && "bg-gray-50 border-gray-300",
      )}
      data-todo-id={todo.id}
    >
      <div className="p-4 flex items-start">
        <div className="mr-3 pt-1">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={handleToggleComplete}
            className="w-5 h-5 rounded-full border-2 border-gray-300 cursor-pointer"
          />
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <h3
              className={cn(
                "text-lg font-medium",
                todo.completed
                  ? "text-gray-500 line-through"
                  : "text-gray-900"
              )}
            >
              {todo.title}
            </h3>
            <div className="flex items-center mt-2 sm:mt-0 space-x-2">
              {todo.completed ? (
                <span className="bg-gray-200 text-gray-500 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                </span>
              ) : (
                getPriorityBadge()
              )}
              <span
                className={cn(
                  "text-sm flex items-center",
                  todo.completed ? "text-gray-400" : "text-gray-500"
                )}
              >
                {todo.completed ? (
                  <>Completed</>
                ) : todo.dueDate ? (
                  <>
                    <Clock className="mr-1 h-4 w-4" />
                    {formatDate(todo.dueDate)}
                  </>
                ) : null}
              </span>
            </div>
          </div>

          {todo.description && (
            <p
              className={cn(
                "mt-1",
                todo.completed
                  ? "text-gray-400 line-through"
                  : "text-gray-600"
              )}
            >
              {todo.description}
            </p>
          )}

          {/* Subtasks */}
          {subtasks.length > 0 && (
            <div className="mt-3">
              <button
                className="text-sm text-gray-600 mb-2 focus:outline-none flex items-center"
                onClick={toggleSubtasks}
              >
                {showSubtasks ? (
                  <ChevronDown className="mr-1 h-4 w-4" />
                ) : (
                  <ChevronRight className="mr-1 h-4 w-4" />
                )}
                <span>{subtasks.length} subtasks</span>
              </button>

              {showSubtasks && (
                <ul className="pl-4 space-y-2 text-sm">
                  {subtasks.map((subtask) => (
                    <SubtaskItem
                      key={subtask.id}
                      subtask={subtask}
                      todoId={todo.id}
                      onToggleComplete={onToggleSubtaskComplete}
                    />
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="ml-2 flex flex-col space-y-2">
          <div {...dragHandleProps}>
            <button className="text-gray-400 hover:text-gray-600" title="Drag to reorder">
              <Grip className="h-4 w-4" />
            </button>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600"
            title="Edit"
            onClick={() => onEdit(todo)}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            className="text-gray-400 hover:text-red-500"
            title="Delete"
            onClick={() => onDelete(todo.id)}
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoItem;
