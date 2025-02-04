import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertVocabularySchema } from "@shared/schema";
import { passport, hashPassword } from "./auth";

const requireAuth = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "No autorizado" });
  }
  next();
};

export function registerRoutes(app: Express) {
  // Rutas de autenticación
  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Datos de usuario inválidos" });
      }

      const existingUser = await storage.getUserByUsername(result.data.username);
      if (existingUser) {
        return res.status(400).json({ error: "El usuario ya existe" });
      }

      const hashedPassword = await hashPassword(result.data.password);
      const user = await storage.createUser({
        ...result.data,
        password: hashedPassword,
      });

      // Login después de registro exitoso
      req.login(user, (err: any) => {
        if (err) {
          console.error("Error en login después de registro:", err);
          return res.status(500).json({ error: "Error al iniciar sesión" });
        }
        res.status(201).json(user);
      });
    } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({ error: "Error al crear el usuario" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Error en autenticación:", err);
        return res.status(500).json({ error: "Error de autenticación" });
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Credenciales inválidas" });
      }
      req.login(user, (loginErr: any) => {
        if (loginErr) {
          console.error("Error en login:", loginErr);
          return res.status(500).json({ error: "Error al iniciar sesión" });
        }
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", requireAuth, (req, res) => {
    req.logout((err: any) => {
      if (err) {
        console.error("Error en logout:", err);
        return res.status(500).json({ error: "Error al cerrar sesión" });
      }
      res.json({ message: "Sesión cerrada" });
    });
  });

  // Ruta para obtener el usuario actual
  app.get("/api/user", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }
    res.json(req.user);
  });

  // Rutas protegidas de vocabulario
  app.get("/api/vocabulary", requireAuth, async (req: any, res) => {
    const words = await storage.getVocabularyWords(req.user.id);
    res.json(words);
  });

  app.post("/api/vocabulary", requireAuth, async (req: any, res) => {
    const result = insertVocabularySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Palabra inválida" });
    }

    const existingWord = await storage.findWordByJapanese(result.data.japanese);
    if (existingWord) {
      return res.status(400).json({ error: "Esta palabra ya existe" });
    }

    const word = await storage.addVocabularyWord({
      ...result.data,
      userId: req.user.id,
      failedAttempts: 0,
      learned: false,
      createdAt: new Date(),
    } as any);
    res.json(word);
  });

  app.patch("/api/vocabulary/:id/status", requireAuth, async (req: any, res) => {
    const id = parseInt(req.params.id);
    const { learned } = req.body;

    if (typeof learned !== "boolean") {
      return res.status(400).json({ error: "Estado inválido" });
    }

    try {
      const word = await storage.updateWordStatus(id, learned);
      if (word.userId !== req.user.id) {
        return res.status(403).json({ error: "No autorizado" });
      }
      res.json(word);
    } catch (error) {
      res.status(404).json({ error: "Palabra no encontrada" });
    }
  });

  app.post("/api/vocabulary/:id/fail", requireAuth, async (req: any, res) => {
    const id = parseInt(req.params.id);
    try {
      const word = await storage.incrementFailedAttempts(id);
      if (word.userId !== req.user.id) {
        return res.status(403).json({ error: "No autorizado" });
      }
      res.json(word);
    } catch (error) {
      res.status(404).json({ error: "Palabra no encontrada" });
    }
  });

  app.delete("/api/vocabulary/:id", requireAuth, async (req: any, res) => {
    const id = parseInt(req.params.id);
    try {
      const word = await storage.findWordByJapanese(req.params.id);
      if (word && word.userId !== req.user.id) {
        return res.status(403).json({ error: "No autorizado" });
      }

      await storage.deleteWord(id);
      res.status(204).end();
    } catch (error) {
      res.status(404).json({ error: "Palabra no encontrada" });
    }
  });

  // Ruta para obtener estadísticas del usuario
  app.get("/api/stats", requireAuth, async (req: any, res) => {
    const progress = await storage.getUserProgress(req.user.id);
    const words = await storage.getVocabularyWords(req.user.id);

    const stats = {
      totalWords: words.length,
      learnedWords: words.filter(w => w.learned).length,
      totalAttempts: progress.reduce((sum, p) => sum + p.attempts, 0),
      successRate: progress.reduce((sum, p) => sum + (p.successes / p.attempts) || 0, 0) / progress.length,
    };

    res.json(stats);
  });

  return createServer(app);
}