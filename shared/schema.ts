import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vocabularyWords = pgTable("vocabulary_words", {
  id: serial("id").primaryKey(),
  japanese: text("japanese").notNull(),
  spanish: text("spanish").notNull(),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  learned: boolean("learned").notNull().default(false),
});

export const insertVocabularySchema = createInsertSchema(vocabularyWords).pick({
  japanese: true,
  spanish: true,
});

export type InsertVocabularyWord = z.infer<typeof insertVocabularySchema>;
export type VocabularyWord = typeof vocabularyWords.$inferSelect;
