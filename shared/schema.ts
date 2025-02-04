import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vocabularyWords = pgTable("vocabulary_words", {
  id: serial("id").primaryKey(),
  japanese: text("japanese").notNull(),
  spanish: text("spanish").notNull(),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  learned: boolean("learned").notNull().default(false),
  userId: integer("user_id").references(() => users.id), // Temporalmente opcional
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  wordId: integer("word_id").references(() => vocabularyWords.id).notNull(),
  attempts: integer("attempts").notNull().default(0),
  successes: integer("successes").notNull().default(0),
  lastAttempt: timestamp("last_attempt").defaultNow().notNull(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  vocabularyWords: many(vocabularyWords),
  progress: many(userProgress),
}));

export const vocabularyWordsRelations = relations(vocabularyWords, ({ one }) => ({
  user: one(users, {
    fields: [vocabularyWords.userId],
    references: [users.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  word: one(vocabularyWords, {
    fields: [userProgress.wordId],
    references: [vocabularyWords.id],
  }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertVocabularySchema = createInsertSchema(vocabularyWords).pick({
  japanese: true,
  spanish: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  lastAttempt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type VocabularyWord = typeof vocabularyWords.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;