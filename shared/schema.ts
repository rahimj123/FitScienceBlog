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
