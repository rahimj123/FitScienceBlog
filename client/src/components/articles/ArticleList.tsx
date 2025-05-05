import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import ArticleCard from "./ArticleCard";
import type { Article, Author, Category } from "@shared/schema";

interface ArticleListProps {
  categoryId?: number;
  pageSize?: number;
}

const ArticleList = ({ categoryId, pageSize = 9 }: ArticleListProps) => {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "trending">("newest");

  // In a real app, we would fetch paginated articles using query params
  // For this demo, we'll fetch all articles and handle pagination client-side
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: [categoryId ? `/api/categories/${categoryId}/articles` : "/api/articles"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: authors } = useQuery<Author[]>({
    queryKey: ["/api/authors"],
  });

  // Filter articles if categoryId is provided
  const filteredArticles = articles
    ? categoryId
      ? articles.filter((article) => article.categoryId === categoryId)
      : articles
    : [];

  // Sort articles
  const sortedArticles = [...(filteredArticles || [])].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }
    // In a real app, we would have a view or like count to sort by
    return 0;
  });

  // Paginate articles
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedArticles = sortedArticles.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedArticles.length / pageSize);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">
          {categoryId
            ? `${categories?.find((c) => c.id === categoryId)?.name || "Articles"}`
            : "All Articles"}
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
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: pageSize }).map((_, index) => (
            <div
              key={index}
              className="relative rounded-lg shadow-lg overflow-hidden"
            >
              <Skeleton className="h-48 w-full" />
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-7 w-full mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/6" />
                <div className="mt-6 flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full" />
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
        <>
          {paginatedArticles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-dark text-lg">No articles found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedArticles.map((article) => {
                const category = categories?.find(
                  (cat) => cat.id === article.categoryId
                );
                const author = authors?.find(
                  (auth) => auth.id === article.authorId
                );

                return (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    category={category}
                    author={author}
                  />
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-12">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(Math.max(1, page - 1))}
                      isActive={page > 1}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setPage(pageNum)}
                        isActive={page === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      isActive={page < totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Ad Banner */}
      <div className="mt-12 ad-placeholder p-6 text-center">
        <p className="text-lg font-medium mb-2">Sponsored Content</p>
        <div className="google-ad">
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={import.meta.env.VITE_GOOGLE_ADSENSE_ID || "ca-pub-xxxxxxxxxxxxxxxx"}
            data-ad-slot="1234567890"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
          <script>
            (adsbygoogle = window.adsbygoogle || []).push({});
          </script>
        </div>
      </div>
    </div>
  );
};

export default ArticleList;
