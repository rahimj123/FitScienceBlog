import { Link } from "wouter";
import type { Article, Author, Category } from "@shared/schema";
import CategoryBadge from "@/components/ui/CategoryBadge";
import ArticleAuthor from "@/components/ui/ArticleAuthor";

interface ArticleCardProps {
  article: Article;
  category?: Category;
  author?: Author;
}

const ArticleCard = ({ article, category, author }: ArticleCardProps) => {
  return (
    <article className="relative rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all">
      <div className="h-48 bg-neutral-light">
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {category && <CategoryBadge category={category} />}
        </div>
        <Link href={`/articles/${article.slug}`} className="block mt-2">
          <h3 className="text-xl font-semibold text-neutral-darkest hover:text-primary">
            {article.title}
          </h3>
          <p className="mt-3 text-neutral-dark line-clamp-3">
            {article.excerpt}
          </p>
        </Link>
        {author && (
          <div className="mt-6">
            <ArticleAuthor
              author={author}
              publishDate={article.publishedAt}
              readTime={article.readTime}
            />
          </div>
        )}
      </div>
    </article>
  );
};

export default ArticleCard;
