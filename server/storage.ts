import { 
  articles, type Article, type InsertArticle,
  categories, type Category, type InsertCategory,
  authors, type Author, type InsertAuthor,
  subscribers, type Subscriber, type InsertSubscriber,
  contactMessages, type ContactMessage, type InsertContactMessage,
  serviceSignups, type ServiceSignup, type InsertServiceSignup,
  weeklyWellnessPosts, type WeeklyWellnessPost, type InsertWeeklyWellnessPost,
  mediaAssets, type MediaAsset, type InsertMediaAsset
} from "@shared/schema";
import { db, hasDatabase } from "./db";
import { and, desc, eq } from "drizzle-orm";

const database = db as NonNullable<typeof db>;

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

  // Media assets
  getAllMediaAssets(filters?: {
    mediaType?: string;
    exerciseFocus?: string;
    isPublished?: boolean;
  }): Promise<MediaAsset[]>;
  getMediaAssetById(id: number): Promise<MediaAsset | undefined>;
  createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset>;
  updateMediaAsset(id: number, asset: Partial<InsertMediaAsset>): Promise<MediaAsset | undefined>;
  deleteMediaAsset(id: number): Promise<boolean>;
}

export class MemoryStorage implements IStorage {
  private articles: Article[] = [];
  private categories: Category[] = [];
  private authors: Author[] = [];
  private subscribers: Subscriber[] = [];
  private contactMessages: ContactMessage[] = [];
  private serviceSignups: ServiceSignup[] = [];
  private weeklyWellnessPosts: WeeklyWellnessPost[] = [];
  private mediaAssets: MediaAsset[] = [];

  private nextId(items: Array<{ id: number }>) {
    return items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
  }

  async getAllArticles(): Promise<Article[]> {
    return [...this.articles].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  async getArticleById(id: number): Promise<Article | undefined> {
    return this.articles.find((article) => article.id === id);
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    return this.articles.find((article) => article.slug === slug);
  }

  async getArticlesByCategory(categoryId: number): Promise<Article[]> {
    return this.articles
      .filter((article) => article.categoryId === categoryId)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  async getFeaturedArticles(): Promise<Article[]> {
    return this.articles.filter((article) => article.isFeatured).slice(0, 3);
  }

  async getLatestArticles(limit: number): Promise<Article[]> {
    return (await this.getAllArticles()).slice(0, limit);
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const created: Article = {
      ...article,
      id: this.nextId(this.articles),
      publishedAt: article.publishedAt ?? new Date(),
      isFeatured: article.isFeatured ?? false,
    };
    this.articles.push(created);
    return created;
  }

  async updateArticle(id: number, articleUpdate: Partial<InsertArticle>): Promise<Article | undefined> {
    const existing = await this.getArticleById(id);
    if (!existing) return undefined;
    Object.assign(existing, articleUpdate);
    return existing;
  }

  async deleteArticle(id: number): Promise<boolean> {
    const index = this.articles.findIndex((article) => article.id === id);
    if (index === -1) return false;
    this.articles.splice(index, 1);
    return true;
  }

  async getAllCategories(): Promise<Category[]> {
    return [...this.categories];
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.find((category) => category.id === id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return this.categories.find((category) => category.slug === slug);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const created: Category = {
      ...category,
      id: this.nextId(this.categories),
      description: category.description ?? null,
    };
    this.categories.push(created);
    return created;
  }

  async getAllAuthors(): Promise<Author[]> {
    return [...this.authors];
  }

  async getAuthorById(id: number): Promise<Author | undefined> {
    return this.authors.find((author) => author.id === id);
  }

  async createAuthor(author: InsertAuthor): Promise<Author> {
    const created: Author = { ...author, id: this.nextId(this.authors), bio: author.bio ?? null };
    this.authors.push(created);
    return created;
  }

  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const created: Subscriber = {
      ...subscriber,
      id: this.nextId(this.subscribers),
      interests: subscriber.interests ?? null,
      subscribedAt: new Date(),
    };
    this.subscribers.push(created);
    return created;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    return this.subscribers.find((subscriber) => subscriber.email === email);
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const created: ContactMessage = {
      ...message,
      id: this.nextId(this.contactMessages),
      createdAt: new Date(),
    };
    this.contactMessages.push(created);
    return created;
  }

  async createServiceSignup(signup: InsertServiceSignup): Promise<ServiceSignup> {
    const created: ServiceSignup = {
      ...signup,
      id: this.nextId(this.serviceSignups),
      createdAt: new Date(),
    };
    this.serviceSignups.push(created);
    return created;
  }

  async getWeeklyWellnessPosts(): Promise<WeeklyWellnessPost[]> {
    return this.weeklyWellnessPosts
      .filter((post) => post.isPublished)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  async createWeeklyWellnessPost(post: InsertWeeklyWellnessPost): Promise<WeeklyWellnessPost> {
    const created: WeeklyWellnessPost = {
      ...post,
      id: this.nextId(this.weeklyWellnessPosts),
      publishedAt: new Date(),
      isPublished: post.isPublished ?? true,
    };
    this.weeklyWellnessPosts.push(created);
    return created;
  }

  async getAllMediaAssets(filters?: {
    mediaType?: string;
    exerciseFocus?: string;
    isPublished?: boolean;
  }): Promise<MediaAsset[]> {
    return this.mediaAssets
      .filter((asset) => {
        if (filters?.mediaType && asset.mediaType !== filters.mediaType) return false;
        if (filters?.exerciseFocus && asset.exerciseFocus !== filters.exerciseFocus) return false;
        if (typeof filters?.isPublished === "boolean" && asset.isPublished !== filters.isPublished) return false;
        return true;
      })
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getMediaAssetById(id: number): Promise<MediaAsset | undefined> {
    return this.mediaAssets.find((asset) => asset.id === id);
  }

  async createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset> {
    const created: MediaAsset = {
      ...asset,
      id: this.nextId(this.mediaAssets),
      originalFilename: asset.originalFilename ?? null,
      remoteStorageUrl: asset.remoteStorageUrl ?? null,
      storageProvider: asset.storageProvider ?? null,
      tags: asset.tags ?? [],
      thumbnailUrl: asset.thumbnailUrl ?? null,
      altText: asset.altText ?? null,
      description: asset.description ?? null,
      mimeType: asset.mimeType ?? null,
      fileSizeBytes: asset.fileSizeBytes ?? null,
      durationSeconds: asset.durationSeconds ?? null,
      width: asset.width ?? null,
      height: asset.height ?? null,
      exerciseFocus: asset.exerciseFocus ?? null,
      bodyRegion: asset.bodyRegion ?? null,
      equipment: asset.equipment ?? null,
      difficulty: asset.difficulty ?? null,
      uploadedByRole: asset.uploadedByRole ?? null,
      uploadedByUserId: asset.uploadedByUserId ?? null,
      isPublished: asset.isPublished ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mediaAssets.push(created);
    return created;
  }

  async updateMediaAsset(id: number, assetUpdate: Partial<InsertMediaAsset>): Promise<MediaAsset | undefined> {
    const existing = await this.getMediaAssetById(id);
    if (!existing) return undefined;
    Object.assign(existing, assetUpdate, { updatedAt: new Date() });
    return existing;
  }

  async deleteMediaAsset(id: number): Promise<boolean> {
    const index = this.mediaAssets.findIndex((asset) => asset.id === id);
    if (index === -1) return false;
    this.mediaAssets.splice(index, 1);
    return true;
  }
}

// Database implementation of the storage interface
export class DatabaseStorage implements IStorage {
  // Article methods
  async getAllArticles(): Promise<Article[]> {
    return database.select().from(articles).orderBy(desc(articles.publishedAt));
  }
  
  async getArticleById(id: number): Promise<Article | undefined> {
    const result = await database.select().from(articles).where(eq(articles.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const result = await database.select().from(articles).where(eq(articles.slug, slug));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getArticlesByCategory(categoryId: number): Promise<Article[]> {
    return database.select()
      .from(articles)
      .where(eq(articles.categoryId, categoryId))
      .orderBy(desc(articles.publishedAt));
  }
  
  async getFeaturedArticles(): Promise<Article[]> {
    return database.select()
      .from(articles)
      .where(eq(articles.isFeatured, true))
      .orderBy(desc(articles.publishedAt))
      .limit(3);
  }
  
  async getLatestArticles(limit: number): Promise<Article[]> {
    return database.select()
      .from(articles)
      .orderBy(desc(articles.publishedAt))
      .limit(limit);
  }
  
  async createArticle(article: InsertArticle): Promise<Article> {
    const result = await database.insert(articles).values(article).returning();
    return result[0];
  }
  
  async updateArticle(id: number, articleUpdate: Partial<InsertArticle>): Promise<Article | undefined> {
    const result = await database.update(articles)
      .set(articleUpdate)
      .where(eq(articles.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteArticle(id: number): Promise<boolean> {
    const result = await database.delete(articles).where(eq(articles.id, id)).returning();
    return result.length > 0;
  }
  
  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return database.select().from(categories);
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    const result = await database.select().from(categories).where(eq(categories.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await database.select().from(categories).where(eq(categories.slug, slug));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await database.insert(categories).values(category).returning();
    return result[0];
  }
  
  // Author methods
  async getAllAuthors(): Promise<Author[]> {
    return database.select().from(authors);
  }
  
  async getAuthorById(id: number): Promise<Author | undefined> {
    const result = await database.select().from(authors).where(eq(authors.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createAuthor(author: InsertAuthor): Promise<Author> {
    const result = await database.insert(authors).values(author).returning();
    return result[0];
  }
  
  // Subscriber methods
  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const result = await database.insert(subscribers).values(subscriber).returning();
    return result[0];
  }
  
  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const result = await database.select().from(subscribers).where(eq(subscribers.email, email));
    return result.length > 0 ? result[0] : undefined;
  }
  
  // Contact message methods
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const result = await database.insert(contactMessages).values(message).returning();
    return result[0];
  }

  async createServiceSignup(signup: InsertServiceSignup): Promise<ServiceSignup> {
    const result = await database.insert(serviceSignups).values(signup).returning();
    return result[0];
  }

  async getWeeklyWellnessPosts(): Promise<WeeklyWellnessPost[]> {
    return database.select()
      .from(weeklyWellnessPosts)
      .where(eq(weeklyWellnessPosts.isPublished, true))
      .orderBy(desc(weeklyWellnessPosts.publishedAt));
  }

  async createWeeklyWellnessPost(post: InsertWeeklyWellnessPost): Promise<WeeklyWellnessPost> {
    const result = await database.insert(weeklyWellnessPosts).values(post).returning();
    return result[0];
  }

  async getAllMediaAssets(filters?: {
    mediaType?: string;
    exerciseFocus?: string;
    isPublished?: boolean;
  }): Promise<MediaAsset[]> {
    const conditions = [];
    if (filters?.mediaType) {
      conditions.push(eq(mediaAssets.mediaType, filters.mediaType));
    }
    if (filters?.exerciseFocus) {
      conditions.push(eq(mediaAssets.exerciseFocus, filters.exerciseFocus));
    }
    if (typeof filters?.isPublished === "boolean") {
      conditions.push(eq(mediaAssets.isPublished, filters.isPublished));
    }

    const query = database.select().from(mediaAssets);
    return conditions.length
      ? query.where(and(...conditions)).orderBy(desc(mediaAssets.updatedAt))
      : query.orderBy(desc(mediaAssets.updatedAt));
  }

  async getMediaAssetById(id: number): Promise<MediaAsset | undefined> {
    const result = await database.select().from(mediaAssets).where(eq(mediaAssets.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset> {
    const result = await database.insert(mediaAssets).values(asset).returning();
    return result[0];
  }

  async updateMediaAsset(id: number, assetUpdate: Partial<InsertMediaAsset>): Promise<MediaAsset | undefined> {
    const result = await database.update(mediaAssets)
      .set({
        ...assetUpdate,
        updatedAt: new Date(),
      })
      .where(eq(mediaAssets.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteMediaAsset(id: number): Promise<boolean> {
    const result = await database.delete(mediaAssets).where(eq(mediaAssets.id, id)).returning();
    return result.length > 0;
  }
}

// Initialize the storage layer
export const storage = hasDatabase ? new DatabaseStorage() : new MemoryStorage();
