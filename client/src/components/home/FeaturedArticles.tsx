import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ArticleCard from "../articles/ArticleCard";
import type { Article, Author, Category } from "@shared/schema";

const FeaturedArticles = () => {
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ["/api/featured-articles"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: authors } = useQuery<Author[]>({
    queryKey: ["/api/authors"],
  });

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-darkest sm:text-4xl">
            Featured Articles
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-neutral-dark">
            The latest insights on healthcare innovation and technology
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((index) => (
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
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles?.map((article) => {
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

        <div className="mt-12 text-center">
          <Button
            asChild
            size="lg"
            className="text-white bg-primary hover:bg-primary-dark"
          >
            <Link href="/articles">
              View All Articles
              <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArticles;
