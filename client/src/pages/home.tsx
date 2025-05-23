import { useEffect } from "react";
import Sidebar from "@/components/sidebar";
import MobileMenu from "@/components/mobile-menu";
import TodoList from "@/components/todo-list";

const Home = () => {
  // Add title for SEO
  useEffect(() => {
    document.title = "TodoTask - Manage Your Tasks";
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-50 font-sans">
      {/* Sidebar for desktop */}
      <div className="w-full md:w-64 hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile menu */}
      <MobileMenu />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TodoList />
      </div>
    </div>
  );
};

export default Home;
