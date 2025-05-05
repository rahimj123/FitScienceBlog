import {
  articles, Article, InsertArticle,
  categories, Category, InsertCategory,
  authors, Author, InsertAuthor,
  subscribers, Subscriber, InsertSubscriber,
  contactMessages, ContactMessage, InsertContactMessage
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private articles: Map<number, Article>;
  private categories: Map<number, Category>;
  private authors: Map<number, Author>;
  private subscribers: Map<number, Subscriber>;
  private contactMessages: Map<number, ContactMessage>;
  
  private articleId: number;
  private categoryId: number;
  private authorId: number;
  private subscriberId: number;
  private messageId: number;
  
  constructor() {
    this.articles = new Map();
    this.categories = new Map();
    this.authors = new Map();
    this.subscribers = new Map();
    this.contactMessages = new Map();
    
    this.articleId = 1;
    this.categoryId = 1;
    this.authorId = 1;
    this.subscriberId = 1;
    this.messageId = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }
  
  private initSampleData() {
    // Sample Categories
    const categories: InsertCategory[] = [
      {
        name: "Medical Technology",
        slug: "medical-technology",
        description: "Innovations in treatments and healthcare delivery",
        icon: "heartbeat",
        color: "blue",
      },
      {
        name: "Fitness & Wellness",
        slug: "fitness-wellness",
        description: "Cutting-edge approaches to physical wellbeing",
        icon: "running",
        color: "green",
      },
      {
        name: "Mental Health",
        slug: "mental-health",
        description: "Digital solutions for psychological wellness",
        icon: "brain",
        color: "purple",
      },
      {
        name: "Research & Science",
        slug: "research-science",
        description: "Breakthroughs in medical and health science",
        icon: "dna",
        color: "orange",
      },
      {
        name: "Digital Health",
        slug: "digital-health",
        description: "Digital transformations in healthcare delivery",
        icon: "laptop-medical",
        color: "teal",
      }
    ];
    
    categories.forEach(category => this.createCategory(category));
    
    // Sample Authors
    const authors: InsertAuthor[] = [
      {
        name: "Dr. Sarah Chen",
        bio: "Medical researcher specializing in AI applications in healthcare",
        avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2",
      },
      {
        name: "Mark Johnson",
        bio: "Fitness technology expert and wellness advocate",
        avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5",
      },
      {
        name: "Dr. Jessica Patel",
        bio: "Telemedicine specialist and healthcare accessibility advocate",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
      },
      {
        name: "Dr. Michael Kim",
        bio: "Surgeon specializing in robotic-assisted procedures",
        avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d",
      }
    ];
    
    authors.forEach(author => this.createAuthor(author));
    
    // Sample Articles
    const articles: InsertArticle[] = [
      {
        title: "AI-Powered Diagnostics: The Future of Early Detection",
        slug: "ai-powered-diagnostics-future-early-detection",
        excerpt: "How artificial intelligence is transforming early disease detection and improving patient outcomes worldwide.",
        content: "Artificial intelligence is revolutionizing medical diagnostics...",
        featuredImage: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88",
        readTime: 6,
        publishedAt: new Date("2023-08-15"),
        categoryId: 1,
        authorId: 1,
        isFeatured: true,
      },
      {
        title: "Smart Wearables: Beyond Step Counting",
        slug: "smart-wearables-beyond-step-counting",
        excerpt: "The evolution of fitness trackers into comprehensive health monitoring devices and their impact on preventative care.",
        content: "Modern wearable devices have evolved far beyond simple pedometers...",
        featuredImage: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120",
        readTime: 8,
        publishedAt: new Date("2023-08-10"),
        categoryId: 2,
        authorId: 2,
        isFeatured: true,
      },
      {
        title: "Telehealth Revolution: Healthcare Without Boundaries",
        slug: "telehealth-revolution-healthcare-without-boundaries",
        excerpt: "How remote healthcare solutions are breaking down geographical barriers and expanding access to quality care.",
        content: "Telehealth is removing geographical limitations to healthcare access...",
        featuredImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118",
        readTime: 5,
        publishedAt: new Date("2023-08-05"),
        categoryId: 5,
        authorId: 3,
        isFeatured: true,
      },
      {
        title: "Robotic Surgery Advancements: Precision Medicine at Work",
        slug: "robotic-surgery-advancements-precision-medicine",
        excerpt: "The latest developments in robotic-assisted surgeries and how they're improving recovery times and patient outcomes.",
        content: "Robotic surgical systems are enabling unprecedented precision...",
        featuredImage: "https://images.unsplash.com/photo-1576671081837-49000212a370",
        readTime: 7,
        publishedAt: new Date("2023-08-01"),
        categoryId: 1,
        authorId: 4,
        isFeatured: false,
      },
      {
        title: "Electronic Health Records: Balancing Efficiency and Privacy",
        slug: "electronic-health-records-efficiency-privacy",
        excerpt: "How modern EHR systems are evolving to improve healthcare delivery while maintaining strict data protection standards.",
        content: "Electronic health record systems continue to evolve...",
        featuredImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d",
        readTime: 10,
        publishedAt: new Date("2023-07-28"),
        categoryId: 5,
        authorId: 2,
        isFeatured: false,
      },
      {
        title: "CRISPR and Gene Therapy: New Horizons in Treatment",
        slug: "crispr-gene-therapy-new-horizons",
        excerpt: "Exploring the revolutionary potential of gene editing technologies to treat previously incurable genetic conditions.",
        content: "CRISPR gene editing technology is opening new frontiers in medicine...",
        featuredImage: "https://images.unsplash.com/photo-1551076805-e1869033e561",
        readTime: 12,
        publishedAt: new Date("2023-07-25"),
        categoryId: 4,
        authorId: 1,
        isFeatured: false,
      },
      {
        title: "Digital Therapeutics for Mental Health: Evidence and Access",
        slug: "digital-therapeutics-mental-health",
        excerpt: "How app-based interventions and virtual therapy platforms are expanding mental healthcare availability and effectiveness.",
        content: "Digital therapeutic applications are transforming mental healthcare delivery...",
        featuredImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
        readTime: 9,
        publishedAt: new Date("2023-07-20"),
        categoryId: 3,
        authorId: 3,
        isFeatured: false,
      }
    ];
    
    articles.forEach(article => this.createArticle(article));
  }
  
  // Article methods
  async getAllArticles(): Promise<Article[]> {
    return Array.from(this.articles.values()).sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }
  
  async getArticleById(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }
  
  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find(article => article.slug === slug);
  }
  
  async getArticlesByCategory(categoryId: number): Promise<Article[]> {
    return Array.from(this.articles.values())
      .filter(article => article.categoryId === categoryId)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }
  
  async getFeaturedArticles(): Promise<Article[]> {
    return Array.from(this.articles.values())
      .filter(article => article.isFeatured)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }
  
  async getLatestArticles(limit: number): Promise<Article[]> {
    return Array.from(this.articles.values())
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }
  
  async createArticle(article: InsertArticle): Promise<Article> {
    const id = this.articleId++;
    const newArticle: Article = { ...article, id };
    this.articles.set(id, newArticle);
    return newArticle;
  }
  
  async updateArticle(id: number, articleUpdate: Partial<InsertArticle>): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    
    const updatedArticle = { ...article, ...articleUpdate };
    this.articles.set(id, updatedArticle);
    return updatedArticle;
  }
  
  async deleteArticle(id: number): Promise<boolean> {
    return this.articles.delete(id);
  }
  
  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(category => category.slug === slug);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Author methods
  async getAllAuthors(): Promise<Author[]> {
    return Array.from(this.authors.values());
  }
  
  async getAuthorById(id: number): Promise<Author | undefined> {
    return this.authors.get(id);
  }
  
  async createAuthor(author: InsertAuthor): Promise<Author> {
    const id = this.authorId++;
    const newAuthor: Author = { ...author, id };
    this.authors.set(id, newAuthor);
    return newAuthor;
  }
  
  // Subscriber methods
  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const id = this.subscriberId++;
    const newSubscriber: Subscriber = { 
      ...subscriber, 
      id, 
      subscribedAt: new Date() 
    };
    this.subscribers.set(id, newSubscriber);
    return newSubscriber;
  }
  
  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    return Array.from(this.subscribers.values()).find(
      subscriber => subscriber.email === email
    );
  }
  
  // Contact message methods
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = this.messageId++;
    const newMessage: ContactMessage = { 
      ...message, 
      id, 
      createdAt: new Date() 
    };
    this.contactMessages.set(id, newMessage);
    return newMessage;
  }
}

export const storage = new MemStorage();
