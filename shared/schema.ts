import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Articles table
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  featuredImage: text("featured_image").notNull(),
  readTime: integer("read_time").notNull(),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  categoryId: integer("category_id").notNull(),
  authorId: integer("author_id").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

// Authors table
export const authors = pgTable("authors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio"),
  avatar: text("avatar").notNull(),
});

// Subscribers table
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  interests: text("interests"),
  subscribedAt: timestamp("subscribed_at").notNull().defaultNow(),
});

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Service signups table
export const serviceSignups = pgTable("service_signups", {
  id: serial("id").primaryKey(),
  service: text("service").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Weekly wellness goodness posts
export const weeklyWellnessPosts = pgTable("weekly_wellness_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  readingTime: integer("reading_time").notNull(),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  isPublished: boolean("is_published").notNull().default(true),
});

// Media assets for exercise videos, images, and related content
export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  mediaType: text("media_type").notNull(),
  originalFilename: text("original_filename"),
  storageUrl: text("storage_url").notNull(),
  remoteStorageUrl: text("remote_storage_url"),
  storageProvider: text("storage_provider"),
  thumbnailUrl: text("thumbnail_url"),
  altText: text("alt_text"),
  description: text("description"),
  mimeType: text("mime_type"),
  fileSizeBytes: integer("file_size_bytes"),
  durationSeconds: integer("duration_seconds"),
  width: integer("width"),
  height: integer("height"),
  exerciseFocus: text("exercise_focus"),
  bodyRegion: text("body_region"),
  equipment: text("equipment"),
  difficulty: text("difficulty"),
  tags: jsonb("tags").$type<string[]>(),
  uploadedByRole: text("uploaded_by_role"),
  uploadedByUserId: text("uploaded_by_user_id"),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schemas
export const insertArticleSchema = createInsertSchema(articles)
  .omit({ id: true });

export const insertCategorySchema = createInsertSchema(categories)
  .omit({ id: true });

export const insertAuthorSchema = createInsertSchema(authors)
  .omit({ id: true });

export const insertSubscriberSchema = createInsertSchema(subscribers)
  .omit({ id: true, subscribedAt: true });

export const insertContactMessageSchema = createInsertSchema(contactMessages)
  .omit({ id: true, createdAt: true });

export const insertServiceSignupSchema = createInsertSchema(serviceSignups)
  .omit({ id: true, createdAt: true })
  .extend({
    service: z.string().min(2, "Please choose a service"),
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    age: z.coerce.number().int().min(18, "Clients must be at least 18").max(100, "Please enter a valid age"),
    gender: z.enum(["Female", "Male", "Non-binary", "Prefer not to say"]),
    email: z.string().email("Please enter a valid email address"),
  });

export const insertWeeklyWellnessPostSchema = createInsertSchema(weeklyWellnessPosts)
  .omit({ id: true, publishedAt: true })
  .extend({
    title: z.string().min(5, "Title is required"),
    slug: z.string().min(3, "Slug is required"),
    category: z.string().min(2, "Category is required"),
    excerpt: z.string().min(20, "Excerpt is required"),
    content: z.string().min(40, "Content is required"),
    readingTime: z.coerce.number().int().min(1).max(60),
    isPublished: z.boolean().optional().default(true),
  });

export const insertMediaAssetSchema = createInsertSchema(mediaAssets)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    title: z.string().min(2, "Title is required"),
    mediaType: z.enum(["image", "video", "audio"]),
    originalFilename: z.string().min(1).optional().nullable(),
    storageUrl: z.string().min(1, "A storage URL is required"),
    remoteStorageUrl: z.string().min(1).optional().nullable(),
    storageProvider: z.string().min(1).optional().nullable(),
    thumbnailUrl: z.string().min(1).optional().nullable(),
    altText: z.string().min(1).optional().nullable(),
    description: z.string().min(1).optional().nullable(),
    mimeType: z.string().min(1).optional().nullable(),
    fileSizeBytes: z.coerce.number().int().min(0).optional().nullable(),
    durationSeconds: z.coerce.number().int().min(0).optional().nullable(),
    width: z.coerce.number().int().min(1).optional().nullable(),
    height: z.coerce.number().int().min(1).optional().nullable(),
    exerciseFocus: z.string().min(1).optional().nullable(),
    bodyRegion: z.string().min(1).optional().nullable(),
    equipment: z.string().min(1).optional().nullable(),
    difficulty: z.string().min(1).optional().nullable(),
    tags: z.array(z.string().min(1)).optional().default([]),
    uploadedByRole: z.string().min(1).optional().nullable(),
    uploadedByUserId: z.string().min(1).optional().nullable(),
    isPublished: z.boolean().optional().default(true),
  });

// Types
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Author = typeof authors.$inferSelect;
export type InsertAuthor = z.infer<typeof insertAuthorSchema>;

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

export type ServiceSignup = typeof serviceSignups.$inferSelect;
export type InsertServiceSignup = z.infer<typeof insertServiceSignupSchema>;

export type WeeklyWellnessPost = typeof weeklyWellnessPosts.$inferSelect;
export type InsertWeeklyWellnessPost = z.infer<typeof insertWeeklyWellnessPostSchema>;

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type InsertMediaAsset = z.infer<typeof insertMediaAssetSchema>;
