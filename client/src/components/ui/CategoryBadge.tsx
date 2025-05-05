import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@shared/schema";

interface CategoryBadgeProps {
  category: Category;
}

const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const colorClasses = {
    blue: "bg-blue-100 text-primary",
    green: "bg-green-100 text-secondary",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
    teal: "bg-teal-100 text-teal-600",
  };

  const colorClass = colorClasses[category.color as keyof typeof colorClasses] || "bg-gray-100 text-gray-600";

  return (
    <Link href={`/categories/${category.slug}`}>
      <Badge
        variant="outline"
        className={`px-3 py-1 rounded-full ${colorClass} hover:bg-opacity-80 transition-all cursor-pointer`}
      >
        {category.name}
      </Badge>
    </Link>
  );
};

export default CategoryBadge;
