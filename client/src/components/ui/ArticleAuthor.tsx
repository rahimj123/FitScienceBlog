import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Author } from "@shared/schema";

interface ArticleAuthorProps {
  author: Author;
  publishDate: Date | string;
  readTime: number;
  size?: "default" | "small";
}

const ArticleAuthor = ({
  author,
  publishDate,
  readTime,
  size = "default",
}: ArticleAuthorProps) => {
  const date = typeof publishDate === "string" 
    ? new Date(publishDate) 
    : publishDate;
  
  const formattedDate = format(date, "MMM d, yyyy");
  const initials = author.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <Avatar className={size === "small" ? "h-8 w-8" : "h-10 w-10"}>
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
      <div className="ml-3">
        <p className={`${size === "small" ? "text-sm" : "text-base"} font-medium text-neutral-darkest`}>
          {author.name}
        </p>
        <div className={`flex space-x-1 ${size === "small" ? "text-xs" : "text-sm"} text-neutral-medium`}>
          <time dateTime={date.toISOString()}>{formattedDate}</time>
          <span aria-hidden="true">&middot;</span>
          <span>{readTime} min read</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleAuthor;
