import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertArticleSchema, 
  insertCategorySchema, 
  insertAuthorSchema, 
  insertSubscriberSchema, 
  insertContactMessageSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes

  // Get all articles
  app.get("/api/articles", async (req: Request, res: Response) => {
    try {
      const articles = await storage.getAllArticles();
      return res.json(articles);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Get article by slug
  app.get("/api/articles/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const article = await storage.getArticleBySlug(slug);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      return res.json(article);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Get all categories
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      return res.json(categories);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get category by slug
  app.get("/api/categories/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCategoryBySlug(slug);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      return res.json(category);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Get articles by category
  app.get("/api/categories/:slug/articles", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCategoryBySlug(slug);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      const articles = await storage.getArticlesByCategory(category.id);
      return res.json(articles);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch articles for category" });
    }
  });

  // Get featured articles
  app.get("/api/featured-articles", async (req: Request, res: Response) => {
    try {
      const articles = await storage.getFeaturedArticles();
      return res.json(articles);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch featured articles" });
    }
  });

  // Get latest articles
  app.get("/api/latest-articles", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const articles = await storage.getLatestArticles(limit);
      return res.json(articles);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch latest articles" });
    }
  });

  // Get all authors
  app.get("/api/authors", async (req: Request, res: Response) => {
    try {
      const authors = await storage.getAllAuthors();
      return res.json(authors);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch authors" });
    }
  });

  // Get author by id
  app.get("/api/authors/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const author = await storage.getAuthorById(parseInt(id));
      
      if (!author) {
        return res.status(404).json({ message: "Author not found" });
      }
      
      return res.json(author);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch author" });
    }
  });

  // Create subscriber
  app.post("/api/subscribers", async (req: Request, res: Response) => {
    try {
      const validatedData = insertSubscriberSchema.parse(req.body);
      
      // Check if subscriber already exists
      const existingSubscriber = await storage.getSubscriberByEmail(validatedData.email);
      if (existingSubscriber) {
        return res.status(409).json({ message: "Email already subscribed" });
      }
      
      const subscriber = await storage.createSubscriber(validatedData);
      return res.status(201).json(subscriber);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subscription data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // Create contact message
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const contactMessage = await storage.createContactMessage(validatedData);
      return res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact form data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
