import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { registerRoutes } from "./routes";

// Create Express app
const app = express();
const MemoryStore = createMemoryStore(session);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "wellness-with-dr-jindani-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 14,
      sameSite: "lax",
      secure: true,
    },
    store: new MemoryStore({
      checkPeriod: 1000 * 60 * 60 * 24,
    }),
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register API routes once, then let Vercel handle static files via vercel.json routes.
const ready = (async () => {
  await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
})();

export default async function handler(req: Request, res: Response) {
  await ready;
  return app(req, res);
}
