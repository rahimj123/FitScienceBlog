import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryBadge from "@/components/ui/CategoryBadge";
import ArticleAuthor from "@/components/ui/ArticleAuthor";
import type { Article, Author, Category } from "@shared/schema";

type SortOption = "newest" | "popular" | "trending";

const LatestArticles = () => {
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ["/api/latest-articles"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: authors } = useQuery<Author[]>({
    queryKey: ["/api/authors"],
  });

  // In a real app, we'd fetch different articles based on the sortBy value
  // For this demo, we'll just show the same articles
  
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-darkest">
            Latest Articles
          </h2>
          <div className="hidden md:flex gap-2">
            <Button
              variant={sortBy === "newest" ? "secondary" : "ghost"}
              onClick={() => setSortBy("newest")}
            >
              Newest
            </Button>
            <Button
              variant={sortBy === "popular" ? "secondary" : "ghost"}
              onClick={() => setSortBy("popular")}
            >
              Popular
            </Button>
            <Button
              variant={sortBy === "trending" ? "secondary" : "ghost"}
              onClick={() => setSortBy("trending")}
            >
              Trending
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="flex flex-col md:flex-row gap-6">
                <Skeleton className="md:flex-shrink-0 md:w-48 h-48 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-20 rounded-full mb-3" />
                  <Skeleton className="h-7 w-full mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-2" />
                  <Skeleton className="h-4 w-4/6" />
                  <div className="mt-4 flex items-center">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="ml-3 flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {articles?.map((article) => {
              const category = categories?.find(
                (cat) => cat.id === article.categoryId
              );
              const author = authors?.find(
                (auth) => auth.id === article.authorId
              );

              return (
                <article
                  key={article.id}
                  className="flex flex-col md:flex-row gap-6"
                >
                  <div className="md:flex-shrink-0 md:w-48 h-48 bg-neutral-light rounded-lg overflow-hidden">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {category && <CategoryBadge category={category} />}
                    </div>
                    <Link href={`/articles/${article.slug}`} className="block">
                      <h3 className="text-xl font-semibold text-neutral-darkest hover:text-primary">
                        {article.title}
                      </h3>
                      <p className="mt-3 text-neutral-dark">
                        {article.excerpt}
                      </p>
                    </Link>
                    {author && (
                      <div className="mt-4">
                        <ArticleAuthor
                          author={author}
                          publishDate={article.publishedAt}
                          readTime={article.readTime}
                          size="small"
                        />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <nav className="flex items-center rounded-md shadow-sm">
            <Button
              variant="outline"
              className="rounded-l-md border-neutral-medium text-neutral-dark hover:bg-neutral-light"
              disabled
            >
              Previous
            </Button>
            <Button
              variant="default"
              className="border-t border-b border-neutral-medium rounded-none bg-primary"
            >
              1
            </Button>
            <Button
              variant="outline"
              className="border-t border-b border-neutral-medium rounded-none text-neutral-dark hover:bg-neutral-light"
            >
              2
            </Button>
            <Button
              variant="outline"
              className="border-t border-b border-neutral-medium rounded-none text-neutral-dark hover:bg-neutral-light"
            >
              3
            </Button>
            <Button
              variant="outline"
              className="rounded-r-md border-neutral-medium text-neutral-dark hover:bg-neutral-light"
            >
              Next
            </Button>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default LatestArticles;
