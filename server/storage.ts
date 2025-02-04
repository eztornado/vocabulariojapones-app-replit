import { users, vocabularyWords, userProgress, type User, type InsertUser, type VocabularyWord, type UserProgress } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Métodos existentes
  getVocabularyWords(userId?: number): Promise<VocabularyWord[]>;
  addVocabularyWord(word: VocabularyWord): Promise<VocabularyWord>;
  updateWordStatus(id: number, learned: boolean): Promise<VocabularyWord>;
  incrementFailedAttempts(id: number): Promise<VocabularyWord>;
  deleteWord(id: number): Promise<void>;
  findWordByJapanese(japanese: string): Promise<VocabularyWord | undefined>;

  // Nuevos métodos para usuarios
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserProgress(userId: number): Promise<UserProgress[]>;
}

export class DatabaseStorage implements IStorage {
  async getVocabularyWords(userId?: number): Promise<VocabularyWord[]> {
    let query = db.select().from(vocabularyWords);
    if (userId) {
      query = query.where(eq(vocabularyWords.userId, userId));
    }
    return await query;
  }

  async findWordByJapanese(japanese: string): Promise<VocabularyWord | undefined> {
    const [word] = await db
      .select()
      .from(vocabularyWords)
      .where(eq(vocabularyWords.japanese, japanese));
    return word;
  }

  async addVocabularyWord(word: VocabularyWord): Promise<VocabularyWord> {
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

  async deleteWord(id: number): Promise<void> {
    const [deletedWord] = await db
      .delete(vocabularyWords)
      .where(eq(vocabularyWords.id, id))
      .returning();

    if (!deletedWord) {
      throw new Error("Word not found");
    }
  }
    async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
  }
}

export const storage = new DatabaseStorage();