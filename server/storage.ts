import { vocabularyWords, type VocabularyWord, type InsertVocabularyWord } from "@shared/schema";

export interface IStorage {
  getVocabularyWords(): Promise<VocabularyWord[]>;
  addVocabularyWord(word: InsertVocabularyWord): Promise<VocabularyWord>;
  updateWordStatus(id: number, learned: boolean): Promise<VocabularyWord>;
  incrementFailedAttempts(id: number): Promise<VocabularyWord>;
}

export class MemStorage implements IStorage {
  private words: Map<number, VocabularyWord>;
  private currentId: number;

  constructor() {
    this.words = new Map();
    this.currentId = 1;
  }

  async getVocabularyWords(): Promise<VocabularyWord[]> {
    return Array.from(this.words.values());
  }

  async addVocabularyWord(word: InsertVocabularyWord): Promise<VocabularyWord> {
    const id = this.currentId++;
    const newWord: VocabularyWord = {
      ...word,
      id,
      failedAttempts: 0,
      learned: false,
    };
    this.words.set(id, newWord);
    return newWord;
  }

  async updateWordStatus(id: number, learned: boolean): Promise<VocabularyWord> {
    const word = this.words.get(id);
    if (!word) throw new Error("Word not found");
    
    const updatedWord = { ...word, learned };
    this.words.set(id, updatedWord);
    return updatedWord;
  }

  async incrementFailedAttempts(id: number): Promise<VocabularyWord> {
    const word = this.words.get(id);
    if (!word) throw new Error("Word not found");
    
    const updatedWord = { ...word, failedAttempts: word.failedAttempts + 1 };
    this.words.set(id, updatedWord);
    return updatedWord;
  }
}

export const storage = new MemStorage();
