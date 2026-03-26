import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

function sanitizeFileSegment(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

function fileExtensionFromNameOrMime(fileName: string, mimeType: string) {
  const rawExtension = path.extname(fileName).slice(1).toLowerCase();
  if (rawExtension) return rawExtension;

  const mimeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/webm": "webm",
    "audio/mpeg": "mp3",
    "audio/mp4": "m4a",
    "audio/wav": "wav",
    "audio/webm": "webm",
  };

  return mimeMap[mimeType] ?? "bin";
}

type GitHubMirrorConfig = {
  enabled: boolean;
  required: boolean;
  owner?: string;
  repo?: string;
  branch?: string;
  token?: string;
  basePath: string;
};

function getGitHubMirrorConfig(): GitHubMirrorConfig {
  return {
    enabled: process.env.GITHUB_MEDIA_MIRROR_ENABLED === "true",
    required: process.env.GITHUB_MEDIA_MIRROR_REQUIRED === "true",
    owner: process.env.GITHUB_MEDIA_REPO_OWNER,
    repo: process.env.GITHUB_MEDIA_REPO_NAME,
    branch: process.env.GITHUB_MEDIA_REPO_BRANCH || "main",
    token: process.env.GITHUB_MEDIA_REPO_TOKEN,
    basePath: process.env.GITHUB_MEDIA_REPO_BASE_PATH || "media-assets",
  };
}

async function uploadToGitHubMirror(
  relativePath: string,
  buffer: Buffer,
  mimeType: string,
) {
  const config = getGitHubMirrorConfig();
  if (!config.enabled) {
    return { remoteStorageUrl: null, storageProvider: "local" as const };
  }

  if (!config.owner || !config.repo || !config.token) {
    if (config.required) {
      throw new Error("GitHub media mirror is enabled but not fully configured.");
    }
    return { remoteStorageUrl: null, storageProvider: "local" as const };
  }

  const repoPath = `${config.basePath.replace(/^\/+|\/+$/g, "")}/${relativePath}`.replace(/\/+/g, "/");
  const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${repoPath}`;
  const response = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "FitScienceBlog-Media-Mirror",
    },
    body: JSON.stringify({
      message: `Add media asset ${path.basename(relativePath)}`,
      content: buffer.toString("base64"),
      branch: config.branch,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (config.required) {
      throw new Error(`GitHub mirror upload failed: ${errorText}`);
    }
    return { remoteStorageUrl: null, storageProvider: "local" as const };
  }

  return {
    remoteStorageUrl: `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${repoPath}`,
    storageProvider: "local+github" as const,
  };
}

async function deleteFromGitHubMirror(relativePath: string) {
  const config = getGitHubMirrorConfig();
  if (!config.enabled || !config.owner || !config.repo || !config.token) {
    return;
  }

  const repoPath = `${config.basePath.replace(/^\/+|\/+$/g, "")}/${relativePath}`.replace(/\/+/g, "/");
  const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${repoPath}?ref=${encodeURIComponent(config.branch || "main")}`;

  const existing = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "FitScienceBlog-Media-Mirror",
    },
  });

  if (!existing.ok) {
    return;
  }

  const existingJson = (await existing.json()) as { sha?: string };
  if (!existingJson.sha) return;

  await fetch(apiUrl, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "FitScienceBlog-Media-Mirror",
    },
    body: JSON.stringify({
      message: `Delete media asset ${path.basename(relativePath)}`,
      sha: existingJson.sha,
      branch: config.branch,
    }),
  });
}

export async function saveMediaFile(base64Data: string, fileName: string, mimeType: string) {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const uploadsDir = path.resolve(import.meta.dirname, "..", "uploads", "media-assets", year, month);
  await fs.mkdir(uploadsDir, { recursive: true });

  const extension = fileExtensionFromNameOrMime(fileName, mimeType);
  const safeBase = sanitizeFileSegment(path.basename(fileName, path.extname(fileName)) || "asset");
  const storedFileName = `${safeBase || "asset"}-${randomUUID()}.${extension}`;
  const buffer = Buffer.from(base64Data, "base64");
  const targetPath = path.join(uploadsDir, storedFileName);
  const relativePath = `media-assets/${year}/${month}/${storedFileName}`;

  await fs.writeFile(targetPath, buffer);

  try {
    const mirror = await uploadToGitHubMirror(relativePath, buffer, mimeType);
    return {
      storageUrl: `/uploads/${relativePath}`,
      relativePath,
      fileSizeBytes: buffer.byteLength,
      remoteStorageUrl: mirror.remoteStorageUrl,
      storageProvider: mirror.storageProvider,
    };
  } catch (error) {
    await fs.unlink(targetPath).catch(() => undefined);
    throw error;
  }
}

export async function deleteMediaFile(storageUrl: string | null | undefined, relativePath?: string | null) {
  if (storageUrl?.startsWith("/uploads/")) {
    const assetPath = path.resolve(import.meta.dirname, "..", storageUrl.slice(1));
    await fs.unlink(assetPath).catch(() => undefined);
  }

  if (relativePath) {
    await deleteFromGitHubMirror(relativePath).catch(() => undefined);
  } else if (storageUrl?.startsWith("/uploads/")) {
    const inferredRelativePath = storageUrl.replace(/^\/uploads\//, "");
    await deleteFromGitHubMirror(inferredRelativePath).catch(() => undefined);
  }
}
