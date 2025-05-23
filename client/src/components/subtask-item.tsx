import { Subtask } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";

interface SubtaskItemProps {
  subtask: Subtask;
  todoId: number;
  onToggleComplete: (todoId: number, subtaskId: string, completed: boolean) => void;
  isEditing?: boolean;
  onRemove?: (id: string) => void;
}

const SubtaskItem = ({
  subtask,
  todoId,
  onToggleComplete,
  isEditing = false,
  onRemove,
}: SubtaskItemProps) => {
  const handleToggle = (checked: boolean) => {
    onToggleComplete(todoId, subtask.id, checked);
  };

  return (
    <li className="flex items-center">
      <Checkbox
        id={`subtask-${subtask.id}`}
        className="w-4 h-4 mr-2 rounded"
        checked={subtask.completed}
        onCheckedChange={handleToggle}
      />
      <span
        className={cn(
          "text-gray-700",
          subtask.completed && "text-gray-500 line-through"
        )}
      >
        {subtask.title}
      </span>
      {isEditing && onRemove && (
        <button
          onClick={() => onRemove(subtask.id)}
          className="ml-2 text-gray-400 hover:text-red-500"
        >
          <i className="fas fa-times"></i>
        </button>
      )}
    </li>
  );
};

export default SubtaskItem;

import { cn } from "@/lib/utils";
