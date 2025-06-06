import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTodo } from "@/hooks/use-todo";
import { insertTodoSchema, Priority, Subtask } from "@shared/schema";
import { generateUniqueId, mergeDateAndTime } from "@/lib/utils";

interface AddTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Extend the schema for form validation
const formSchema = insertTodoSchema.extend({
  dueDate: z.string().optional().nullable(),
  dueTime: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const AddTodoModal = ({ isOpen, onClose }: AddTodoModalProps) => {
  const { createTodo, lists, getInitialTodoState, activeList } = useTodo();
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...getInitialTodoState(),
      dueDate: "",
      dueTime: "",
    }
  });

  const onSubmit = (data: FormValues) => {
    const mergedDueDate = data.dueDate && data.dueTime
      ? mergeDateAndTime(data.dueDate, data.dueTime)
      : data.dueDate 
        ? new Date(data.dueDate)
        : null;

    createTodo({
      title: data.title,
      description: data.description || "",
      priority: data.priority as Priority,
      listName: data.listName || "personal",
      completed: false,
      order: 0,
      subtasks,
      dueDate: mergedDueDate ? mergedDueDate.toISOString() : null,
    });

    // Reset form and close modal
    form.reset();
    setSubtasks([]);
    onClose();
  };

  const addSubtask = () => {
    setSubtasks([
      ...subtasks,
      { id: generateUniqueId(), title: "", completed: false }
    ]);
  };

  const updateSubtask = (id: string, title: string) => {
    setSubtasks(
      subtasks.map(subtask => 
        subtask.id === id ? { ...subtask, title } : subtask
      )
    );
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(subtask => subtask.id !== id));
  };

  const handleClose = () => {
    form.reset();
    setSubtasks([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 md:mx-0">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">Add New Task</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What needs to be done?"
                      {...field}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add more details..."
                      {...field}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border border-gray-300 rounded-md">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="listName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>List</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border border-gray-300 rounded-md">
                          <SelectValue placeholder="Select list" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lists.map((list) => (
                          <SelectItem key={list.id} value={list.name}>
                            {list.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormLabel>Due Date & Time</FormLabel>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="border border-gray-300 rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueTime"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        className="border border-gray-300 rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel>Subtasks</FormLabel>
              <div id="subtasks-container" className="space-y-2">
                {subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center">
                    <Input
                      type="text"
                      value={subtask.title}
                      onChange={(e) => updateSubtask(subtask.id, e.target.value)}
                      placeholder="Add subtask"
                      className="flex-1 border border-gray-300 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeSubtask(subtask.id)}
                      className="ml-2 text-gray-400 hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addSubtask}
                className="mt-2 text-primary hover:text-primary-hover text-sm flex items-center"
              >
                <Plus size={16} className="mr-1" />
                <span>Add Subtask</span>
              </button>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white"
              >
                Add Task
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTodoModal;
