import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { LandingFooter } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { Reveal } from "@/components/landing/Reveal";

type WeeklyWellnessPost = {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  readingTime: number;
  publishedAt: string;
  isPublished: boolean;
};

function WeeklyWellnessGoodness() {
  const { data: posts = [], isLoading } = useQuery<WeeklyWellnessPost[]>({
    queryKey: ["/api/weekly-wellness-posts"],
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pb-20">
        <section className="relative overflow-hidden border-b border-primary/10 bg-[linear-gradient(180deg,_#f8f4ee_0%,_#f7f8f4_55%,_#ffffff_100%)] py-16 sm:py-20">
          <div className="container-custom">
            <Reveal>
              <a
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:text-primary/80"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </a>
              <div className="mt-8 max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/80 px-4 py-2 text-sm text-primary shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  Weekly Wellness Goodness
                </div>
                <h1 className="mt-6 text-balance font-display text-4xl font-semibold tracking-tight sm:text-6xl">
                  A weekly space for simple, useful wellness guidance
                </h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
                  Use this page as your growing wellness journal. Add one new tip each week to
                  share practical movement ideas, nutrition reminders, mindset shifts, and healthy
                  habits your audience can implement straight away.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="container-custom">
            {isLoading ? (
              <div className="grid gap-6 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Reveal key={index} delay={index * 0.05}>
                    <div className="h-72 animate-pulse rounded-[1.8rem] border border-primary/10 bg-white/70" />
                  </Reveal>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-3">
                {posts.map((post, index) => (
                  <Reveal key={post.slug} delay={index * 0.05}>
                    <article className="h-full rounded-[1.8rem] border border-primary/10 bg-white p-7 shadow-[0_18px_60px_-36px_rgba(33,56,45,0.28)]">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/70">
                        {post.category}
                      </p>
                      <h2 className="mt-4 text-2xl font-semibold text-foreground">{post.title}</h2>
                      <p className="mt-4 text-base leading-7 text-muted-foreground">{post.excerpt}</p>
                      <div className="mt-8 flex items-center justify-between border-t border-primary/10 pt-5">
                        <span className="text-sm text-muted-foreground">{post.readingTime} min read</span>
                        <a
                          href="/#contact"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80"
                        >
                          Share this with clients
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            ) : (
              <Reveal>
                <div className="rounded-[2rem] border border-primary/10 bg-white p-10 text-center shadow-[0_18px_60px_-36px_rgba(33,56,45,0.28)]">
                  <h2 className="font-display text-3xl font-semibold text-foreground">
                    No wellness posts published yet
                  </h2>
                  <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
                    This page is now connected to SQL. Once you begin building your monthly
                    wellness goodness plan, add posts into the `weekly_wellness_posts` table and
                    they will automatically appear here.
                  </p>
                </div>
              </Reveal>
            )}
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

export default WeeklyWellnessGoodness;
