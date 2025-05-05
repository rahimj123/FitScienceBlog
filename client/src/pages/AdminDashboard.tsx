
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Article } from "@shared/schema";

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const { data: articles } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

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
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const articleData = {
                title: formData.get("title") as string,
                content: formData.get("content") as string,
                // Add other fields as needed
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
            />
            <Textarea
              name="content"
              defaultValue={selectedArticle?.content}
              placeholder="Article Content"
              rows={10}
            />
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
