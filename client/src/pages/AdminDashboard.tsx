
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Article } from "@shared/schema";

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState("");
  
  const { data: articles } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const validateImageUrl = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Invalid image URL");
      const contentType = response.headers.get("content-type");
      if (!contentType?.startsWith("image/")) throw new Error("URL is not an image");
      return true;
    } catch (error) {
      setImageError("Please enter a valid image URL");
      return false;
    }
  };

  const createArticle = useMutation({
    mutationFn: (newArticle: Partial<Article>) =>
      fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArticle),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    },
  });

  const updateArticle = useMutation({
    mutationFn: (article: Article) =>
      fetch(`/api/admin/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(article),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    },
  });

  const deleteArticle = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    },
  });

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Articles</h2>
          <div className="space-y-4">
            {articles?.map((article) => (
              <div key={article.id} className="p-4 border rounded-lg">
                <h3 className="font-medium">{article.title}</h3>
                <div className="mt-2 space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedArticle(article)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteArticle.mutate(article.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">
            {selectedArticle ? "Edit Article" : "Create Article"}
          </h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const title = formData.get("title") as string;
              const content = formData.get("content") as string;
              const excerpt = formData.get("excerpt") as string;
              const featuredImage = formData.get("featuredImage") as string;
              
              if (!await validateImageUrl(featuredImage)) return;
              
              const slug = title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
                
              const articleData = {
                title,
                content,
                excerpt,
                featuredImage,
                slug,
                readTime: Math.ceil(content.split(' ').length / 200), // Estimate reading time
                categoryId: 1, // Default category, you can add category selection
                authorId: 1, // Default author, you can add author selection
                isFeatured: false
              };

              if (selectedArticle) {
                updateArticle.mutate({ ...selectedArticle, ...articleData });
              } else {
                createArticle.mutate(articleData);
              }
            }}
            className="space-y-4"
          >
            <Input
              name="title"
              defaultValue={selectedArticle?.title}
              placeholder="Article Title"
              required
            />
            <Input
              name="featuredImage"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImageError("");
              }}
              placeholder="Featured Image URL"
              required
            />
            {imageError && <p className="text-red-500 text-sm">{imageError}</p>}
            <Textarea
              name="excerpt"
              defaultValue={selectedArticle?.excerpt}
              placeholder="Article Excerpt/Summary"
              rows={3}
              required
            />
            <Textarea
              name="content"
              defaultValue={selectedArticle?.content}
              placeholder="Article Content (Markdown supported)"
              rows={15}
              required
            />
            <div className="bg-neutral-100 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Content Tips:</h3>
              <ul className="text-sm space-y-1">
                <li>• Use markdown for formatting</li>
                <li>• For affiliate links: [Product Name](affiliate-link)</li>
                <li>• For images: ![Alt Text](image-url)</li>
                <li>• Use ### for section headers</li>
              </ul>
            </div>
            <Button type="submit">
              {selectedArticle ? "Update" : "Create"} Article
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
