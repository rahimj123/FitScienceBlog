import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ArticleList from "@/components/articles/ArticleList";
import { Skeleton } from "@/components/ui/skeleton";

const Articles = () => {
  const [location] = useLocation();
  const queryParams = new URLSearchParams(location.split("?")[1] || "");
  const searchQuery = queryParams.get("search");

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  return (
    <>
      <div className="bg-neutral-light py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-4">
            {searchQuery ? `Search Results: ${searchQuery}` : "All Articles"}
          </h1>
          <p className="text-xl text-neutral-dark">
            {searchQuery
              ? "Explore our content related to your search"
              : "Discover the latest insights in healthcare technology and innovation"}
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-xl font-bold mb-6">Categories</h2>
              {categoriesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <div className="space-y-2">
                  <a
                    href="/articles"
                    className={`block p-2 rounded-md ${
                      !searchQuery
                        ? "bg-primary text-white"
                        : "hover:bg-neutral-light"
                    }`}
                  >
                    All Articles
                  </a>
                  {categories?.map((category) => (
                    <a
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="block p-2 rounded-md hover:bg-neutral-light"
                    >
                      {category.name}
                    </a>
                  ))}
                </div>
              )}

              {/* Amazon Affiliate Widget */}
              <div className="mt-8 ad-placeholder">
                <p className="font-medium mb-2">Recommended Products</p>
                <p className="text-sm">
                  Amazon Affiliate Links
                </p>
                <div 
                  className="mt-4 amazon-affiliate"
                  dangerouslySetInnerHTML={{
                    __html: `
                      <iframe 
                        src="//rcm-na.amazon-adsystem.com/e/cm?o=1&p=12&l=ur1&category=amazonhomepage&f=ifr&linkID=${import.meta.env.VITE_AMAZON_AFFILIATE_ID || 'placeholder-id'}&t=fitscience-20&tracking_id=fitscience-20" 
                        width="300" 
                        height="250" 
                        scrolling="no" 
                        border="0" 
                        marginwidth="0" 
                        style="border:none;" 
                        frameborder="0"
                      ></iframe>
                    `
                  }}
                ></div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <ArticleList pageSize={6} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Articles;
