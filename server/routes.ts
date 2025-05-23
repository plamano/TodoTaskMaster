import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTodoSchema, updateTodoSchema, insertListSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const router = express.Router();

  // Get all todos
  router.get("/todos", async (req, res) => {
    try {
      const todos = await storage.getAllTodos();
      res.json(todos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch todos" });
    }
  });

  // Get todo by id
  router.get("/todos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const todo = await storage.getTodoById(id);
      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      
      res.json(todo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch todo" });
    }
  });

  // Get todos by list
  router.get("/todos/list/:listName", async (req, res) => {
    try {
      const listName = req.params.listName;
      const todos = await storage.getTodosByList(listName);
      res.json(todos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch todos for list" });
    }
  });

  // Create todo
  router.post("/todos", async (req, res) => {
    try {
      const parseResult = insertTodoSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const errorMessage = fromZodError(parseResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const newTodo = await storage.createTodo(parseResult.data);
      res.status(201).json(newTodo);
    } catch (error) {
      res.status(500).json({ message: "Failed to create todo" });
    }
  });

  // Update todo
  router.patch("/todos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const parseResult = updateTodoSchema.safeParse({ ...req.body, id });
      
      if (!parseResult.success) {
        const errorMessage = fromZodError(parseResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const updatedTodo = await storage.updateTodo(parseResult.data);
      if (!updatedTodo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      
      res.json(updatedTodo);
    } catch (error) {
      res.status(500).json({ message: "Failed to update todo" });
    }
  });

  // Delete todo
  router.delete("/todos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const success = await storage.deleteTodo(id);
      if (!success) {
        return res.status(404).json({ message: "Todo not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete todo" });
    }
  });

  // Update todo order
  router.post("/todos/reorder", async (req, res) => {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || !ids.every(id => typeof id === 'number')) {
        return res.status(400).json({ message: "Invalid IDs format. Expected array of numbers." });
      }
      
      const success = await storage.updateTodoOrder(ids);
      if (!success) {
        return res.status(500).json({ message: "Failed to update todo order" });
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update todo order" });
    }
  });

  // Get all lists
  router.get("/lists", async (req, res) => {
    try {
      const lists = await storage.getAllLists();
      res.json(lists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lists" });
    }
  });

  // Create list
  router.post("/lists", async (req, res) => {
    try {
      const parseResult = insertListSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const errorMessage = fromZodError(parseResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const newList = await storage.createList(parseResult.data);
      res.status(201).json(newList);
    } catch (error) {
      res.status(500).json({ message: "Failed to create list" });
    }
  });

  // Delete list
  router.delete("/lists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const success = await storage.deleteList(id);
      if (!success) {
        return res.status(404).json({ message: "List not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete list" });
    }
  });

  // Register the router with prefix
  app.use("/api", router);
  
  const httpServer = createServer(app);
  return httpServer;
}
