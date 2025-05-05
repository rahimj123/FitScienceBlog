import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category } from "@shared/schema";

const CategoriesSection = () => {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <section className="py-16 bg-neutral-light">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-darkest sm:text-4xl">
            Browse by Category
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-neutral-dark">
            Discover content tailored to your healthcare interests
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md"
              >
                <Skeleton className="h-16 w-16 rounded-full mb-4" />
                <Skeleton className="h-6 w-40 mb-4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories?.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <div 
                  className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 ${
                    category.color === 'blue' ? 'bg-blue-100' :
                    category.color === 'green' ? 'bg-green-100' :
                    category.color === 'purple' ? 'bg-purple-100' :
                    category.color === 'orange' ? 'bg-orange-100' :
                    category.color === 'teal' ? 'bg-teal-100' : 'bg-gray-100'
                  }`}
                >
                  <i 
                    className={`fas fa-${category.icon} text-2xl ${
                      category.color === 'blue' ? 'text-primary' :
                      category.color === 'green' ? 'text-secondary' :
                      category.color === 'purple' ? 'text-purple-600' :
                      category.color === 'orange' ? 'text-orange-600' :
                      category.color === 'teal' ? 'text-teal-600' : 'text-gray-600'
                    }`}
                  ></i>
                </div>
                <h3 className="text-lg font-semibold text-neutral-darkest">
                  {category.name}
                </h3>
                <p className="mt-2 text-center text-neutral-dark">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesSection;
