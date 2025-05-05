import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import ArticleList from "@/components/articles/ArticleList";
import type { Category } from "@shared/schema";

const CategoryPage = () => {
  const { slug } = useParams();

  const { data: category, isLoading } = useQuery<Category>({
    queryKey: [`/api/categories/${slug}`],
  });

  const getIconColorClass = (color: string) => {
    switch (color) {
      case "blue":
        return "text-primary";
      case "green":
        return "text-secondary";
      case "purple":
        return "text-purple-600";
      case "orange":
        return "text-orange-600";
      case "teal":
        return "text-teal-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <>
      <div className="bg-neutral-light py-12">
        <div className="container-custom">
          {isLoading ? (
            <div className="text-center">
              <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-5 w-96 mx-auto" />
            </div>
          ) : (
            <div className="text-center">
              <div
                className={`h-16 w-16 rounded-full mx-auto flex items-center justify-center mb-4 ${
                  category?.color === "blue" ? "bg-blue-100" :
                  category?.color === "green" ? "bg-green-100" :
                  category?.color === "purple" ? "bg-purple-100" :
                  category?.color === "orange" ? "bg-orange-100" :
                  category?.color === "teal" ? "bg-teal-100" : "bg-gray-100"
                }`}
              >
                {category && (
                  <i
                    className={`fas fa-${category.icon} text-2xl ${getIconColorClass(category.color)}`}
                  ></i>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-4">{category?.name}</h1>
              <p className="text-xl text-neutral-dark max-w-2xl mx-auto">
                {category?.description}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Sidebar Content */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-bold mb-4">About This Category</h3>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <p className="text-neutral-dark">
                    {category?.description || "Explore articles in this category to learn more about healthcare innovations and solutions."}
                  </p>
                )}
              </div>

              {/* Advertisement */}
              <div className="ad-placeholder">
                <p className="font-medium mb-2">Sponsored Content</p>
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
          </div>
          <div className="lg:col-span-3">
            {category ? (
              <ArticleList categoryId={category.id} pageSize={6} />
            ) : (
              <div className="text-center py-12">
                <p className="text-neutral-dark text-lg">Loading articles...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryPage;
