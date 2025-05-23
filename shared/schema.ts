import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema remains unchanged
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Define priority type
export const priorityEnum = z.enum(["high", "medium", "low"]);
export type Priority = z.infer<typeof priorityEnum>;

// Define subtask schema
export const subtaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  completed: z.boolean().default(false),
});
export type Subtask = z.infer<typeof subtaskSchema>;

// Todo schema
export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false).notNull(),
  priority: text("priority").notNull().default("medium"), // high, medium, low
  dueDate: timestamp("due_date"),
  listName: text("list_name").default("all").notNull(),
  order: integer("order").notNull(),
  subtasks: jsonb("subtasks").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTodoSchema = createInsertSchema(todos).omit({
  id: true,
  createdAt: true,
}).extend({
  priority: priorityEnum,
  subtasks: z.array(subtaskSchema).default([]),
  dueDate: z.string().nullable().optional(),
});

export const updateTodoSchema = insertTodoSchema.partial().extend({
  id: z.number(),
});

export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type UpdateTodo = z.infer<typeof updateTodoSchema>;
export type Todo = typeof todos.$inferSelect;

// Lists schema
export const lists = pgTable("lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
});

export const insertListSchema = createInsertSchema(lists).omit({
  id: true,
});

export type InsertList = z.infer<typeof insertListSchema>;
export type List = typeof lists.$inferSelect;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
