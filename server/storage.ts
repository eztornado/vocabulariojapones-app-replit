import { vocabularyWords, type VocabularyWord, type InsertVocabularyWord } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getVocabularyWords(): Promise<VocabularyWord[]>;
  addVocabularyWord(word: InsertVocabularyWord): Promise<VocabularyWord>;
  updateWordStatus(id: number, learned: boolean): Promise<VocabularyWord>;
  incrementFailedAttempts(id: number): Promise<VocabularyWord>;
}

export class DatabaseStorage implements IStorage {
  async getVocabularyWords(): Promise<VocabularyWord[]> {
    return await db.select().from(vocabularyWords);
  }

  async addVocabularyWord(word: InsertVocabularyWord): Promise<VocabularyWord> {
    const [newWord] = await db
      .insert(vocabularyWords)
      .values(word)
      .returning();
    return newWord;
  }

  async updateWordStatus(id: number, learned: boolean): Promise<VocabularyWord> {
    const [updatedWord] = await db
      .update(vocabularyWords)
      .set({ learned })
      .where(eq(vocabularyWords.id, id))
      .returning();

    if (!updatedWord) {
      throw new Error("Word not found");
    }

    return updatedWord;
  }

  async incrementFailedAttempts(id: number): Promise<VocabularyWord> {
    const [word] = await db
      .select()
      .from(vocabularyWords)
      .where(eq(vocabularyWords.id, id));

    if (!word) {
      throw new Error("Word not found");
    }

    const [updatedWord] = await db
      .update(vocabularyWords)
      .set({ failedAttempts: word.failedAttempts + 1 })
      .where(eq(vocabularyWords.id, id))
      .returning();

    return updatedWord;
  }
}

export const storage = new DatabaseStorage();