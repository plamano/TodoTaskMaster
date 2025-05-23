import { useCallback } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useTodo } from "@/hooks/use-todo";
import {
  CheckCircle,
  Calendar,
  CalendarDays,
  AlertCircle,
  ListFilter,
  Plus
} from "lucide-react";

const Sidebar = () => {
  const [location] = useLocation();
  const { activeList, setActiveList, lists, countTodosByList } = useTodo();

  const isActive = useCallback(
    (path: string) => {
      return activeList === path;
    },
    [activeList]
  );

  const handleListClick = (listName: string) => {
    setActiveList(listName);
  };

  return (
    <div className="w-full md:w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center space-x-2 mb-8">
        <CheckCircle className="text-primary text-xl" />
        <h1 className="text-xl font-semibold text-gray-800">TodoTask</h1>
      </div>

      <nav>
        <ul className="space-y-2">
          <li>
            <Link href="/">
              <a
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-lg",
                  isActive("all")
                    ? "bg-primary-light text-primary"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => handleListClick("all")}
              >
                <ListFilter size={16} />
                <span>All Tasks</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/">
              <a
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-lg",
                  isActive("today")
                    ? "bg-primary-light text-primary"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => handleListClick("today")}
              >
                <Calendar size={16} />
                <span>Today</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/">
              <a
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-lg",
                  isActive("this-week")
                    ? "bg-primary-light text-primary"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => handleListClick("this-week")}
              >
                <CalendarDays size={16} />
                <span>This Week</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/">
              <a
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-lg",
                  isActive("high-priority")
                    ? "bg-primary-light text-primary"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => handleListClick("high-priority")}
              >
                <AlertCircle size={16} className="text-priority-high" />
                <span>High Priority</span>
              </a>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="mt-8">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
          Lists
        </h2>
        <ul className="space-y-1">
          {lists.map((list) => (
            <li key={list.id}>
              <Link href="/">
                <a
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg",
                    isActive(list.name)
                      ? "bg-primary-light text-primary"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => handleListClick(list.name)}
                >
                  <div className="flex items-center space-x-2">
                    <ListFilter size={16} className={`text-${list.color}`} />
                    <span>{list.name}</span>
                  </div>
                  <span className="bg-gray-200 rounded-full px-2 py-0.5 text-xs">
                    {countTodosByList(list.name)}
                  </span>
                </a>
              </Link>
            </li>
          ))}
          <li>
            <button className="flex items-center space-x-2 p-2 w-full text-left text-gray-500 hover:text-primary">
              <Plus size={16} />
              <span>Add List</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
