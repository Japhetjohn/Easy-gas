import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for storing wallet addresses
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
});

// Network status tracking
export const networkStatus = pgTable("network_status", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  congestionPercentage: integer("congestion_percentage").notNull(),
  tps: integer("tps").notNull(),
  blockTime: integer("block_time").notNull(), // in milliseconds
  failedTxPercentage: integer("failed_tx_percentage").notNull(),
  slot: text("slot").notNull(),
});

// Priority fee records
export const priorityFees = pgTable("priority_fees", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  transactionHash: text("transaction_hash").notNull().unique(),
  priorityFee: text("priority_fee").notNull(),
  transactionType: text("transaction_type").notNull(),
  userId: integer("user_id").references(() => users.id),
  confirmationTime: integer("confirmation_time").notNull(), // in milliseconds
});

// User transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  userId: integer("user_id").references(() => users.id),
  signature: text("signature").notNull().unique(),
  type: text("type").notNull(),
  amount: text("amount").notNull(),
  status: text("status").notNull(),
  priorityFee: text("priority_fee"),
});

// Alerts and notifications
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  alertType: text("alert_type").notNull(), // "success", "warning", "info"
  type: text("type").notNull(), // e.g., "high_congestion", "low_fees"
  threshold: integer("threshold"),
  active: boolean("active").notNull().default(true),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
});

export const insertNetworkStatusSchema = createInsertSchema(networkStatus).omit({
  id: true,
});

export const insertPriorityFeeSchema = createInsertSchema(priorityFees).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertNetworkStatus = z.infer<typeof insertNetworkStatusSchema>;
export type NetworkStatus = typeof networkStatus.$inferSelect;

export type InsertPriorityFee = z.infer<typeof insertPriorityFeeSchema>;
export type PriorityFee = typeof priorityFees.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;
