import { 
  articles, type Article, type InsertArticle,
  categories, type Category, type InsertCategory,
  authors, type Author, type InsertAuthor,
  subscribers, type Subscriber, type InsertSubscriber,
  contactMessages, type ContactMessage, type InsertContactMessage,
  serviceSignups, type ServiceSignup, type InsertServiceSignup,
  weeklyWellnessPosts, type WeeklyWellnessPost, type InsertWeeklyWellnessPost
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Storage interface that both in-memory and database implementations will use
export interface IStorage {
  // Articles
  getAllArticles(): Promise<Article[]>;
  getArticleById(id: number): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  getArticlesByCategory(categoryId: number): Promise<Article[]>;
  getFeaturedArticles(): Promise<Article[]>;
  getLatestArticles(limit: number): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  
  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Authors
  getAllAuthors(): Promise<Author[]>;
  getAuthorById(id: number): Promise<Author | undefined>;
  createAuthor(author: InsertAuthor): Promise<Author>;
  
  // Subscribers
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  
  // Contact Messages
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;

  // Service Signups
  createServiceSignup(signup: InsertServiceSignup): Promise<ServiceSignup>;

  // Weekly Wellness Goodness
  getWeeklyWellnessPosts(): Promise<WeeklyWellnessPost[]>;
  createWeeklyWellnessPost(post: InsertWeeklyWellnessPost): Promise<WeeklyWellnessPost>;
}

// Database implementation of the storage interface
export class DatabaseStorage implements IStorage {
  // Article methods
  async getAllArticles(): Promise<Article[]> {
    return db.select().from(articles).orderBy(desc(articles.publishedAt));
  }
  
  async getArticleById(id: number): Promise<Article | undefined> {
    const result = await db.select().from(articles).where(eq(articles.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const result = await db.select().from(articles).where(eq(articles.slug, slug));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getArticlesByCategory(categoryId: number): Promise<Article[]> {
    return db.select()
      .from(articles)
      .where(eq(articles.categoryId, categoryId))
      .orderBy(desc(articles.publishedAt));
  }
  
  async getFeaturedArticles(): Promise<Article[]> {
    return db.select()
      .from(articles)
      .where(eq(articles.isFeatured, true))
      .orderBy(desc(articles.publishedAt))
      .limit(3);
  }
  
  async getLatestArticles(limit: number): Promise<Article[]> {
    return db.select()
      .from(articles)
      .orderBy(desc(articles.publishedAt))
      .limit(limit);
  }
  
  async createArticle(article: InsertArticle): Promise<Article> {
    const result = await db.insert(articles).values(article).returning();
    return result[0];
  }
  
  async updateArticle(id: number, articleUpdate: Partial<InsertArticle>): Promise<Article | undefined> {
    const result = await db.update(articles)
      .set(articleUpdate)
      .where(eq(articles.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteArticle(id: number): Promise<boolean> {
    const result = await db.delete(articles).where(eq(articles.id, id)).returning();
    return result.length > 0;
  }
  
  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }
  
  // Author methods
  async getAllAuthors(): Promise<Author[]> {
    return db.select().from(authors);
  }
  
  async getAuthorById(id: number): Promise<Author | undefined> {
    const result = await db.select().from(authors).where(eq(authors.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createAuthor(author: InsertAuthor): Promise<Author> {
    const result = await db.insert(authors).values(author).returning();
    return result[0];
  }
  
  // Subscriber methods
  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const result = await db.insert(subscribers).values(subscriber).returning();
    return result[0];
  }
  
  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const result = await db.select().from(subscribers).where(eq(subscribers.email, email));
    return result.length > 0 ? result[0] : undefined;
  }
  
  // Contact message methods
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const result = await db.insert(contactMessages).values(message).returning();
    return result[0];
  }

  async createServiceSignup(signup: InsertServiceSignup): Promise<ServiceSignup> {
    const result = await db.insert(serviceSignups).values(signup).returning();
    return result[0];
  }

  async getWeeklyWellnessPosts(): Promise<WeeklyWellnessPost[]> {
    return db.select()
      .from(weeklyWellnessPosts)
      .where(eq(weeklyWellnessPosts.isPublished, true))
      .orderBy(desc(weeklyWellnessPosts.publishedAt));
  }

  async createWeeklyWellnessPost(post: InsertWeeklyWellnessPost): Promise<WeeklyWellnessPost> {
    const result = await db.insert(weeklyWellnessPosts).values(post).returning();
    return result[0];
  }
}

// Initialize the storage layer
export const storage = new DatabaseStorage();
