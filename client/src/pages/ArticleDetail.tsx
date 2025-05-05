import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  EmailShareButton,
} from "react-share";
import CategoryBadge from "@/components/ui/CategoryBadge";
import ArticleAuthor from "@/components/ui/ArticleAuthor";
import type { Article, Category, Author } from "@shared/schema";

const ArticleDetail = () => {
  const { slug } = useParams();
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const { data: article, isLoading: articleLoading } = useQuery<Article>({
    queryKey: [`/api/articles/${slug}`],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: authors } = useQuery<Author[]>({
    queryKey: ["/api/authors"],
  });

  const { data: relatedArticles } = useQuery<Article[]>({
    queryKey: ["/api/latest-articles?limit=3"],
    enabled: !!article,
  });

  const category = article
    ? categories?.find((cat) => cat.id === article.categoryId)
    : undefined;

  const author = article
    ? authors?.find((auth) => auth.id === article.authorId)
    : undefined;

  if (articleLoading) {
    return (
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-2/3 mb-4" />
          <Skeleton className="h-6 w-1/3 mb-6" />
          <Skeleton className="h-6 w-full mb-4" />
          <Skeleton className="h-6 w-full mb-4" />
          <Skeleton className="h-6 w-2/3 mb-12" />
          <Skeleton className="h-[400px] w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container-custom py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Article not found</h1>
        <p className="mb-6">The article you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/articles">Return to Articles</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-neutral-light py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              {category && <CategoryBadge category={category} />}
            </div>
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
            <p className="text-xl text-neutral-dark mb-6">{article.excerpt}</p>
            {author && (
              <ArticleAuthor
                author={author}
                publishDate={article.publishedAt}
                readTime={article.readTime}
              />
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="mb-8">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-auto rounded-lg"
              />
            </div>
            
            <article className="article-content">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </article>

            <div className="mt-8 flex flex-wrap items-center justify-between">
              <div>
                <p className="text-neutral-dark mb-2">Share this article:</p>
                <div className="flex gap-2">
                  <FacebookShareButton url={url}>
                    <Button size="icon" variant="outline">
                      <i className="fab fa-facebook text-primary"></i>
                    </Button>
                  </FacebookShareButton>
                  <TwitterShareButton url={url} title={article.title}>
                    <Button size="icon" variant="outline">
                      <i className="fab fa-twitter text-primary"></i>
                    </Button>
                  </TwitterShareButton>
                  <LinkedinShareButton url={url} title={article.title}>
                    <Button size="icon" variant="outline">
                      <i className="fab fa-linkedin text-primary"></i>
                    </Button>
                  </LinkedinShareButton>
                  <EmailShareButton url={url} subject={article.title}>
                    <Button size="icon" variant="outline">
                      <i className="fas fa-envelope text-primary"></i>
                    </Button>
                  </EmailShareButton>
                </div>
              </div>

              {author && (
                <div className="mt-4 sm:mt-0">
                  <p className="text-neutral-dark mb-2">Written by:</p>
                  <div className="flex items-center">
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="h-10 w-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-medium">{author.name}</p>
                      {author.bio && (
                        <p className="text-sm text-neutral-dark">
                          {author.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Advertisement */}
            <div className="mt-12 ad-placeholder">
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

          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <Tabs defaultValue="related">
                <TabsList className="w-full">
                  <TabsTrigger value="related" className="flex-1">Related</TabsTrigger>
                  <TabsTrigger value="popular" className="flex-1">Popular</TabsTrigger>
                </TabsList>
                <TabsContent value="related" className="mt-6">
                  <div className="space-y-4">
                    {relatedArticles?.slice(0, 3).map((relatedArticle) => (
                      <Link
                        key={relatedArticle.id}
                        href={`/articles/${relatedArticle.slug}`}
                      >
                        <div className="flex gap-4 p-4 rounded-lg hover:bg-neutral-light transition-all">
                          <img
                            src={relatedArticle.featuredImage}
                            alt={relatedArticle.title}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                          <div>
                            <h3 className="font-medium line-clamp-2">
                              {relatedArticle.title}
                            </h3>
                            <p className="text-sm text-neutral-dark mt-1">
                              {relatedArticle.readTime} min read
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="popular" className="mt-6">
                  <div className="space-y-4">
                    {relatedArticles?.slice(0, 3).map((relatedArticle) => (
                      <Link
                        key={relatedArticle.id}
                        href={`/articles/${relatedArticle.slug}`}
                      >
                        <div className="flex gap-4 p-4 rounded-lg hover:bg-neutral-light transition-all">
                          <img
                            src={relatedArticle.featuredImage}
                            alt={relatedArticle.title}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                          <div>
                            <h3 className="font-medium line-clamp-2">
                              {relatedArticle.title}
                            </h3>
                            <p className="text-sm text-neutral-dark mt-1">
                              {relatedArticle.readTime} min read
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

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
                        src="//rcm-na.amazon-adsystem.com/e/cm?o=1&p=12&l=ur1&category=healthpersonalcare&f=ifr&linkID=${import.meta.env.VITE_AMAZON_AFFILIATE_ID || 'placeholder-id'}&t=fitscience-20&tracking_id=fitscience-20" 
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

              {/* Newsletter Signup */}
              <div className="mt-8 p-6 bg-primary rounded-lg text-white">
                <h3 className="text-xl font-bold mb-4">
                  Subscribe to Our Newsletter
                </h3>
                <p className="mb-4">
                  Get the latest articles and insights delivered to your inbox.
                </p>
                <form className="space-y-4">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full p-3 rounded-md text-neutral-darkest"
                    required
                  />
                  <Button className="w-full bg-white text-primary hover:bg-neutral-light">
                    Subscribe
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArticleDetail;
