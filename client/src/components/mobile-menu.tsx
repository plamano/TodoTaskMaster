import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useTodo } from "@/hooks/use-todo";
import {
  CheckCircle,
  Menu,
  Calendar,
  CalendarDays,
  AlertCircle,
  ListFilter,
} from "lucide-react";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeList, setActiveList, lists, countTodosByList } = useTodo();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleListClick = (listName: string) => {
    setActiveList(listName);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckCircle className="text-primary text-xl" />
          <h1 className="text-xl font-semibold text-gray-800">TodoTask</h1>
        </div>
        <button id="mobile-menu-button" className="p-2" onClick={toggleMenu}>
          <Menu className="text-gray-600" />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden absolute top-16 left-0 z-10 w-full bg-white border-b border-gray-200 p-4",
          isOpen ? "block" : "hidden"
        )}
      >
        <nav className="mb-4">
          <ul className="space-y-2">
            <li>
              <Link href="/">
                <a
                  className={cn(
                    "flex items-center space-x-2 p-2 rounded-lg",
                    activeList === "all"
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
                    activeList === "today"
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
                    activeList === "this-week"
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
                    activeList === "high-priority"
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
                    activeList === list.name
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
        </ul>
      </div>
    </>
  );
};

export default MobileMenu;
