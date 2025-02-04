import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertVocabularySchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  app.get("/api/vocabulary", async (_req, res) => {
    const words = await storage.getVocabularyWords();
    res.json(words);
  });

  app.post("/api/vocabulary", async (req, res) => {
    const result = insertVocabularySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid vocabulary word" });
    }

    const word = await storage.addVocabularyWord(result.data);
    res.json(word);
  });

  app.patch("/api/vocabulary/:id/status", async (req, res) => {
    const id = parseInt(req.params.id);
    const { learned } = req.body;

    if (typeof learned !== "boolean") {
      return res.status(400).json({ error: "Invalid status update" });
    }

    try {
      const word = await storage.updateWordStatus(id, learned);
      res.json(word);
    } catch (error) {
      res.status(404).json({ error: "Word not found" });
    }
  });

  app.post("/api/vocabulary/:id/fail", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const word = await storage.incrementFailedAttempts(id);
      res.json(word);
    } catch (error) {
      res.status(404).json({ error: "Word not found" });
    }
  });

  return createServer(app);
}
