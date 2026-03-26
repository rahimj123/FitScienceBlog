import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileAudio, FileImage, FileVideo, Trash2, Upload, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type DashboardRole = "coach" | "physician" | "admin";
type MediaType = "image" | "video" | "audio";

type MediaAsset = {
  id: number;
  title: string;
  mediaType: MediaType;
  originalFilename: string | null;
  storageUrl: string;
  remoteStorageUrl: string | null;
  storageProvider: string | null;
  thumbnailUrl: string | null;
  altText: string | null;
  description: string | null;
  mimeType: string | null;
  fileSizeBytes: number | null;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  exerciseFocus: string | null;
  bodyRegion: string | null;
  equipment: string | null;
  difficulty: string | null;
  tags: string[] | null;
  uploadedByRole: string | null;
  uploadedByUserId: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

type UploadPayload = {
  title: string;
  mediaType: MediaType;
  fileName: string;
  mimeType: string;
  dataBase64: string;
  altText?: string | null;
  description?: string | null;
  exerciseFocus?: string | null;
  bodyRegion?: string | null;
  equipment?: string | null;
  difficulty?: string | null;
  durationSeconds?: number | null;
  width?: number | null;
  height?: number | null;
  tags: string[];
  isPublished: boolean;
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

function loadImageMeta(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    image.onerror = () => {
      reject(new Error("Unable to load image metadata"));
      URL.revokeObjectURL(objectUrl);
    };
    image.src = objectUrl;
  });
}

function loadMediaDuration(file: File, kind: "audio" | "video") {
  return new Promise<number>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const media = document.createElement(kind);
    media.preload = "metadata";
    media.onloadedmetadata = () => {
      resolve(Math.round(media.duration || 0));
      URL.revokeObjectURL(objectUrl);
    };
    media.onerror = () => {
      reject(new Error("Unable to load media metadata"));
      URL.revokeObjectURL(objectUrl);
    };
    media.src = objectUrl;
  });
}

function formatBytes(value: number | null) {
  if (!value) return "Unknown size";
  const units = ["B", "KB", "MB", "GB"];
  let current = value;
  let index = 0;
  while (current >= 1024 && index < units.length - 1) {
    current /= 1024;
    index += 1;
  }
  return `${current.toFixed(current >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function inferMediaType(file: File): MediaType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  return "video";
}

export function MediaAssetManager({ role }: { role: DashboardRole }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"" | MediaType>("");
  const [form, setForm] = useState({
    title: "",
    mediaType: "image" as MediaType,
    altText: "",
    description: "",
    exerciseFocus: "",
    bodyRegion: "",
    equipment: "",
    difficulty: "",
    tags: "",
    isPublished: true,
  });

  const canManageMedia = role === "coach" || role === "physician" || role === "admin";

  const mediaAssetsQuery = useQuery<MediaAsset[]>({
    queryKey: ["media-assets-library", role],
    queryFn: async () => {
      const response = await fetch("/api/media-assets?published=all", {
        headers: { "x-user-role": role },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Unable to load media assets");
      }
      return response.json();
    },
    enabled: canManageMedia,
  });

  const uploadMutation = useMutation({
    mutationFn: async (payload: UploadPayload) => {
      const response = await fetch("/api/admin/media-assets/upload", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": role,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-assets-library", role] });
      setSelectedFile(null);
      setForm({
        title: "",
        mediaType: "image",
        altText: "",
        description: "",
        exerciseFocus: "",
        bodyRegion: "",
        equipment: "",
        difficulty: "",
        tags: "",
        isPublished: true,
      });
      toast({
        title: "Media uploaded",
        description: "The file and metadata were saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unable to upload media asset",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: number; isPublished: boolean }) => {
      const response = await fetch(`/api/admin/media-assets/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": role,
        },
        body: JSON.stringify({ isPublished }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-assets-library", role] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/media-assets/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "x-user-role": role },
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-assets-library", role] });
      toast({ title: "Media deleted" });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unable to delete media asset",
        variant: "destructive",
      });
    },
  });

  const filteredAssets = useMemo(() => {
    const assets = mediaAssetsQuery.data ?? [];
    if (!mediaTypeFilter) return assets;
    return assets.filter((asset) => asset.mediaType === mediaTypeFilter);
  }, [mediaAssetsQuery.data, mediaTypeFilter]);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (!file) return;
    setForm((current) => ({
      ...current,
      title: current.title || file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
      mediaType: inferMediaType(file),
      altText: current.altText || file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
    }));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ title: "Choose a file first", variant: "destructive" });
      return;
    }

    const dataUrl = await readFileAsDataUrl(selectedFile);
    const base64 = dataUrl.split(",")[1];

    let width: number | null = null;
    let height: number | null = null;
    let durationSeconds: number | null = null;

    if (form.mediaType === "image") {
      try {
        const imageMeta = await loadImageMeta(selectedFile);
        width = imageMeta.width;
        height = imageMeta.height;
      } catch {
        width = null;
        height = null;
      }
    }

    if (form.mediaType === "video" || form.mediaType === "audio") {
      try {
        durationSeconds = await loadMediaDuration(selectedFile, form.mediaType);
      } catch {
        durationSeconds = null;
      }
    }

    await uploadMutation.mutateAsync({
      title: form.title,
      mediaType: form.mediaType,
      fileName: selectedFile.name,
      mimeType: selectedFile.type || "application/octet-stream",
      dataBase64: base64,
      altText: form.altText || null,
      description: form.description || null,
      exerciseFocus: form.exerciseFocus || null,
      bodyRegion: form.bodyRegion || null,
      equipment: form.equipment || null,
      difficulty: form.difficulty || null,
      durationSeconds,
      width,
      height,
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      isPublished: form.isPublished,
    });
  };

  const renderPreview = (asset: MediaAsset) => {
    const previewUrl = asset.thumbnailUrl || asset.storageUrl;
    if (asset.mediaType === "image") {
      return <img src={previewUrl} alt={asset.altText ?? asset.title} className="h-48 w-full rounded-2xl object-cover" />;
    }
    if (asset.mediaType === "video") {
      return <video src={asset.storageUrl} poster={asset.thumbnailUrl ?? undefined} controls className="h-48 w-full rounded-2xl bg-black object-cover" />;
    }
    return <audio src={asset.storageUrl} controls className="mt-6 w-full" />;
  };

  return (
    <Card className="rounded-[1.75rem]">
      <CardHeader>
        <CardTitle className="text-2xl">Media library</CardTitle>
        <CardDescription>
          Upload exercise images, videos, and occasional audio clips for coaching and wellness content. Coach, physician, and admin roles can manage these assets.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4 rounded-[1.5rem] border border-primary/10 bg-[#fcfbf8] p-5">
            <div>
              <Label>Media file</Label>
              <Input
                type="file"
                accept="image/*,video/*,audio/*"
                className="mt-2 h-12 rounded-2xl"
                onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Selected: {selectedFile ? `${selectedFile.name} • ${formatBytes(selectedFile.size)}` : "No file selected"}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="mt-2 h-12 rounded-2xl"
                />
              </div>
              <div>
                <Label>Media type</Label>
                <select
                  value={form.mediaType}
                  onChange={(event) => setForm((current) => ({ ...current, mediaType: event.target.value as MediaType }))}
                  className="mt-2 h-12 w-full rounded-2xl border border-primary/10 bg-white px-3 text-sm"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Alt text</Label>
              <Input
                value={form.altText}
                onChange={(event) => setForm((current) => ({ ...current, altText: event.target.value }))}
                className="mt-2 h-12 rounded-2xl"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className="mt-2 min-h-24 rounded-2xl"
                placeholder="Brief instructions or context for the exercise asset."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Exercise focus</Label>
                <Input
                  value={form.exerciseFocus}
                  onChange={(event) => setForm((current) => ({ ...current, exerciseFocus: event.target.value }))}
                  className="mt-2 h-12 rounded-2xl"
                  placeholder="Mobility, strength, balance..."
                />
              </div>
              <div>
                <Label>Body region</Label>
                <Input
                  value={form.bodyRegion}
                  onChange={(event) => setForm((current) => ({ ...current, bodyRegion: event.target.value }))}
                  className="mt-2 h-12 rounded-2xl"
                  placeholder="Core, shoulders, lower body..."
                />
              </div>
              <div>
                <Label>Equipment</Label>
                <Input
                  value={form.equipment}
                  onChange={(event) => setForm((current) => ({ ...current, equipment: event.target.value }))}
                  className="mt-2 h-12 rounded-2xl"
                  placeholder="Bands, dumbbells, mat..."
                />
              </div>
              <div>
                <Label>Difficulty</Label>
                <Input
                  value={form.difficulty}
                  onChange={(event) => setForm((current) => ({ ...current, difficulty: event.target.value }))}
                  className="mt-2 h-12 rounded-2xl"
                  placeholder="Beginner, intermediate..."
                />
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <Input
                value={form.tags}
                onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                className="mt-2 h-12 rounded-2xl"
                placeholder="mobility, warmup, posture"
              />
              <p className="mt-2 text-xs text-muted-foreground">Separate tags with commas.</p>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-primary/10 bg-white px-4 py-3">
              <span className="text-sm font-medium">Publish immediately</span>
              <Button
                type="button"
                variant={form.isPublished ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setForm((current) => ({ ...current, isPublished: !current.isPublished }))}
              >
                {form.isPublished ? "Published" : "Draft"}
              </Button>
            </div>

            <Button className="rounded-full" onClick={handleUpload} disabled={uploadMutation.isPending || !selectedFile}>
              <Upload className="h-4 w-4" />
              {uploadMutation.isPending ? "Uploading..." : "Upload media"}
            </Button>
          </div>

          <div className="space-y-4 rounded-[1.5rem] border border-primary/10 bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Library preview</h3>
                <p className="text-sm text-muted-foreground">Browse assets already available to the website.</p>
              </div>
              <select
                value={mediaTypeFilter}
                onChange={(event) => setMediaTypeFilter(event.target.value as "" | MediaType)}
                className="h-11 rounded-2xl border border-primary/10 bg-[#fcfbf8] px-3 text-sm"
              >
                <option value="">All media</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
              </select>
            </div>

            <div className="text-sm text-muted-foreground">
              {mediaAssetsQuery.data?.length ?? 0} total assets
            </div>

            <div className="space-y-4">
              {filteredAssets.length ? (
                filteredAssets.map((asset) => (
                  <div key={asset.id} className="rounded-[1.25rem] border border-primary/10 bg-[#fcfbf8] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="rounded-full">
                        {asset.mediaType === "image" ? <FileImage className="mr-1 h-3.5 w-3.5" /> : null}
                        {asset.mediaType === "video" ? <FileVideo className="mr-1 h-3.5 w-3.5" /> : null}
                        {asset.mediaType === "audio" ? <FileAudio className="mr-1 h-3.5 w-3.5" /> : null}
                        {asset.mediaType}
                      </Badge>
                      <Badge variant={asset.isPublished ? "default" : "outline"} className="rounded-full">
                        {asset.isPublished ? "Published" : "Draft"}
                      </Badge>
                      {asset.exerciseFocus ? <Badge variant="outline" className="rounded-full">{asset.exerciseFocus}</Badge> : null}
                    </div>

                    <div className="mt-4">{renderPreview(asset)}</div>

                    <div className="mt-4">
                      <div className="text-base font-semibold text-foreground">{asset.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {asset.originalFilename ?? "Uploaded asset"} • {formatBytes(asset.fileSizeBytes)} • Uploaded by {asset.uploadedByRole ?? "unknown"}
                        {asset.storageProvider ? ` • ${asset.storageProvider}` : ""}
                      </div>
                      {asset.description ? <p className="mt-3 text-sm text-muted-foreground">{asset.description}</p> : null}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {asset.bodyRegion ? <span className="rounded-full bg-white px-3 py-1">{asset.bodyRegion}</span> : null}
                      {asset.equipment ? <span className="rounded-full bg-white px-3 py-1">{asset.equipment}</span> : null}
                      {asset.difficulty ? <span className="rounded-full bg-white px-3 py-1">{asset.difficulty}</span> : null}
                      {asset.durationSeconds ? <span className="rounded-full bg-white px-3 py-1">{asset.durationSeconds}s</span> : null}
                      {asset.tags?.map((tag) => (
                        <span key={tag} className="rounded-full bg-white px-3 py-1">{tag}</span>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => window.open(asset.storageUrl, "_blank", "noopener,noreferrer")}
                      >
                        {asset.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        Open file
                      </Button>
                      {asset.remoteStorageUrl ? (
                        <Button
                          variant="outline"
                          className="rounded-full"
                          onClick={() => window.open(asset.remoteStorageUrl!, "_blank", "noopener,noreferrer")}
                        >
                          Open GitHub copy
                        </Button>
                      ) : null}
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => updateMutation.mutate({ id: asset.id, isPublished: !asset.isPublished })}
                        disabled={updateMutation.isPending}
                      >
                        {asset.isPublished ? "Unpublish" : "Publish"}
                      </Button>
                      <Button
                        variant="destructive"
                        className="rounded-full"
                        onClick={() => deleteMutation.mutate(asset.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-primary/20 bg-[#fcfbf8] p-5 text-sm text-muted-foreground">
                  No media assets have been uploaded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
